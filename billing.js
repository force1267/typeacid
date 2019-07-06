const db = require('./db');

var apps = {}


function billInterval() {
    for(var app of apps) {
        db.query("")
    }
}


function bill(app, item) {
    if(!apps[app]) {
        apps[app] = {};
    }

    if(apps[app][item] == undefined) {
        apps[app][item] = 0;
    }

    return apps[app][item] ++;
}

function billing(req, res, next) {
    var app;
    if(req.appid) {
        app = req.appid
    }

    req.bill = function billByAppId(item) {
        return bill(app, item);
    }

    // if(app) {
    //     return next();
    // } else {
    //     console.error("billing> no appid")
    // }
}


module.exports = billing;