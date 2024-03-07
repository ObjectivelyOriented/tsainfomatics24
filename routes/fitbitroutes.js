require("dotenv").config();
const express = require('express');
const router = express.Router();
const randomstring = require("randomstring");
const crypto = require("crypto");
const base64url = require("base64url");
var axios = require("axios").default;
const configvars = require('../config/configvars');
const code_verifier = randomstring.generate(128);

const base64Digest = crypto
  .createHash("sha256")
  .update(code_verifier)
  .digest("base64");

const code_challenge = base64url.fromBase64(base64Digest);

var apiCallOptions = {
    method: 'GET',
    url: '',
    headers: {'content-type': 'application/json', Authorization: ''}
  };
  var authOptions = {
    method: 'POST',
    url: 'https://api.fitbit.com/oauth2/token',
    headers: {'content-type': 'application/x-www-form-urlencoded', Authorization: "Basic " + Buffer.from(process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET, 'utf-8').toString('base64')},
    data: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      code: authCode,
      redirect_uri: 'https://tsamentalhealthapp-0fee6615a9d9.herokuapp.com/fitbit/callback',
      code_verifier: code_verifier
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
      code: authCode,
      redirect_uri: 'https://arcane-castle-84229-a0015ab2dc2b.herokuapp.com/fitbit/testcallback',
      code_verifier: code_verifier
    })
};

  router.get("/", async (req, res) => {

    res.redirect("https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=23RTQD&scope=activity+cardio_fitness+electrocardiogram+heartrate+location+nutrition+oxygen_saturation+profile+respiratory_rate+sleep+social+temperature+weight&code_challenge="+ code_challenge +"&code_challenge_method=S256&redirect_uri=https%3A%2F%2Ftsamentalhealthapp-0fee6615a9d9.herokuapp.com%2Ffitbit%2Fcallback");
    
  });
  router.get("/test", async (req, res) => {
  
    res.redirect("https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=23RVHM&scope=activity+cardio_fitness+electrocardiogram+heartrate+location+nutrition+oxygen_saturation+profile+respiratory_rate+sleep+social+temperature+weight&code_challenge="+ code_challenge +"&code_challenge_method=S256&redirect_uri=https%3A%2F%2Farcane-castle-84229-a0015ab2dc2b.herokuapp.com%2Ffitbit%2Ftestcallback");
    
  });
  
  router.get("/callback", function (req, res) {
    
  
    console.log(req.params);
    console.log(req.query.code);
    configvars.authCode = req.query.code;
    //TODO: Add if statement to check if state in url is equal to generated state
    //Access token request
    axios.request(authOptions).then(function (response) {
      
      console.log(response.data);
      apiCallOptions.headers.Authorization = "Bearer " + response.data.access_token;
      
      res.redirect("/");
    }).catch(function (error) {
      console.error("Token request error " + error);
    });
  
  });
  
  router.get("/testcallback", function (req, res) {
      console.log(req.params);
      console.log(req.query.code);
      //TODO: Add if statement to check if state in url is equal to generated state
      //Access token request
      axios.request(testAuthOptions).then(function (response) {
        
        //axios.request(testAuthOptions).then(function (response) {
        console.log(response.data);
        //apiCallOptions.headers.Authorization = "Bearer " + response.data.access_token;
        apiCallOptions.headers.Authorization = "Bearer " + response.data.access_token;
        res.redirect("/");
       // res.redirect('/')
      }).catch(function (error) {
        console.error("Token request error " + error);
      });
    
    });
    router.get("/profile", function(req,res){
      apiCallOptions.url = "https://api.fitbit.com/1/user/-/profile.json";
      
        //API call
        axios.request(apiCallOptions).then(function (response) {
          console.log(response.data);
          res.status(201).json(response.data);
        }).catch(function (error) {
          console.error("API call error" + error);
        });
  
    });
    router.get("/heart", function(req,res){
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