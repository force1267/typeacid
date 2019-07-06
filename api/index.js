const cluster = require('cluster')
const path = require('path')
const express = require('express')
const body = require('body-parser')
const api = new express.Router();
const kvs = require("./kvs")
const db = require('../db');

// api.use(get app name from headers)
api.use(body.urlencoded({extended: false}));
api.use(body.json());

var kvsBin = {};

// api.use(req=>{console.log("api>");req.next()})

api.get("/", (req, res) => {
    res.json({
        auth: {
            get: {
                response: "empty json",
            },
            login:{
                post: {
                    body: {
                        email: "user email",
                        password: "user's password"
                    },
                    type: "json, url-encoded"
                }
            },
            register:{
                post: {
                    body: {
                        email: "user email",
                        password: "user's password"
                    },
                    type: "json, url-encoded"
                }
            },
            logout:{
                all: {
                    body: {},
                    type: "json, url-encoded"
                }
            },
            user: {
                get: {
                    query: {
                        "/user": {
                            response: "current user as json"
                        }
                    }
                }
            },
            user: {
                get: {
                    query: {
                        "/user/:page/:limit": {
                            response: "users of page `:page` of current app in pages of `:limit` users as json array",
                            access: "13: admin"
                        }
                    }
                }
            }
        },
        kvs: {
            post: {
                headers: {
                    apikey: "your app's apikey"
                },
                body: {
                    query: "query name",
                    args: "query args array",
                    type: "json, url-encoded"
                },
                response: "query answer array as json"
            }
        },
    })
})

api.post("/kvs", needapp, async (req, res) => {
    const app = { id: req.appid, name: req.appname };
    const query = { name: req.body.query, args: req.body.args };
    if(!kvsBin[app.name]) {
        try {
            kvsBin[app.name] = await kvs.compile(path.join(__dirname, `../apps/${app.name}/.database`))
        } catch(err) {
            delete kvsBin[app.name];
            return res.json(err);
        }
    }
    var data = req.user ? {
        access: req.user.access,
        email: req.user.eamil,
        username: req.user.username,
        user : 1,
    } : {
        access: -1,
        email: "",
        username: "",
        user : 0,
    }
    var ctx = new kvs.QueryContext(kvsBin[app.name], data, new kvsDBDriver(app.id), { max_call: 25, max_call_stack: 15 });
    try {
        var ret = await ctx.run(query.name, query.args || {});
        return res.json(ret)
    } catch(err) {
        console.log(err)
        return res.status(503).json(err);
    }
})

api.use('/auth', needapp, require('./auth'))

// api.use('/blog')
// api.use('/shop')
// api.use('/bots')
// api.use('/mail')
// api.use('/chat')
// api.use('/sms')
// api.use('/payment')

api.all("*", req=>req.res.send("404: Not Found !"))

module.exports = api;


function needapp(req, res, next) {
    if(req.appname) {
        return next();
    } else {
        return res.status(400).send("4xx : Bad Request !") // TODO
    }
}

const access = (level, redirect = false) => (req, res, next) => {
    if(!req.user) {
        return refirect ? 
        res.status(401).redirect(redirect)
        : res.status(401).send("401: Unauthorized !");
    }
    if(req.user.access < level) {
        return refirect ? 
        res.status(403).redirect(redirect)
        : res.status(403).send("403: Forbidden !");
    }
}

class kvsDBDriver {
    constructor(appid) {
        this.appid = appid;
    }
    clone() {
        return new kvsDBDriver(this.appid);
    }
    async read(key) {
        var appid = this.appid;
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM kvs WHERE key = $1 AND app = $2", [key, appid], (err, ans) => {
                if(err) {
                    return reject(err);
                } else if(ans && ans.rows && ans.rows[0]) {
                    return resolve(ans.rows[0].value);
                } else {
                    return resolve();
                }
            })
        })
    }
    async write(key, value) {
        var appid = this.appid;
        return new Promise((resolve, reject) => {
            db.query("INSERT INTO kvs(app, key, value) values($1, $2, $3)", [appid, key, value], (err, ans) => {
                if(err) {
                    if(err.code == 23505) { // duplicate
                        db.query("UPDATE kvs SET value = $3 WHERE key = $1 AND app = $2", [key, appid, value], (err, ans) => {
                            if(err) {
                                return reject(err);
                            } else if(ans && ans.rows && ans.rows[0]) {
                                return resolve(ans.rows[0].value);
                            } else {
                                return resolve();
                            }
                        })
                    } else {
                        return reject(err);
                    }
                } else if(ans && ans.rows && ans.rows[0]) {
                    return resolve(ans.rows[0].value);
                } else {
                    return resolve();
                }
            })
        })
    }
    async remove(key) {
        var appid = this.appid;
        return new Promise((resolve, reject) => {
            db.query("DELETE FROM kvs WHERE key = $1 AND app = $2", [key, appid], (err, ans) => {
                if(err) {
                    return reject(err);
                } else if(ans && ans.rows && ans.rows[0]) {
                    return resolve(ans.rows[0].value);
                } else {
                    return resolve(null);
                }
            })
        })
    }
}