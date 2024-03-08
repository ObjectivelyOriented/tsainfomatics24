require("dotenv").config(); //for using variables from .env file.
const express = require('express');
const router = express.Router();
var passport = require('passport');
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
require("dotenv").config(); //for using variables from .env file.
const LocalStrategy = require("passport-local");
const User = require("../models/userModel");

 //signup 
 passport.use(
   "signup",
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
    "login",
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

  passport.use(
    new JWTstrategy(
      {
        secretOrKey: 'TOP_SECRET',
        jwtFromRequest: ExtractJWT.fromUrlQueryParameter('secret_token')
      },
      async (token, done) => {
        try {
          return done(null, token.user);
        } catch (error) {
          done(error);
        }
      }
    )
  );


  router.post(
    '/signup',
    passport.authenticate('signup', { session: false }),
    async (req, res, next) => {
      res.json({
        message: 'Signup successful',
        user: req.user
      });
    }
  );

  router.post(
    '/login',
    async (req, res, next) => {
      passport.authenticate(
        'login',
        async (err, user, info) => {
          try {
            if (err || !user) {
              const error = new Error('An error occurred.');
  
              return next(error);
            }
  
            req.login(
              user,
              { session: false },
              async (error) => {
                if (error) return next(error);
  
                const body = { _id: user._id, username: user.username };
                const token = jwt.sign({ user: body }, 'TOP_SECRET');
  
                return res.json({ token });
              }
            );
          } catch (error) {
            return next(error);
          }
        }
      )(req, res, next);
    }
  );


  
  

module.exports = router