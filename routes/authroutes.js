require("dotenv").config(); //for using variables from .env file.
const express = require('express');
const router = express.Router();
var passport = require('passport');
var session = require('express-session');
require("dotenv").config(); //for using variables from .env file.
const LocalStrategy = require("passport-local");
const User = require("../models/userModel");

passport.serializeUser((user, done) => { 
    done(null, user.id);
  });
  router.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
  }));
  router.use(passport.initialize());
  router.use(passport.session());
  
  passport.use(User.createStrategy());
  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());
  
    //signup 
 passport.use(
   "local-signup",
   new LocalStrategy(
     {
       usernameField: "username",
       passwordField: "password",
     },
     async (username, password, done) => {
       try {
         // check if user exists
         const userExists = await User.findOne({ "username": username });
         if (userExists) {
           return done(null, false)
         }
         // Create a new user with the user data provided
         const user = await User.create({ username, password });
         return done(null, user);
       } catch (error) {
         done(error);
       }
     }
   )
 );

 //login
 passport.use(
    "local-login",
    new LocalStrategy(
      {
        usernameField: "username",
        passwordField: "password",
      },
      async (username, password, done) => {
        try {
          const user = await User.findOne({ "username": username });
          if (!user) return done(null, false);
          const isMatch = await user.matchPassword(password);
          if (!isMatch)
            return done(null, false);
          // if passwords match return user
          return done(null, user);
        } catch (error) {
          console.log(error)
          return done(error, false);
        }
      }
    )
  );


router.post( "/signup",
passport.authenticate('local-signup', { session: false }),
(req, res, next) => {
  // sign up
  res.json({
    user: req.user,
  });
}
);

router.post(
    '/login',
    passport.authenticate('local-login', { successRedirect: '/', failureRedirect: '/login' })
  )

  

module.exports = router