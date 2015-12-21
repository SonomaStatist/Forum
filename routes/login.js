var express = require('express');
var router = express.Router();
var usersDal   = require('../dal/db_users');

router.get('/', function (req, res) {
    res.render('authenticate/login_page.ejs', {});
});

router.post('/user', function (req, res) {
    usersDal.LoginAsUser({ username: req.body.username, password: req.body.password }, function (err, result) {
        if (err) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        } else if (result.err) {
            res.render('authenticate/login_page.ejs', {msg: result.message});
        } else {
            req.session.user = result;
            res.redirect('/');
        }
    });
});

router.post('/user/new', function (req, res) {
    var passwd = req.body.password;
    var conf_passwd = req.body.confirm_password;
    var uname = req.body.username;

    if (uname.length == 0) {
        res.render('authenticate/new_user_page.ejs', {msg: "username must not be blank"});
    } else if (uname.length > 12) {
        res.render('authenticate/new_user_page.ejs', {msg: "username must be no longer than 12 characters"});
    } else if (passwd.length == 0) {
        res.render('authenticate/new_user_page.ejs', {msg: "password must not be blank"});
    } else if (passwd !== conf_passwd) {
        res.render('authenticate/new_user_page.ejs', {msg: "passwords do not match"});
    } else {
        usersDal.CreateNewUser({username: uname, password: passwd}, function (err, result) {
            if (err) {
                res.status(err.status || 500);
                res.render('error', {
                    message: err.message,
                    error: err
                });
            } else if (result.err) {
                res.render('authenticate/new_user_page.ejs', {msg: result.message});
            } else {
                req.session.user = result;
                res.redirect('/');
            }
        });
    }
});

module.exports = router;