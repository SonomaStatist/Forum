var mysql   = require('mysql');
var db  = require('./db_connections.js');

/* DATABASE CONFIGURATION */
var connection = mysql.createConnection(db.config);

exports.LoginAsUser = function (login, callback) {
    if (!login.username || !login.password) {
        console.log(login);
        callback({ message: "invalid username and password" });
        return;
    }
    var query = "SELECT uid AS user_id, uname AS username, passwd AS password " +
        "FROM Users U WHERE U.uname=? AND U.passwd=?;";
    console.log(query);
    connection.query(query, [login.username, login.password], function (err, result) {
        if (err) {
            console.log(err);
            console.log(result);
            callback(true);
        } else if (result.length == 0) {
            callback(false, {err: true, message: "Invalid username and password."});
        } else {
            console.log(result);
            callback(false, result[0]);
        }
    });
};

exports.CreateNewUser = function (login, callback) {
    var query = "SELECT * FROM Users WHERE uname = ?;";
    var query_data = [login.username];
    connection.query(query, query_data, function (err, result) {
        if (err) {
            console.log(err);
            callback(true);
        } else if (result.length > 0) {
            callback(false, {err: true, message: "that username is taken"});
        } else {
            var query = "CALL AddNewUser(?,?)";
            console.log(query);
            connection.query(query, [login.username, login.password], function (err, result) {
                if (err) {
                    console.log(err);
                    callback(true);
                    return;
                }
                console.log(result);
                callback(false, result[0][0]);
            });
        }
    })
};

exports.CheckForFollower = function (users, callback) {
    var query = "CALL IsFollower(?,?);";
    var query_data = [users.user_id, users.username];
    connection.query(query, query_data, function (err, result) {
        if (err) {
            console.log(err);
            callback(true);
            return;
        }
        callback(false, result[0].length > 0);
    })
};

exports.GetPostsFromUser = function(username, callback) {
    console.log(username);
    var query = "CALL NewPostsFromUser(?);";
    var query_data = [username];
    connection.query(query,query_data, function (err, result) {
            if(err) {
                console.log(err);
                callback(true);
                return;
            }
            callback(false, result[0]);
        }
    );
};
