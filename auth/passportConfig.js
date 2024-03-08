require("dotenv").config(); //for using variables from .env file.
const LocalStrategy = require("passport-local");
const User = require("../models/userModel");
const JwtStrategy = require("passport-jwt").Strategy;
const { ExtractJwt } = require("passport-jwt")

module.exports = (passport) => {
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

  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromHeader("authorization"),
        secretOrKey: process.env.AUTH_SECRET_KEY,
      },
      async (jwtPayload, done) => {
        try {
          // Extract user
          const user = jwtPayload.user;
          done(null, user);
        } catch (error) {
          done(error, false);
        }
      }
    )
  );
}