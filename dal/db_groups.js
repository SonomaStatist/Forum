var mysql   = require('mysql');
var db  = require('./db_connections.js');

/* DATABASE CONFIGURATION */
var connection = mysql.createConnection(db.config);

exports.GetPostsToGroup = function (group_name, callback) {
    var query = "CALL NewPostsToGroup(?);";
    var query_data = [group_name];
    connection.query(query, query_data, function (err, result) {
        if (err) {
            console.log(err);
            callback(true);
            return;
        }
        console.log(result);
        callback(false, result[0]);
    })
};

exports.GetPostsToGroupByCurator = function (curator, callback) {
    console.log(curator);
    var query = "CALL NewPostsToGroupByCurator(?,?);";
    var query_data = [curator.groupname, curator.curator];
    connection.query(query, query_data, function (err, result) {
        if (err) {
            console.log(err);
            callback(true);
            return;
        }
        console.log(result);
        callback(false, result[0]);
    })
};

exports.GetAllGroups = function (callback) {
    var query = "SELECT gname AS groupname FROM Groups;";
    connection.query(query, function (err, result) {
        if (err) {
            console.log(err);
            callback(true);
            return;
        }
        console.log(result);
        callback(false, result);
    });
};

exports.GetGroupMessages = function (group_info, callback) {
    var query = "CALL NewGroupMessagesByTag(?,?);";
    var query_data = [group_info.groupname, group_info.tag];
    connection.query(query, query_data, function (err, result) {
        if (err) {
            console.log(err);
            callback(true);
            return;
        }
        callback(false, result[0]);
    })
};

exports.GetGroupCurators = function (groupname, callback) {
    var query = "CALL GetGroupCurators(?);";
    var query_data = [groupname];
    connection.query(query, query_data, function (err, result) {
        if (err) {
            console.log(err);
            callback(true);
            return;
        }
        console.log(result);
        callback(false, result[0]);
    })
};

exports.SubmitNewGroup = function (group_name, callback) {
    var query = "INSERT INTO Groups (gname) VALUES (?)";
    var query_data = [group_name];
    connection.query(query, query_data, function (err, result) {
        if (err) {
            console.log(err);
            callback(true);
            return;
        }
        callback(false, result);
    });
};

exports.AddGroupMember = function (user, callback) {
    var query = "CALL AddMemberToGroup(?,?)";
    var query_data = [user.group_name, user.user_id];
    connection.query(query, query_data, function (err, result) {
        if (err) {
            console.log(err);
            callback(true);
            return;
        }
        callback(false, result[0]);
    });
};

exports.AddGroupCurator = function (curator, callback) {
    var query = "CALL AddGroupCurator(?,?,?);";
    var query_data = [curator.group_name, curator.user_id, curator.tag];
    connection.query(query, query_data, function (err, result) {
        if (err) {
            console.log(err);
            callback(true);
            return;
        }
        callback(false, result[0]);
    })
};

exports.SubmitGroupMessage = function (message, callback) {
    var query = "CALL AddGroupMessage(?,?,?,?);";
    var query_data = [
        message.groupname,
        message.user_id,
        message.message_body,
        message.tag
    ];
    connection.query(query, query_data, function (err, result) {
        if (err) {
            console.log(err);
            callback(true);
            return;
        }
        callback(false, result);
    });
};

exports.SubmitGroupMessageTags = function (message, callback) {
    var query = "INSERT INTO GroupMessageTags (mid, tag) VALUES ?;";
    var query_data = [];
    for (var i = 0; i < message.tags.length; i++) {
        query_data[i] = [message.message_id, message.tags[i]];
    }
    connection.query(query, query_data, function (err, result) {
        if (err) {
            console.log(err);
            callback(true);
            return;
        }
        callback(false, result);
    });
};
