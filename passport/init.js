var login = require('./login');
var signup = require('./signup');
var User = require('../models/userModel');


module.exports = function(passport){

	// Passport needs to be able to serialize and deserialize users to support persistent login sessions
    passport.serializeUser(function(user, done) {
        console.log('serializing user: ');console.log(user.id);
        done(null, user.id);
    });

    passport.deserializeUser(async(id, done)  => {
        const queriedUser = await User.findById(id).exec();
        console.log('is:',id);
            console.log('deserializing user:',queriedUser);
            done(null, queriedUser);
        
    });

    // Setting up Passport Strategies for Login and SignUp/Registration
    login(passport);
    signup(passport);

}