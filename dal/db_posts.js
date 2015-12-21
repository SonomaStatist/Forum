var mysql   = require('mysql');
var db  = require('./db_connections.js');

/* DATABASE CONFIGURATION */
var connection = mysql.createConnection(db.config);

exports.GetPostsByAll = function(callback) {
    connection.query('SELECT * FROM NewPostsToAll;',
        function (err, result) {
            if(err) {
                console.log(err);
                callback(true);
                return;
            }
            callback(false, result);
        }
    );
};

exports.GetPostsByTag = function(fetch_tag, callback) {
    console.log(fetch_tag);
    var query = "CALL NewPostsToAllByTag(?);";
    console.log(query);
    connection.query(query,
        [fetch_tag],
        function (err, result) {
            if(err) {
                console.log(err);
                callback(true);
                return;
            }
            callback(false, result[0]);
        }
    );
};

exports.GetPostAndComments = function(post_id, callback) {
    console.log(post_id);
    var query = "CALL GetPostAndComments(?);";
    connection.query(query, [post_id], function (err, result) {
        if (err) {
            console.log(err);
            callback(true);
            return;
        }
        callback(false, {
            post: result[0][0],
            comments: result[1]
        })
    });
};

exports.GetPostAndCommentContext = function(post, callback) {
    console.log(post);
    var query = "CALL GetPostAndCommentContext(?,?);";
    connection.query(query, [post.post_id, post.comment_id], function (err, result) {
        if (err) {
            console.log(err);
            callback(true);
            return;
        }
        console.log(result);
        callback(false, {
            post: result[0][0],
            comments: result[1]
        })
    });
};

exports.GetPostsByFollowed = function (user_id, callback) {
    console.log(user_id);
    var query = "CALL NewPostsByFollowed(?);";
    console.log(query);
    connection.query(query,
        [user_id],
        function (err, result) {
            if(err) {
                console.log(err);
                callback(true);
                return;
            }
            console.log(result[0]);
            callback(false, result[0]);
        }
    );
};

exports.SubmitPost = function (post, callback) {
    console.log(post);
    var query = "CALL AddPost(?,?,?,?);";
    var query_data = [post.user_id, post.title, post.link, post.content];
    connection.query(query, query_data, function (err, result) {
        if (err) {
            console.log(err);
            callback(true);
            return;
        }
        console.log(result);
        callback(false, result[0][0].post_id);
    });
};

exports.SubmitPostTags = function (post, callback) {
    console.log(typeof post.post_id);
    var query = "INSERT INTO PostTags (pid, tag) VALUES ?;";
    var query_data = [[]];
    for (var i = 0; i < post.tags.length; i++) {
        query_data[0][i] = [post.post_id, post.tags[i]];
    }
    console.log(query_data);
    connection.query(query, query_data, function (err, result) {
        if (err) {
            console.log(err);
            callback(true);
            return;
        }

        callback(false, result);
    });
};

exports.SubmitPostReply = function (reply, callback) {
    var query = "CALL AddPostReply(?,?,?);";
    var query_data = [reply.post_id, reply.user_id, reply.comment_body];
    connection.query(query, query_data, function (err, result) {
        if (err) {
            console.log(err);
            callback(true);
            return;
        }
        console.log("submit post reply database result");
        console.log(result);
        callback(false, result[0][0].reply_id);
    });
};

exports.SubmitCommentReply = function (reply, callback) {
    var query = "CALL AddCommentReply(?,?,?,?);";
    var query_data = [reply.post_id, reply.parent_id, reply.user_id, reply.comment_body];
    connection.query(query, query_data, function (err, result){
        if (err) {
            console.log(err);
            callback(true);
            return;
        }
        callback(false, result[0][0].reply_id);
    });
};