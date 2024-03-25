require("dotenv").config();
const express = require('express');
const router = express.Router();
const randomstring = require("randomstring");
const crypto = require("crypto");
const base64url = require("base64url");
var axios = require("axios").default;
const User = require('../models/userModel');

const code_verifier = randomstring.generate(128);
const base64Digest = crypto
  .createHash("sha256")
  .update(code_verifier)
  .digest("base64");

const code_challenge = base64url.fromBase64(base64Digest);

var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/');
}

var apiCallOptions = {
    method: 'GET',
    url: '',
    headers: {'content-type': 'application/json', Authorization: ''}
  };

  router.get("/",isAuthenticated, async (req, res) => {

    res.redirect("https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=23RTQD&scope=activity+cardio_fitness+electrocardiogram+heartrate+location+nutrition+oxygen_saturation+profile+respiratory_rate+sleep+social+temperature+weight&code_challenge="+ code_challenge +"&code_challenge_method=S256&redirect_uri=https%3A%2F%2Ftsamentalhealthapp-0fee6615a9d9.herokuapp.com%2Ffitbit%2Fcallback");
    
  });
  router.get("/test",isAuthenticated, async (req, res) => {
  
    res.redirect("https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=23RVHM&scope=activity+cardio_fitness+electrocardiogram+heartrate+location+nutrition+oxygen_saturation+profile+respiratory_rate+sleep+social+temperature+weight&code_challenge="+ code_challenge +"&code_challenge_method=S256&redirect_uri=https%3A%2F%2Farcane-castle-84229-a0015ab2dc2b.herokuapp.com%2Ffitbit%2Ftestcallback");
    
  });
  
  router.get("/callback",isAuthenticated, function (req, res) {
    var authOptions = {
        method: 'POST',
        url: 'https://api.fitbit.com/oauth2/token',
        headers: {'content-type': 'application/x-www-form-urlencoded', Authorization: "Basic " + Buffer.from(process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET, 'utf-8').toString('base64')},
        data: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET,
          code: req.query.code,
          redirect_uri: 'https://tsamentalhealthapp-0fee6615a9d9.herokuapp.com/fitbit/callback',
          code_verifier: code_verifier
        })
      };
  
    console.log(req.params);
    console.log(req.query.code);
    authCode = req.query.code;
    //TODO: Add if statement to check if state in url is equal to generated state
    //Access token request
    axios.request(authOptions).then(async function (response) {
      
      console.log(response.data);
      
      const fitbitUser = await User.findById(req.user._id);
        fitbitUser.fitbitData = {
          userId: response.data.user_id, 
          accessToken: response.data.access_token, 
          refreshToken: response.data.refresh_token
        };
        await fitbitUser.save();
        
        
      res.redirect("/");
    }).catch(function (error) {
      console.error("Token request error " + error);
    });
  
  });

  router.get("/refreshTokens",isAuthenticated, function (req, res) {
    var refreshOptions = {
        method: 'POST',
        url: 'https://api.fitbit.com/oauth2/token',
        headers: {'content-type': 'application/x-www-form-urlencoded', Authorization: "Basic " + Buffer.from(process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET, 'utf-8').toString('base64')},
        data: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: process.env.CLIENT_ID,
          refresh_token: req.user.fitbitData.refreshToken
        })
      };
  
    console.log(req.params);
    //TODO: Add if statement to check if state in url is equal to generated state
    //Access token request
    axios.request(refreshOptions).then(async function (response) {
      
      console.log(response.data);
      
      const fitbitUser = await User.findById(req.user._id);
        fitbitUser.fitbitData = {
          userId: response.data.user_id, 
          accessToken: response.data.access_token, 
          refreshToken: response.data.refresh_token
        };
        await fitbitUser.save();
        
        
      res.redirect("/");
    }).catch(function (error) {
      console.error("Token request error " + error);
      res.redirect("/fitbit/test");
    });
  
  });
  
  router.get("/testcallback",isAuthenticated, function (req, res) {
    var testAuthOptions = {
        method: 'POST',
        url: 'https://api.fitbit.com/oauth2/token',
        headers: {'content-type': 'application/x-www-form-urlencoded', Authorization: "Basic " + Buffer.from(process.env.TEST_CLIENT_ID + ":" + process.env.TEST_CLIENT_SECRET, 'utf-8').toString('base64')},
        data: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: process.env.TEST_CLIENT_ID,
          client_secret: process.env.TEST_CLIENT_SECRET,
          code: req.query.code,
          redirect_uri: 'https://arcane-castle-84229-a0015ab2dc2b.herokuapp.com/fitbit/testcallback',
          code_verifier: code_verifier
        })
    };
    
      console.log(req.params);
      console.log(req.query.code);
      //TODO: Add if statement to check if state in url is equal to generated state
      //Access token request
      authCode = req.query.code;
      axios.request(testAuthOptions).then(async function (response) {
        
        //axios.request(testAuthOptions).then(function (response) {
        console.log(response.data);

        const fitbitUser = await User.findById(req.user._id);
        fitbitUser.fitbitData = {
          userId: response.data.user_id, 
          accessToken: response.data.access_token, 
          refreshToken: response.data.refresh_token
        };
        console.log("Queried fitbit data, access token: "+response.data.access_token, "refresh token: " + response.data.refresh_token);
        await fitbitUser.save();
        res.redirect("/");
       // res.redirect('/')
      }).catch(function (error) {
        console.error("Token request error " + error.response.data.message);
      });
    
    });

    router.get("/profile",isAuthenticated, function(req,res){
      apiCallOptions.url = "https://api.fitbit.com/1/user/-/profile.json";
      apiCallOptions.headers.Authorization = "Bearer " + (req.user.fitbitData.accessToken);
        //API call
        axios.request(apiCallOptions).then(function (response) {
          console.log(response.data);
          res.status(201).json(response.data);
        }).catch(function (error) {
          console.error("API call error" + error);
          res.status(401).redirect("/fitbit/refreshTokens");
        });
  
    });
    router.get("/heart", function(req,res){
      //apiCallOptions.url = "https://api.fitbit.com/1/user/-/activities/heart/date/2024-02-28/1d/1min.json";
      //apiCallOptions.headers.Authorization = "Bearer " + (req.user.fitbitData.accessToken);
        //API call
        var heartRate = [99, 98, 97, 96, 95];
        res.json(heartRate);
       /* axios.request(apiCallOptions).then(function (response) {
          var heartLabels = [];
          var heartRate = [];
          for(zone of response.data["activities-heart"][0].value.heartRateZones){
            heartLabels.push(zone.name);
            heartRate.push(zone.max);
          }
          res.json(heartRate);
          //res.render('fitbitData', {fitbitUsers:null, heartRate:response.data["activities-heart"][0].value.heartRateZones});
        }).catch(function (error) {
          console.error("API call error" + error);
          res.status(401).redirect("/fitbit/refreshTokens");
        });*/
  
    });

    router.get("/fitbitData",isAuthenticated, function(req,res){
      res.render('fitbitData', {fitbitUsers: null});
  
    });


module.exports = router
