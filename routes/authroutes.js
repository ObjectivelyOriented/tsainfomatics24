const express = require('express');
const router = express.Router();


module.exports = function(passport){

    /* GET login page. */
    router.get('/', function(req, res) {
      // Display the Login page with any flash message, if any
      res.render('index', { message: req.flash('message') });
    });
    /* Handle Login POST */
    router.post('/login', passport.authenticate('login', {
      successRedirect: '/user/home',
      failureRedirect: '/',
      failureFlash : true  
    }));
    router.post('/doctorslogin', passport.authenticate('login', {
      successRedirect: '/doctor',
      failureRedirect: '/',
      failureMessage: true,
      failureFlash : true  
    }));
    /* GET Registration Page */
    router.get('/signup', function(req, res){
      res.render('register',{message: req.flash('message')});
    });
    router.get('/doctor/signup', function(req, res){
      //Test NPI ID 1427000116
      res.render('doctorRegister',{message: req.flash('message')});
    });
    /* Handle Registration POST */
    router.post('/signup', passport.authenticate('signup', {
      successRedirect: '/doctor',
      failureRedirect: '/',
      failureMessage: true,
      failureFlash : true  
    }));
    router.post('/doctorsignup', passport.authenticate('docSignup', {
      successRedirect: '/user/home',
      failureRedirect: '/auth/doctor/signup',
      failureFlash : true  
    }));
    /* Handle Logout */
    router.get('/signout',  function(req, res, next) {
        req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/')
        })
    });

  
  
    return router;
  }
  