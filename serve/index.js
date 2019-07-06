const path = require('path')
const express = require('express')
const body = require('body-parser')
const app = new express.Router();
const db = require('../db');

app.use(body.urlencoded({extended: false}));
app.use(body.json());

app.get("*", (req, res) => {
    
    var subs = req.hostname.split('.');
    var sub;
    if(subs.length == 3 || subs.length == 2) {
        sub = req.subdomains[0];
    } else if(req.vhost.length == 2) {
        sub = "www";
    } else if(req.vhost.length == 3) {
        sub = req.vhost[0];
    }

    var url = path.normalize(req.url);
    url = url[url.length - 1] == "/" ? url.slice(0,url.length - 1) : url;

    var p = "./apps/" + req.appname + "/" + (sub || "www") + "/" + url;
    p = path.join(process.cwd(), path.normalize(path.join("/", p))).split("?")[0]

    // TODO if path exists ...

    if(path.extname(p) == "") {
        return res.sendFile(path.join(p, 'index.html')) // TODO if exists and ...
    }

    if(path.basename(p)[0] == ".") { // if it was a dotfile
        return res.status(404).send("404: Not Found !");
    }

    if(path.extname(p) == ".pug") { // if it was a dynamic (.dy, .mst, .pug)
        // TODO implement dynamic template engine (mustache and pug)

        return res.render(p, {
            app: req.appname.split(".")[0],
            user: req.user
        }); // TODO if exists
        // return res.status(501).send("501: Not Implemented !");
    }

    return res.sendFile(p); // TODO if exists and ...
})

module.exports = app;