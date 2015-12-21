var express = require('express');
var router = express.Router();
var postsDal = require('../dal/db_posts');
var groupsDal = require('../dal/db_groups');

router.get('/post', function (res, req) {
    console.log('submitting post');
    //console.log(req);
    console.log('checking for session');
    console.log(req.req.session.user);
    res.res.render('posts/submit_post.ejs', {username: req.req.session.user.username});
});

router.post('/post/confirm', function (response, request) {
    // note: hand to god, I have no idea what happened here but this function WILL NOT work.
    //      the following two lines represent the duct tape and bailing twine that I've
    //      resorted to after nearly three days of diagnosis.
    var req = request.req;
    var res = response.res;
    if (req.body.title === '') {
        res.render('posts/submit_post.ejs', {msg: "title must not be blank"})
    } else {
        postsDal.SubmitPost({
            user_id: req.session.user.user_id,
            title: req.body.title,
            link: req.body.link,
            content: req.body.content,
            tags: req.body.tags.split(' ')
        }, function (err, post_id) {
            if (err) {
                res.status(err.status || 500);
                res.render('error', {
                    message: err.message,
                    error: err
                });
            } else {
                res.redirect('/post/' + post_id);
            }
        });
    }
});

router.post('/postreply', function (req, res) {
    console.log("post reply");
    console.log(req.session.user);
    console.log(req.body);
    postsDal.SubmitPostReply({
        post_id: req.body.post_id,
        comment_body: req.body.comment_body,
        user_id: req.session.user.user_id
    }, function (err, reply_id) {
        if (err) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        } else {
            res.redirect('/post/' + req.body.post_id + '/comment/' + reply_id);
        }
    });
});

router.post('/commentreply', function (req, res) {
    postsDal.SubmitCommentReply({
        post_id: req.body.post_id,
        comment_body: req.body.comment_body,
        parent_id: req.body.parent_id,
        user_id: req.session.user.user_id
    }, function (err, reply_id) {
        if (err) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        } else {
            res.redirect('/post/' + req.body.post_id + '/comment/' + reply_id);
        }
    });
});

router.post('/posttags', function (req, res) {
    postsDal.SubmitPostTags({
        post_id: parseInt(req.body.post_id),
        tags: req.body.tags.split(' ')
    }, function (err, result) {
        if (err) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        } else {
            res.redirect('/post/' + req.body.post_id);
        }
    });
});

router.post('/message', function (req, res) {
    console.log('req body');
    console.log(req.body);
    groupsDal.SubmitGroupMessage({
        user_id: req.body.user_id,
        groupname: req.body.groupname,
        message_body: req.body.message_body,
        tag: req.body.tag
    }, function (err, result) {
        if (err) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        } else {
            res.redirect('/groups/' + req.body.groupname + '/messages');
        }
    });
});

module.exports = router;
