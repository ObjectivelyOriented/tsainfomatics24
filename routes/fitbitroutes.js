require("dotenv").config();
const express = require('express');
const router = express.Router();
const JournalModel = require("../models/journal");
const mongoose = require("mongoose");
var axios = require("axios").default;
const configvars = require('./config/configvars');

var apiCallOptions = {
    method: 'GET',
    url: '',
    headers: {'content-type': 'application/json', Authorization: ''}
  };

  router.get("/", async (req, res) => {

    res.redirect("https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=23RTQD&scope=activity+cardio_fitness+electrocardiogram+heartrate+location+nutrition+oxygen_saturation+profile+respiratory_rate+sleep+social+temperature+weight&code_challenge="+ code_challenge +"&code_challenge_method=S256&redirect_uri=https%3A%2F%2Ftsamentalhealthapp-0fee6615a9d9.herokuapp.com%2Fcallback");
    
  });
  router.get("/test", async (req, res) => {
  
    res.redirect("https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=23RVHM&scope=activity+cardio_fitness+electrocardiogram+heartrate+location+nutrition+oxygen_saturation+profile+respiratory_rate+sleep+social+temperature+weight&code_challenge="+ code_challenge +"&code_challenge_method=S256&redirect_uri=https%3A%2F%2Farcane-castle-84229-a0015ab2dc2b.herokuapp.com%2Ftestcallback");
    
  });
  
  router.get("/callback", function (req, res) {
    
  
    console.log(req.params);
    console.log(req.query.code);
    //TODO: Add if statement to check if state in url is equal to generated state
    //Access token request
    axios.request(configvars.authOptions).then(function (response) {
      
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
      axios.request(configvars.testAuthOptions).then(function (response) {
        
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