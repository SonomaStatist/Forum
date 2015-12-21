var express = require('express');
var router = express.Router();
var postsDal   = require('../dal/db_posts');

router.get('/:post_id', function (req, res) {
    postsDal.GetPostAndComments(req.params.post_id, function (err, result) {
        if (err) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        }

        var opts = {rs: result};
        if (req.session.user !== undefined) {
            opts.username = req.session.user.username;
            opts.user_id = req.session.user.user_id;
        }
        res.render('posts/post_comments.ejs', opts);
    });
});

router.get('/:post_id/comment/:comment_id', function (req, res) {
    var post = {
        post_id: req.params.post_id,
        comment_id: req.params.comment_id
    };
    postsDal.GetPostAndCommentContext(post, function (err, result) {
        if (err) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        }

        var opts = {rs: result};
        if (req.session.user !== undefined) {
            opts.username = req.session.user.username;
        }
        res.render('posts/post_comments.ejs', opts);
    });
});

module.exports = router;
