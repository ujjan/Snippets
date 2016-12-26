	var express = require('express');
	var router = express.Router();
	//var passport = require('passport');
	//var LocalStrategy = require('passport-local').Strategy;
	const {ObjectID} = require('mongodb');
	var User = require('../models/user');
	var Snip = require('../models/snip');
	const _ = require('lodash');
	var expressValidator = require('express-validator');
	router.use(expressValidator());



	// Login
	router.get('/login', function(req, res){
		if(!req.session.user){
			res.render('login');
		}else{
			res.redirect('/');
		}


	}).post('/login', function (req,res) {
		User.findOne({username: req.body.username}, function(err, user)
		{
			if(err){
				req.flash('error_msg', 'Something is wrong Please try again')
				res.redirect('/users/login');
				throw err;
			}
			if(!user){
				req.flash('error_msg', 'Please check your Username');
				res.redirect('/users/login');

			}else{
				user.comparePassword(req.body.password, function(err, userPassword){
					if(err){
						req.flash('error_msg', 'Something is wrong Please try again')
						res.redirect('/users/login');
					}
					if(!userPassword){
						req.flash('error_msg', 'Something is wrong Please try again')
						res.redirect('/users/login');
					}
					else
					{
						req.flash('success_msg', 'You are Logged in');
						req.session.user = true;

						res.redirect('/users/snippets');

					}

				})

			}


		})



	});


	//if(req.session && req.session.user) {  write code here  }


	router.get('/logout', function(req, res){
		req.session.user = false;

		req.flash('success_msg', 'You are logged out');

		res.redirect('/users/login');
	});




	// Create snippets ===========================================

	router.get('/create',authorized,  function(req, res){
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

	//Update the Snippets ===================================================

	router.get("/update/:id",authorized, function(req, res) {
		// render the form, send along the id
		var id = req.params.id;
		Snip.findOne({_id:id},function (err, foundObject) {

			if(err){
				console.log(err);
				res.status(500).send();
			}
			res.render("update", {id, name: foundObject.name, snippets: foundObject.snippets});
		});

	});



	router.post('/update/:id',authorized, function (req, res) {
		var id = req.params.id;
		var body = _.pick(req.body, ['name', 'snippets']);
		 Snip.findByIdAndUpdate(id, {$set: body}, {new: true}).then((snip) => {
		 if (!snip) {
		 return res.status(404).send();

		 }

			 res.redirect("/users/snippets")
	 	}).catch((e) => {
	 	res.status(400).send();
		 });

	});

	//Deleting the Snippets========================================

	router.get("/delete/:id", authorized, function(req, res) {
			// render the form, send along the id
			res.render("delete", {id: req.params.id});
		});
	router.post("/delete/:id",function(req, res) {
			Snip.findOneAndRemove({_id: req.params.id}, function(error) {
				if(error) {
					throw new Error("Something went wrong!");
				}
				req.flash('success_msg', 'Snippet was deleted Successfully! ');
				res.redirect("/users/snippets");
			});

		});



	//Get the Snippets  with loged in users >=========================================

	router.get('/snippets', authorized, (req, res) => {

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

			res.render("snippets", context);
		});

	});

	//Get the Snippets  without  loged in users >=========================================

	router.get('/allSnippets',  (req, res) => {

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

			res.render("allSnippets", context);
		});

	});


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

		//Validation
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
			});

			req.flash('success_msg', 'You are registered and can now login');

			res.redirect('/users/login');
		}
	});


	function authorized (req, res, next) {
		if (req.session.user) {
			next();
		} else {
			req.flash('error_msg', 'You are not logged in please log in to perform such task');
			res.redirect('/users/login');

		}
	}



	module.exports = router;