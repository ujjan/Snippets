	var express = require('express');
	var router = express.Router();
	var passport = require('passport');
	var LocalStrategy = require('passport-local').Strategy;

	var User = require('../models/user');
	var Snip = require('../models/snip');



	// Login
	router.get('/login', function(req, res){
		res.render('login');
	});



	// Create snippets ===========================================

	router.get('/create', ensureAuthenticated, function(req, res){
		res.render('create');
	});
	router.post('/create', (req, res)=> {
		let name = req.body.name;
		let snippets = req.body.snippets;

		// Create the object to save
		let todo = new Snip({
			name: name,
			snippets: snippets
		});

		// Using a promise in this case

		todo.save().then(function () {


			// Successful
			req.session.flash = {
				type: "success",
				message: "The post was Created!"
			};
			res.redirect("/users/snippets");
		}).catch(function (error) {
			// get validation error for example
			console.log(error.message);

			// Of course you should handle this better!
			res.redirect("/create");
		});
	});

	//Deleting the Snippets========================================

	router.get("/delete/:id", ensureAuthenticated, function(req, res) {
			// render the form, send along the id
			res.render("delete", {id: req.params.id});
		});
	router.post("/delete/:id",function(req, res) {
			Snip.findOneAndRemove({_id: req.params.id}, function(error) {
				if(error) {
					throw new Error("Something went wrong!");
				}
				req.flash('success_msg', 'You are registered and can now login');
				res.redirect("/users/snippets");
			});

		});

	//Get att the Snippets =========================================

	router.get('/snippets', (req, res) => {

		Snip.find({}, function (error, data) {

			// mapping up the object for the view
			let context = {
				snippets: data.map(function (snip) {
					return {
						name: snip.name,
						snippets: snip.snippets,
						id: snip._id
					};
				}),
			};
			console.log(context);
			req.session.flash = {
				type: "success",
				message: "The post was deleted!"
			};
			res.render("snippets", context);
		});

	});




	function ensureAuthenticated(req, res, next){
		if(req.isAuthenticated()){
			return next();
		} else {
			req.flash('error_msg','You are not logged in');
			res.redirect('/users/login');
		}
	}

	// Register
	router.get('/register', function(req, res){
		res.render('register');
	});

	router.post('/register', function(req, res){
		var name = req.body.name;
		var email = req.body.email;
		var username = req.body.username;
		var password = req.body.password;
		var password2 = req.body.password2;

		// Validation
		req.checkBody('name', 'Name is required').notEmpty();
		req.checkBody('email', 'Email is required').notEmpty();
		req.checkBody('email', 'Email is not valid').isEmail();
		req.checkBody('username', 'Username is required').notEmpty();
		req.checkBody('password', 'Password is required & minimum lenght of 6').notEmpty().isLength(6);
		req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

		var errors = req.validationErrors();

		if(errors){
			res.render('register',{
				errors:errors
			});
		} else {
			var newUser = new User({
				name: name,
				email:email,
				username: username,
				password: password
			});

			User.createUser(newUser, function(err, user){
				if(err) throw err;
				console.log(err);
			});

			req.flash('success_msg', 'You are registered and can now login');

			res.redirect('/users/login');
		}
	});

	passport.use(new LocalStrategy(
		function(username, password, done) {
			User.getUserByUsername(username, function(err, user){
				if(err) throw err;
				if(!user){
					return done(null, false, {message: 'Unknown User'});
				}

				User.comparePassword(password, user.password, function(err, isMatch){
					if(err) throw err;
					if(isMatch){
						return done(null, user);
					} else {
						return done(null, false, {message: 'Invalid password'});
					}
				});
			});
		}));

	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		User.getUserById(id, function(err, user) {
			done(err, user);
		});
	});

	router.post('/login',
		passport.authenticate('local', {successRedirect:'/', failureRedirect:'/users/login',failureFlash: true}),
		function(req, res) {
			res.redirect('/');
		});

	router.get('/logout', function(req, res){
		req.logout();

		req.flash('success_msg', 'You are logged out');

		res.redirect('/users/login');
	});





	module.exports = router;