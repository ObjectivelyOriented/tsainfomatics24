var LocalStrategy   = require('passport-local').Strategy;
var User = require('../models/userModel');
var axios = require("axios").default;

var bCrypt = require('bcryptjs');
module.exports = function(passport){
  passport.use('docSignup', new LocalStrategy({
    passReqToCallback : true 
  },
  function(req, username, password, done) {
    findOrCreateUser =  async () => {
      // find a user in Mongo with provided username
      const doctor =  await User.findOne({ 'username' :  username });
      try {
        // check if user exists
        if (doctor) {
          console.log('User already exists');
          return done(null, false, 
             req.flash('message','User Already Exists'));
        }
        try {
          const response = await axios.get("https://npiregistry.cms.hhs.gov/api/?number="+username+"&enumeration_type=&taxonomy_description=&name_purpose=&first_name=&use_first_name_alias=&last_name=&organization_name=&address_purpose=&city=&state=&postal_code=&country_code=&limit=&skip=&pretty=&version=2.1");
         
          if(response.data.result_count != 0){

            var newDoctor = new User();
            // set the user's local credentials
            newDoctor.username = username;
            newDoctor.password = createHash(password);
            newDoctor.firstName = response.data.results[0].basic.first_name;
            newDoctor.lastName = response.data.results[0].basic.last_name;
            newDoctor.doctor = true;
            newDoctor.save();
            return done(null, newDoctor);
          } else {
            console.log('NPI ID not found');
          return done(null, false, 
             req.flash('message','NPI ID not found'));
          }
          
        } catch (error) {
          // Handle error
          console.error(error);
        }
       

      } catch (error) {
        done(error);
      }
      
      
    };

    // Delay the execution of findOrCreateUser and execute
    // the method in the next tick of the event loop
    process.nextTick(findOrCreateUser);
  }));

passport.use('signup', new LocalStrategy({
    passReqToCallback : true 
  },
  function(req, username, password, done) {
    findOrCreateUser =  async () => {
      // find a user in Mongo with provided username
      const user =  await User.findOne({ 'username' :  username });
      try {
        // check if user exists
        if (user) {
          console.log('User already exists');
          return done(null, false, 
             req.flash('message','User Already Exists'));
        }
       
        // Create a new user with the user data provided
        var newUser = new User();
        // set the user's local credentials
        newUser.username = username;
        newUser.password = createHash(password);
        newUser.user = true;
        newUser.firstName = req.body.firstname;
        newUser.lastName = req.body.lastname;
        newUser.illnesses = req.body.illnesses;
        newUser.fitbitData = {
          user_id: "", 
          accessToken: "", 
          refreshToken: ""
        };
        newUser.save();
        return done(null, newUser);
      } catch (error) {
        done(error);
      }
      
      
    };

    // Delay the execution of findOrCreateUser and execute
    // the method in the next tick of the event loop
    process.nextTick(findOrCreateUser);
  }));

  
  
  // Generates hash using bCrypt
  var createHash = function(password){
  return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}};
