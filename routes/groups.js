var express = require('express');
var router = express.Router();
var groupsDal   = require('../dal/db_groups');

router.get('/all', function (req, res) {
    groupsDal.GetAllGroups(function (err, groups) {
        if (err) {
            res.status(err.status || 500);
            res.render('error',{
                message: err.message,
                error: err
            });
        } else {
            res.render('groups/all_groups.ejs', {
                rs: groups,
                username: req.session.user.username
            });
        }
    });
});

router.get('/:groupname', function (req, res) {
    groupsDal.GetPostsToGroup(req.params.groupname, function (err, posts) {
        if (err) {
            res.status(err.status || 500);
            res.render('error',{
                message: err.message,
                error: err
            });
        } else {
            res.render('groups/group_posts.ejs', {
                rs: posts,
                groupname: req.params.groupname,
                username: req.session.user.username
            });
        }
    });
});

router.get('/:groupname/messages', function (req, res) {
    groupsDal.GetGroupMessages({
        groupname: req.params.groupname,
        tag: "all"
    }, function (err, messages) {
        if (err) {
            res.status(err.status || 500);
            res.render('error',{
                message: err.message,
                error: err
            });
        } else {
            res.render('groups/group_messages', {
                user_id: req.session.user.user_id,
                username: req.session.user.username,
                groupname: req.params.groupname,
                rs: messages
            });
        }
    });
});

router.get('/:groupname/curator', function (req, res) {
    groupsDal.GetPostsToGroupByCurator({
        groupname: req.params.groupname,
        curator: req.query.curator
    }, function (err, posts) {
        if (err) {
            res.status(err.status || 500);
            res.render('error',{
                message: err.message,
                error: err
            });
        } else {
            res.render('groups/group_posts.ejs', {
                rs: posts,
                groupname: req.params.groupname,
                username: req.session.user.username
            });
        }
    });
});

router.get('/:groupname/curators', function (req, res) {
    groupsDal.GetGroupCurators(req.params.groupname, function (err, curators) {
        res.send(curators);
    });
});

module.exports = router;
