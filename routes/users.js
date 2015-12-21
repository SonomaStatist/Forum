var express = require('express');
var router = express.Router();

var usersDal = require('../dal/db_users');

/* GET users listing. */
router.get('/:username', function(req, res) {
    usersDal.GetPostsFromUser(req.params.username, function (err, result) {
        if (err) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        } else {
            res.render('users/user_page', {
                username: req.session.user.username,
                user: {
                    username: req.params.username
                },
                rs: result
            });
        }
    });
});

module.exports = router;
