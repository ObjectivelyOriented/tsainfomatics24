require("dotenv").config();
const express = require('express');
const router = express.Router();
const JournalModel = require("../models/journal");
var User = require('../models/userModel');
var axios = require("axios").default;

var apiCallOptions = {
  method: 'GET',
  url: 'https://api.fitbit.com/1/user/-/profile.json',
  headers: {'content-type': 'application/json', Authorization: ''}
};

var testApiCallOptions = {
  method: 'GET',
  url: 'https://api.fitbit.com/1/user/-/profile.json',
  headers: {'content-type': 'application/json', Authorization: ''}
};

var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()){
  if(req.user.doctor){
    return next();
  }
}
  res.redirect('/');
}


var userToEdit;
var fitbitUser;

//TODO:
//Doctor login with NPI id through NPI API
//Doctor is able to select users to treat(MyModel.find({});), once that is done in the doctor model(TODO) there will be 
//the username and object_id added in the user object. Then (using find by id/findOne), the doctor
// can see stored fitbit data(TODO), journals, and appt dates (can also add appt/medication dates)

// middleware that is specific to this router
router.use((req, res, next) => {
  console.log('Time: ', Date.now());
  next();
})
// home page route
router.get('/',isAuthenticated,async (req, res) => {
  const journals = await JournalModel.find();
  res.render('doctorindex', {user:req.user});
  
})

router.get("/patientSelect", isAuthenticated ,async (req, res)=>{
     const uncoveredUsers = await User.find({ 
      $and: [
        {$or: [{ doctorName: null }, { doctorName: { $exists: false } }]},
        {doctor : false}
      ]  
    });
     res.render("patientSelect", {userList: uncoveredUsers, patientList: req.user.patient, pickedUser: null});
  })

  router.post("/patientRegister", isAuthenticated ,async (req, res)=>{
    
    const pickedUser = await User.findById( req.body.userList ).exec();
    const doctor = await User.findOne({ username: req.user.username });
    doctor.patient.push({userid: pickedUser.id, username:pickedUser.username});
    await doctor.save();
    pickedUser.doctorName = req.user.firstName + " " + req.user.lastName;
    await pickedUser.save();
    res.redirect("/doctor/patientSelect");
 })


router.get("/setappt", isAuthenticated ,async (req, res)=>{
  const doctor = await User.findOne({ username: req.user.username });
  var patients = [];
  for(const patient of doctor.patient){
    const user = await User.findOne({ _id: patient.userid });
    patients.push(user)
  }
  res.render("doctorAppt", {patientList: doctor.patient, patients:patients});
})

router.post("/setappt", isAuthenticated ,async (req, res)=>{
  const pickedUser = await User.findById( req.body.userList ).exec();
  pickedUser.appointments.push(req.body);
  await pickedUser.save();
  res.redirect("/doctor/setappt");
})

router.post("/patientSelect", isAuthenticated ,async (req, res)=>{
    
  userToEdit = await User.findById( req.body.patientList ).exec();
  
  res.render("patientSelect", {userList: null, patientList: req.user.patient, pickedUser: userToEdit});

})


router.post("/editRecords", isAuthenticated ,async (req, res)=>{
  const pickedUser = await User.findById( userToEdit.id ).exec();
  pickedUser.illnesses = req.body.illnesses;
  await pickedUser.save();
  res.redirect("/doctor/setappt");
})




// fitbit routes

router.get('/fitbit',isAuthenticated, async (req, res) => {
  const doctor = await User.findOne({ username: req.user.username });
res.render('fitbitData', {fitbitUsers:doctor.patient, pooledFitbitData:null, date:null,fitbitUser:null});
})

router.post('/fitbit/patientSelect', isAuthenticated, async (req, res) => {
  fitbitUser = await User.findById( req.body.userList ).exec();
  if(fitbitUser.fitbitData.accessToken != '' && fitbitUser.fitbitData.refreshToken != ''){
    apiCallOptions.url = "https://api.fitbit.com/1/user/"+fitbitUser.fitbitData.userId+"/activities/heart/date/"+req.body.date+"/1d/1min.json";
    apiCallOptions.headers.Authorization = "Bearer " + (fitbitUser.fitbitData.accessToken);
    
      //API call
      var pooledFitbitData = [];
     axios.request(apiCallOptions).then(function (response) {
      pooledFitbitData.push(response.data["activities-heart"][0]);

      apiCallOptions.url = "https://api.fitbit.com/1.2/user/"+fitbitUser.fitbitData.userId+"/sleep/date/"+req.body.date+".json";
      axios.request(apiCallOptions).then(function (response) {
        pooledFitbitData.push(response.data.summary);

        apiCallOptions.url = "https://api.fitbit.com/1/user/"+fitbitUser.fitbitData.userId+"/activities/date/"+req.body.date+".json";
        axios.request(apiCallOptions).then(function (response) {
          pooledFitbitData.push(response.data.goals);
          pooledFitbitData.push(response.data.summary);
          
          res.render('fitbitData', {fitbitUsers:req.user.patient, pooledFitbitData:pooledFitbitData, date:null,fitbitUser:fitbitUser });

            }).catch(function (error) {
            console.error("API call error" + error);
            res.status(401).redirect("/doctor/fitbit/refreshTokens");
          });
          }).catch(function (error) {
          console.error("API call error" + error);
          res.status(401).redirect("/doctor/fitbit/refreshTokens");
        });
        }).catch(function (error) {
        console.error("API call error" + error);
        res.status(401).redirect("/doctor/fitbit/refreshTokens");
      });

      } else {
        res.redirect("/doctor"); //alert doctor access and refresh token is null
      }

})


router.get("/fitbit/refreshTokens",isAuthenticated, function (req, res) {
  var refreshOptions = {
    method: 'POST',
    url: 'https://api.fitbit.com/oauth2/token',
    headers: {'content-type': 'application/x-www-form-urlencoded', Authorization: "Basic " + Buffer.from(process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET, 'utf-8').toString('base64')},
    data: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: process.env.CLIENT_ID,
      refresh_token: fitbitUser.fitbitData.refreshToken
    })
  };
  
axios.request(refreshOptions).then(async function (response) {
  console.log(response.data);
  fitbitUser.fitbitData = {
    userId: response.data.user_id, 
      accessToken: response.data.access_token, 
      refreshToken: response.data.refresh_token
    };
    await fitbitUser.save();
  res.redirect("/doctor/fitbit"); //alert doctor that access token has been updatted adn they can retry their query
}).catch(function (error) {
  console.error("Token request error " + error);
  res.redirect("/doctor"); //alert doctor refresh token is null
});

});


  //Doctor journal routes
  router.get('/journals',isAuthenticated, async (req, res) => {
  res.render('doctorJournals', {journals:null,patients:req.user.patient});
  })
  
  router.post('/journals/patientSelect', isAuthenticated, async (req, res) => {
    const journals = await JournalModel.find({postedBy: req.body.userList});
    const user = await User.find({_id: req.body.userList});
    res.render('doctorJournals', {patients:req.user.patient,user: user, journals: journals});
  })

module.exports = router