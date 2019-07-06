const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const db = require('../db');


passport.serializeUser(function(user, done) {
    done(null, user.id);
});
  
passport.deserializeUser(function(id, done) {
    db.query("SELECT * FROM users WHERE id = $1", [id], (err, res) => {
        const user = res && res.rows && res.rows[0] ? res.rows[0] : false;
        if(user) delete user.password;
        done(err, user);
    });
});

passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
    }, function(email, password, done) {
        email = JSON.parse(email);
        const app = email.appid;
        email = email.email;
        db.query("SELECT * FROM users WHERE email = $1 AND app = $2", [email, app], (err, res) => {
            if (err) { return done(err); }
            const user = res.rows[0];
            if (!user) {
                return done(null, false); // incorrect email
            }
            compare(password, user.password, (err, same) => {
                if(err) {
                    return done(err)
                } else if(!same) {
                    return done(null, false); // incorrect password
                } else {
                    delete user.password;
                    return done(null, user);
                }
            });
        });
    }
));

// TODO implement email verification
// TODO implement sms verification
passport.use('local-register', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
    }, function(email, password, done) {
        email = JSON.parse(email);
        const app = email.appid;
        email = email.email;
        db.query("SELECT * FROM users WHERE email = $1 AND app = $2", [email, app], function (err, res) {
            const {rows} = res;
            if (err)
                return done(err);
            if (rows.length) {
                return done(null, false);
            } else {
                // if there is no user with that email
                // create the user
                code(password, function(err, saltdk) {
                    // saltdk contains the salt and hash (salt + hash) so we dont need to store salt
                    // store saltdk in database
                    db.query("INSERT INTO users (email, password, app) VALUES ($1, $2, $3)", [email, saltdk, app], function (err, res) {
                        db.query("SELECT * FROM users WHERE email = $1 AND app = $2", [email, app], (err, res) => {
                            const user = res.rows[0];
                            delete user.password;
                            return done(null, user);
                        })
                   })
                });
            }
        });
    }
))