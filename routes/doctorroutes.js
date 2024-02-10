const express = require('express');
const router = express.Router();
const JournalModel = require("../models/journal");
const mongoose = require("mongoose");
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

mongoose.connect(process.env.MONGODB_URL).then(() => {
  console.log("MongoDB is connected!");
});


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

// fitbit sleep data route

router.get('/fitbit/sleep', (req, res) => {
    //TODO: Get JSON data into ejs variables
  res.render('sleep', {sleepData:null});
})

router.post('/fitbit/sleep/:minDate/:maxdate', (req, res) => {
  
    //apiCallOptions.url = "https://api.fitbit.com/1.2/user/-/sleep/date/"+req.params.minDate+"/"+req.params.maxDate+".json";
    testApiCallOptions.url = "https://api.fitbit.com/1.2/user/-/sleep/date/"+req.body.minDate+"/"+req.body.maxDate+".json";
    //axios.request(apiCallOptions).then(function (response) {
      axios.request(testApiCallOptions).then(function (response) {
        console.log(response.data);
        res.status(201).json(response.data);
        res.render('sleep', {sleepData:null});
      }).catch(function (error) {
        console.error("API call error" + error);
      });
      //TODO: Get JSON data into ejs variables
 
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