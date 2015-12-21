var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var uuid = require('uuid');

var routes = require('./routes/index');
var users = require('./routes/users');
var posts = require('./routes/posts');
var login = require('./routes/login');
var logout = require('./routes/logout');
var submit = require('./routes/submit');
var groups = require('./routes/groups');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    path: '/',
    resave: true,
    saveUninitialized: true,
    secret: 'forum'
}));

app.use('/', routes);
app.use('/post', posts);
app.use('/login', login);
app.use('/logout', logout);

// Any routes that need authentication first, should be placed below this app.use()
app.use(function (req, res, next) {
    console.log("login redirect");
    console.log(req.session);
    if (req.session.user == undefined) {
        res.redirect('/login');
    } else {
        next();
    }
});

app.use('/user', users);
app.use('/submit', submit);
app.use('/groups', groups);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
