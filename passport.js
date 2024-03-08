var passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
require("dotenv").config(); //for using variables from .env file.
const User = require("./models/userModel");

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
 
   passport.use(new JWTstrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey   : 'TOP_SECRET'
},
function (jwtPayload, cb) {

    //find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
    return User.findOneById(jwtPayload.id)
        .then(user => {
            return cb(null, user);
        })
        .catch(err => {
            return cb(err);
        });
}
));