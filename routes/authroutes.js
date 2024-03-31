const express = require('express');
const router = express.Router();


module.exports = function(passport){


    /* GET Registration Page */
    router.get('/signup', function(req, res){
      res.render('signup',{message: req.flash('message')});
    });
    router.get('/login', function(req, res){
      res.render('login',{message: req.flash('message')});
    });
    /* Handle Registration POST */
    router.post('/signup', passport.authenticate('signup', {
      successRedirect: '/user/home',
      failureRedirect: '/',
      failureMessage: true,
      failureFlash : true  
    }));
    router.post('/doctorsignup', passport.authenticate('docSignup', {
      successRedirect: '/doctor',
      failureRedirect: '/',
      failureFlash : true  
    }));
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
    /* Handle Logout */
    router.get('/signout',  function(req, res, next) {
        req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/')
        })
    });

  
  
    return router;
  }
  