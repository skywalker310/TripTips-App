var express = require('express');
var router = express.Router();
var passport = require('passport');

// User model
const User = require('../models/User');

// Login Page
router.get('/login', (req, res) => res.render('Login'));

// Register Page
router.get('/register', (req, res) => res.render('Register'));

// Register Handle
router.post('/register', (req, res) => {
    const { name, email, password, confirm_password } = req.body;

    console.log(name, email, password, confirm_password)
    let errors = [];

    if (!name || !email || !password || !confirm_password) {
        errors.push({ msg: 'Please enter all fields' });
    }

    if (password != confirm_password) {
        errors.push({ msg: 'Passwords do not match' });
    }

    if (password.length < 6) {
        errors.push({ msg: 'Password must be at least 6 characters' });
    }

    // Reload page and output error messages if encountered
    if (errors.length > 0) {
        console.log(errors)
        res.render('register', {
            errors,
            name,
            email,
            password,
            confirm_password
        });
    } else {
        // Validation Passed
        // Access users table and see if user exists.
        User.findOne({
            where: {
                email: email
            }
        }).then(function (user) {
            // If there are any errors, return the error
            if (user) {
                // User Exists
                errors.push({ msg: 'Email is already registered' });
                res.render('register', {
                    errors,
                    name,
                    email,
                    password,
                    confirm_password
                });
            } else {
                // Create New User
                // id already auto_increment
                const newUser = new User({
                    name,
                    email,
                    password
                });

                // Save User to database and redirect user to login page.
                newUser.save()
                    .then(user => {
                        req.flash('success_msg', 'Registered Successfully!');
                        res.redirect('/users/login');
                    })
                    .catch(err => console.log(err));
            }
        });
    };
});

// Login Handler
router.post('/login', (req, res, next) => {
    console.log(req.body);
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

router.post('/login',
  passport.authenticate('local', { successRedirect: '/dashboard',
                                   failureRedirect: '/users/login',
                                   failureFlash: true })
);
// Logout Handler
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'Successfully logged out.')
    res.redirect('/users/login')
});

module.exports = router;