const cluster = require('cluster')
require('dotenv').config();

if(cluster.isMaster) {
    const spawn = () => cluster.fork().on('exit', spawn);
    for(var i = 0; i < require('os').cpus().length; i++) {
        spawn();
    }
} else if(cluster.isWorker) {
    const express = require('express')
    const vhost = require('vhost')
    const body = require('body-parser')
    const helmet = require('helmet')
    const cookieSession = require('cookie-session')
    const passport = require('passport')
    const db = require('./db');
    const billing = require("./billing");
    
    const {HOST, PORT, NS_NUMBER, COOKIE_SECRET} = process.env;
    const app = express();

    app.use(helmet())
    app.use(body.json())
    app.use(body.urlencoded({ extended: false }))

    app.use(cookieSession({
        name: COOKIE_SECRET,
        keys: [
            process.env.COOKIE_SECRET
        ],
        maxAge: 1 * 60 * 60 * 1000, // 24 hrs
    }));



    app.set('views', './')
    app.set("view engine", "pug");

    // find app by api-key
    app.use((req, res, next) => {
        var apikey =  req.headers.apikey;
        if (apikey) db.query("SELECT apps.* FROM apps WHERE apps.apikey = $1", [apikey], (err, ans) => {
            if(err) {
                return res.json(err)
            } else {
                var app = ans.rows[0];
                if(app) {
                    req.appname = app.name + "." + app.owner;
                    req.appid = app.id;
                }
                return next();
            }
        }); else return next();
    })

    // find app by host
    app.use((req, res, next) => {
        if(req.headers.apikey) {
            return next();
        } else {
            const subs = req.hostname.split('.');
            const host = HOST.split('.');
            if(subs[0] == 'v1' && subs[1] == 'api') { // TODO : apiversions.include(subs[0])
                return next();
            }
            if(req.hostname.includes(HOST) && req.hostname.slice(req.hostname.indexOf(HOST)) == HOST) {
                if(req.subdomains.length > 1) {
                    db.query("SELECT apps.* FROM apps WHERE apps.name = $1 AND apps.owner = $2", [req.subdomains[2], req.subdomains[1]], (err, ans) => {
                        if(err) {
                            console.error(err);
                            return res.status(500).send("500: Internal Server Error !");
                        }
                        if(ans && ans.rows && ans.rows[0]) {
                            req.appname = ans.rows[0].name + "." + ans.rows[0].owner;
                            req.appid = ans.rows[0].id;
                            return next();
                        }
                    })
                } else {
                    req.appname = "typeacid.0";
                    req.appid = 0;
                    return next();
                }
            } else db.query("SELECT apps.* FROM apps,domains WHERE domains.name = $1 AND domains.app=apps.id", [req.hostname], (err, ans) => {
                if(err) {
                    console.error(err);
                    return res.status(500).send("500: Internal Server Error !");
                }
                if(ans && ans.rows && ans.rows[0]) {
                    req.appname = ans.rows[0].name + "." + ans.rows[0].owner;
                    req.appid = ans.rows[0].id;
                    return next();
                }
            })
        }
    })

    require('./auth.init.js') // init auth
    app.use(passport.initialize());
    app.use(passport.session());

    app.use(billing);

    app.use(vhost(`v1.api.${HOST}`, require("./api")))
    
    // serve apps by typeacid subdomains
    app.use(vhost(`*.*.app.${HOST}`, require("./serve")))
    app.use(vhost(`*.*.*.app.${HOST}`, require("./serve")))
    // serve apps by domains
    app.use(require("./serve"));

    // app.use(vhost(`ns${NS_NUMBER}.${HOST}`, require("./ns"))) // TODO implement external ns or use arvan dns

    app.listen(PORT);
    console.log(`worker listening to ${PORT}`) // TODO remove
}