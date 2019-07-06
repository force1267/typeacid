const passport = require('passport');
const db = require('../db');

const auth = new require('express').Router();

const authenticate = strategy => (req, res, next) => {
    // why req.body.email has to be string ?!
    // auth stops if it's object
    req.body.email = req.body.email && JSON.stringify({ appid: req.appid, email: req.body.email})
    console.log(req.body.email)
    return passport.authenticate(strategy)(req, res, next);
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
auth.get("/", (req, res) => {
    res.json({})
})
auth.post('/login', authenticate('local-login'), (req, res) => {
    res.json(req.user)
});

auth.post('/register', authenticate('local-register'), (req, res) => {
    // TODO add verification step
    res.json(req.user)
});

auth.all('/logout', (req, res) => {
    req.logout();
    res.json({});
});

// users of an app
auth.get("/user", req => req.res.json(req.user));
auth.get("/users/:page/:limit", (req, res, next) => { // TODO only accessed by typeacid user owner of app
    db.query("SELECT * FROM users WHERE app = $1 ORDER BY id LIMIT $2 OFFSET $3", [req.appid, req.params.limit, (req.params.page - 1)*req.params.limit], (err, ans) => {
        res.json(ans.rows.map(row => { delete row.password; return row; }))
    });
});

// TODO implement
// auth.delete("/user") body: {user:{id||email}}
// auth.post("/user/email") body: {user:{id||email}, email}
// auth.post("/user/access") body: {user:{id||email}, access}
// auth.post("/user/password") body: {user:{id||email}, password}

module.exports = auth;


const crypto = require('crypto');

function code(password, cb) {
    const salt = crypto.randomBytes(16).hexSlice()
    crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, dk) => cb(err, salt + dk.toString()))
}

function compare(password, saltdk, cb) {
    const salt = saltdk.slice(0, 32);
    const dk = saltdk.slice(32);
    crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, sdk) => cb(err, sdk.toString() === dk))
}