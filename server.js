    /**
     * Created by Ayaz on 2016-12-01.
     */

    var express = require('express');
    var path = require('path');
    var cookieParser = require('cookie-parser');
    var bodyParser = require('body-parser');
    var exphbs = require('express-handlebars');
    var expressValidator = require('express-validator');
    var flash = require('connect-flash');
    var session = require('express-session');
    var mongoose = require('mongoose');
    mongoose.Promise = global.Promise;

    //Momgoose connection
    mongoose.connect('mongodb://localhost/SnippetsApp');
    var db = mongoose.connection;



    var routes = require('./routes/index');
    var users = require('./routes/users');

    // Init App
    var app = express();

    // View Engine
    app.set('views', path.join(__dirname, 'views'));
    app.engine('handlebars', exphbs({defaultLayout:'layout'}));
    app.set('view engine', 'handlebars');

    // BodyParser Middleware
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());

    // Set Static Folder
    app.use(express.static(path.join(__dirname, 'public')));

    // Express Session
    app.use(session({
        secret: 'secret',
        saveUninitialized: true,
        resave: true,
        httpOnly: true
    }));


    // Connect Flash
    app.use(flash());

    // Global Vars
    app.use(function (req, res, next) {
        res.locals.success_msg = req.flash('success_msg');
        res.locals.error_msg = req.flash('error_msg');
        res.locals.error = req.flash('error');
        res.locals.user = req.session.user;
        next();
    });



    app.use('/', routes);
    app.use('/users', users);

    // Set Port
    app.set('port', (process.env.PORT || 3000));

    app.listen(app.get('port'), function(){
        console.log('Server started on port '+app.get('port'));
    });