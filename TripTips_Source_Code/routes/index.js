var express = require('express');
var router = express.Router();
var {ensureAuthenticated} = require('../config/auth');

// Render Welcome Page (welcome.ejs)
router.get('/', (req, res) => res.render('welcome'));

// Render Dashboard Page (dashboard.ejs)
router.get('/dashboard', ensureAuthenticated, (req, res) =>
    res.render('dashboard', {
        name: req.user.name,
        userid: req.user.id
    }));

module.exports = router;
