var LocalStrategy = require('passport-local').Strategy;
var mysql = require('mysql');

// Credientials for MySQL Database
var credentials = require('../config/key.json');
var HOST = credentials.host;
var USER = credentials.user;
var PASSWORD = credentials.password;
var DATABASE = credentials.database;

var connection = mysql.createConnection({
    host: HOST,
    user: USER,
    password: PASSWORD
});

connection.query('USE ' + DATABASE);

// Reference: http://www.passportjs.org/docs/
module.exports = function (passport) {
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        connection.query("select * from users where id = " + id, function (err, rows) {
            done(err, rows[0]);
        });
    });

    // Handle Login Logic
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    },
        function (req, email, password, done) { // callback with email and password from our form
            // Match User in Database
            connection.query("SELECT * FROM `users` WHERE `email` = '" + email + "'", function (err, rows) {
                if (err) {
                    console.log(err)
                    return done(null, false, { message: 'Internal Server Error' });
                }

                // Check if Email exists in database
                if (!rows.length) {
                    return done(null, false, { message: 'Email is not registered' });
                }

                // Check if password matches the one found in the database (Maybe encrypt this as a future goal)
                if (!(rows[0].password == password))
                    return done(null, false, { message: 'Password is incorrect.' });

                // all is well, return successful user
                return done(null, rows[0]);
            });
        }));
};

