var express = require('express');
var router = express.Router();
var postsDal   = require('../dal/db_posts');

router.get('/', function(req, res) {
    console.log(req.session);
    postsDal.GetPostsByAll(function (err, result) {
        if (err) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        } else if (req.session.user === undefined) {
            res.render('posts/post_listing.ejs', {title: "Forum!", rs: result});
        } else {
            res.render('posts/post_listing.ejs', {title: "Forum!", username: req.session.user.username, rs: result});
        }
    });
});

router.get('/tag/:fetch_tag', function (req, res) {
    console.log("tag = " + req.params.fetch_tag);
    postsDal.GetPostsByTag(req.params.fetch_tag, function (err, result) {
        if (err) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        }

        res.render('posts/post_listing.ejs', {title: "Forum!", rs: result, fetch_tag: req.params.fetch_tag});
    });
});

module.exports = router;
