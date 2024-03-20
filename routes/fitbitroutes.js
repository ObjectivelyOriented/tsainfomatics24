require("dotenv").config();
const express = require('express');
const router = express.Router();
const randomstring = require("randomstring");
const crypto = require("crypto");
const base64url = require("base64url");
var axios = require("axios").default;
const FitbitModel = require("../models/fitbitModel");
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
      
      const fitbitModel = await FitbitModel.create({
        user_id: response.data.access_token, 
        accessToken: response.data.access_token, 
        refreshToken: response.data.refresh_token
      })
      
      const fitbitUser = User.findById(req.user._id);
      fitbitUser.fitbitData = fitbitModel._id;
      fitbitUser.save();
      fitbitUser.populate("fitbitData");
      apiCallOptions.headers.Authorization = "Bearer " + fitbitUser.fitbitData.accessToken;
      
      res.redirect("/");
    }).catch(function (error) {
      console.error("Token request error " + error);
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
          user_id: response.data.access_token, 
          accessToken: response.data.access_token, 
          refreshToken: response.data.refresh_token
        };
        await fitbitUser.save();
        
        apiCallOptions.headers.Authorization = "Bearer " + fitbitUser.fitbitData.accessToken;
        
        res.redirect("/");
       // res.redirect('/')
      }).catch(function (error) {
        console.error("Token request error " + error);
      });
    
    });
    router.get("/profile",isAuthenticated, function(req,res){
      apiCallOptions.url = "https://api.fitbit.com/1/user/-/profile.json";
      
        //API call
        axios.request(apiCallOptions).then(function (response) {
          console.log(response.data);
          res.status(201).json(response.data);
        }).catch(function (error) {
          console.error("API call error" + error);
        });
  
    });
    router.get("/heart",isAuthenticated, function(req,res){
      apiCallOptions.url = "https://api.fitbit.com/1/user/-/activities/heart/date/2024-02-28/1d/1min.json";
      
        //API call
        axios.request(apiCallOptions).then(function (response) {
          console.log(response.data["activities-heart"]);
          res.render("heart", {heartData: response.data["activities-heart"]});
        }).catch(function (error) {
          console.error("API call error" + error);
        });
  
    });

module.exports = router
