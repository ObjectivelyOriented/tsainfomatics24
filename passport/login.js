var LocalStrategy   = require('passport-local').Strategy;
var User = require('../models/userModel');
var bCrypt = require('bcryptjs');

module.exports = function(passport){

passport.use('login', new LocalStrategy({
    passReqToCallback : true
  },
  async (req, username, password, done) => { 
    // check in mongo if a user with username exists or not
    const user = await User.findOne({ 'username' :  username });
        
        // Username does not exist, log error & redirect back
        if (!user){
          console.log('User Not Found with username '+username);
          return done(null, false, 
                req.flash('message', 'User Not found.'));                 
        }
        // User exists but wrong password, log the error
        if (!isValidPassword(user, password)){
          console.log('Invalid Password');
          return done(null, false, 
              req.flash('message', 'Invalid Password'));
        }
        // User and password both match, return user from
        // done method which will be treated like success
        return done(null, user);
      

}));

var isValidPassword = function(user, password){
    return bCrypt.compareSync(password, user.password);
}  

}