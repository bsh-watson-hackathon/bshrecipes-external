'use strict';

const bodyParser = require('body-parser'),
    express = require('express');
var passport = require('passport');
var BoxStrategy = require('passport-box').Strategy;

var BOX_CLIENT_ID = "	krdgmv96izr0pfrg4ko71wtyvwzcda6n"
var BOX_CLIENT_SECRET = "V5HiXAlIQ4HSRANstoh8A8znOgi8esL0";


const routes = require('./routes');

const getApp = function (external) {
    const app = express();


    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(function (obj, done) {
        done(null, obj);
    });

    passport.use(new BoxStrategy({
            clientID: BOX_CLIENT_ID,
            clientSecret: BOX_CLIENT_SECRET,
            callbackURL: "https://hackbb.mybluemix.net/red/box-credentials/auth/callback"
        },
        function (accessToken, refreshToken, profile, done) {
            // asynchronous verification, for effect...
            process.nextTick(function () {

                // To keep the example simple, the user's Box profile is returned to
                // represent the logged-in user.  In a typical application, you would want
                // to associate the Box account with a user record in your database,
                // and return that user instead.
                return done(null, profile);
            });
        }
    ));

    app.use(passport.initialize());
    app.use(passport.session());

    passport.authenticate('box');

    app.use(bodyParser.json());
    app.get('/recipes', routes.getRecipes(external));

    return app;
};

module.exports = getApp;
