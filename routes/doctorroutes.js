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
  testApiCallOptions.url = "https://api.fitbit.com/1.2/user/-/sleep/date/"+req.body.minDate+"/"+req.body.maxDate+".json";
  var authOptions = {
    method: 'POST',
    url: 'https://api.fitbit.com/oauth2/token',
    headers: {'content-type': 'application/x-www-form-urlencoded', Authorization: "Basic " + Buffer.from(process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET, 'utf-8').toString('base64')},
    data: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      code: req.query.code,
      redirect_uri: 'https://tsamentalhealthapp-0fee6615a9d9.herokuapp.com/callback',
      code_verifier: "1s4n323n5m2r4e2h5p0u1e353v62622m0y090e2y3m5u2z43605g3i5v2y0w5a691g6v3a66572s3m2l1z3p0z6c473w4y3q144s3c176a6d27004r0n1n5a1u05681p"
    })
  };
  var testAuthOptions = {
    method: 'POST',
    url: 'https://api.fitbit.com/oauth2/token',
    headers: {'content-type': 'application/x-www-form-urlencoded', Authorization: "Basic " + Buffer.from(process.env.TEST_CLIENT_ID + ":" + process.env.TEST_CLIENT_SECRET, 'utf-8').toString('base64')},
    data: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.TEST_CLIENT_ID,
      client_secret: process.env.TEST_CLIENT_SECRET,
      code: req.query.code,
      redirect_uri: 'https://arcane-castle-84229-a0015ab2dc2b.herokuapp.com/callback',
      code_verifier: '4w2y554p2d5f3u323b1k3m032w6v442g3610362j2o354l713y116d1k3q1n5f6i04004a3y2f2k4k2h4p5215434z3r361j0q4s474z1n5x1x716w4221631q2g6s5y'
    })
  };
    console.log(req.query);
    //TODO: Add if statement to check if state in url is equal to generated state
    //Access token request
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
    //apiCallOptions.url = "https://api.fitbit.com/1.2/user/-/sleep/date/"+req.params.minDate+"/"+req.params.maxDate+".json";
    testApiCallOptions.url = "https://api.fitbit.com/1.2/user/-/sleep/date/"+req.body.minDate+"/"+req.body.maxDate+".json";
    //axios.request(apiCallOptions).then(function (response) {
  
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