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
router.get('/', async (req, res) => {
  const journals = await JournalModel.find();
  res.render('doctorindex',);
  
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
    res.redirect("/");
 })


router.get("/setappt", isAuthenticated ,async (req, res)=>{
  const doctor = await User.findOne({ username: req.user.username });
  res.render("doctorAppt", {patientList: doctor.patient});
})

router.post("/setappt", isAuthenticated ,async (req, res)=>{
  const pickedUser = await User.findById( req.body.userList ).exec();
  pickedUser.appointments.push(req.body);
  await pickedUser.save();
  res.redirect("/");
})

router.post("/patientSelect", isAuthenticated ,async (req, res)=>{
    
  userToEdit = await User.findById( req.body.patientList ).exec();
  
  res.render("patientSelect", {userList: null, patientList: req.user.patient, pickedUser: userToEdit});

})


router.post("/editRecords", isAuthenticated ,async (req, res)=>{
  const pickedUser = await User.findById( userToEdit.id ).exec();
  pickedUser.illnesses = req.body.illnesses;
  await pickedUser.save();
  res.redirect("/");
})




// fitbit routes

router.get('/fitbit',isAuthenticated, async (req, res) => {
  const fitbitUsers = await User.find({doctor : false});
res.render('fitbitData', {fitbitUsers:fitbitUsers});
})

router.post('/fitbit/patientSelect',isAuthenticated, async (req, res) => {
  const pickedUser = await User.findById( req.body.userList ).exec();
  console.log("User info" + pickedUser);
  if(pickedUser.fitbitData.accessToken != '' && pickedUser.fitbitData.refreshToken != ''){
  apiCallOptions.url = "https://api.fitbit.com/1/user/-/profile.json";
      apiCallOptions.headers.Authorization = "Bearer " + (pickedUser.fitbitData.accessToken);
        //API call
        axios.request(apiCallOptions).then(function (response) {
          console.log(response.data);
          res.status(201).json(response.data);
          
        }).catch(function (error) {
          console.error("API call error" + error);
          if(error.status = 401){
            var refreshOptions = {
              method: 'POST',
              url: 'https://api.fitbit.com/oauth2/token',
              headers: {'content-type': 'application/x-www-form-urlencoded', Authorization: "Basic " + Buffer.from(process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET, 'utf-8').toString('base64')},
              data: new URLSearchParams({
                grant_type: 'refresh_token',
                client_id: process.env.CLIENT_ID,
                refresh_token: pickedUser.fitbitData.refresh_token
              })
            };
          axios.request(refreshOptions).then(async function (response) {
            pickedUser.fitbitData = {
                user_id: response.data.user_id, 
                accessToken: response.data.access_token, 
                refreshToken: response.data.refresh_token
              };
              await pickedUser.save();
            res.redirect("/doctor/fitbit"); //alert doctor that access token has been updatted adn they can retry their query
          }).catch(function (error) {
            console.error("Token request error " + error);
            res.redirect("/"); //alert doctor refresh token is null
          });
          }
        });
      } else {
        res.redirect("/"); //alert doctor access and refresh token is null
      }

})

router.get('/fitbit/sleep', (req, res) => {
    //TODO: Get JSON data into ejs variables
  res.render('sleep', {sleepData:null});
})

router.post('/fitbit/sleep/:minDate/:maxdate', (req, res) => {
  testApiCallOptions.url = "https://api.fitbit.com/1.2/user/-/sleep/date/"+req.body.minDate+"/"+req.body.maxDate+".json";
  
    axios.request(authOptions).then(function (response) {
      
      //axios.request(testAuthOptions).then(function (response) {
      console.log(response.data);
      apiCallOptions.headers.authorization = "Bearer " + response.data.access_token;
      //testApiCallOptions.headers.Authorization = "Bearer " + response.data.access_token;
      //API call
     
      axios.request(testApiCallOptions).then(function (response) {
        console.log(response.data);
        res.status(201).json(response.data);
        res.render('sleep', {sleepData:null});
        alert("Your fitbit has been authorized!");
      }).catch(function (error) {
        console.error("API call error" + error);

      });
      
    }).catch(function (error) {
      console.error("Token request error " + error);
    });
 
})

router.get('/fitbit/heart/:minDate/:maxdate', (req, res) => {
    //apiCallOptions.url = "https://api.fitbit.com/1/user/-/spo2/date/"+req.params.minDate+"/"+req.params.maxDate+".json";
    testApiCallOptions.url = "https://api.fitbit.com/1/user/-/spo2/date/"+req.params.minDate+"/"+req.params.maxDate+".json";
       //axios.request(apiCallOptions).then(function (response) {
        axios.request(testApiCallOptions).then(function (response) {
        console.log(response.data);
        res.status(201).json(response.data);
      }).catch(function (error) {
        console.error("API call error" + error);
      });
    res.render('heart');
  })

  router.get('/fitbit/activity', (req, res) => {
    res.render('activity');
  })

module.exports = router