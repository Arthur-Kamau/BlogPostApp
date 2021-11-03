const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const cmtRouter = require('./routes/comment');
const followRouter = require('./routes/follow');
const postsRouter = require('./routes/posts');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');


const dbo = require("./db");
const cy = require("./crypto");
const {createCipheriv, randomBytes, createDecipheriv} = require('crypto');
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


const key = cy.getKey();
const iv = cy.getIv();

const cipher = createCipheriv('aes256', key, iv);

// auth middleware
function requireLogin(req, res, next) {
    if (!req.headers.authorization) {
        return res.status(403).json({error: 'No credentials sent!'});
    }

    const encryptedMessage = req.headers.authorization;
    console.log("headers " + encryptedMessage)


    try {
        const decipher = createDecipheriv('aes256', key, iv);
        const decryptedMessage = decipher.update(encryptedMessage, 'hex', 'utf-8') + decipher.final('utf8');
        console.log(`Deciphered: ${decryptedMessage.toString('utf-8')}`);
        next();
    } catch (e) {
        console.error("error " + e)
        return res.status(403).json({error: 'Credentials error '});
    }
  


}

//connect to mongo db
dbo.connectToServer(function () {
});
// app routes
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/users',requireLogin, usersRouter);
app.use('/posts', requireLogin, postsRouter);
app.use('/comments',requireLogin, cmtRouter);
app.use('/follow',requireLogin, followRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
