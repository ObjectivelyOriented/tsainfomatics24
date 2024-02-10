require("dotenv").config(); //for using variables from .env file.
const express = require("express");
const mongoose = require("mongoose");
const JournalModel = require("./models/journal");
var axios = require("axios").default;
const doctorroutes = require('./routes/doctorroutes')
const app = express();
const port = 3000;

var apiCallOptions = {
  method: 'GET',
  url: 'https://api.fitbit.com/1.2/user/-/sleep/list.json?afterDate=2010-05-01&sort=asc&offset=0&limit=1n',
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


app.use(express.urlencoded({extended: true}))

app.use(express.static('public'));
app.use("/doctor", doctorroutes);
app.use(express.static(__dirname + '/public'));
app.set('views', './views');
app.set("view engine", "ejs")

//Shows home page
app.get("/", async (req, res) => {
  try {
    const journals = await JournalModel.find();
    res.render("index", {journals:null, newJournal: null, date: null});
    //res.status(200).json(journals);
  } catch (error) {
    console.log(error);
    res.status(500);
    res.render("error", {error});
    //res.status(500).json({ error: "Internal Server Error" });
  }
});

//Shows newly created journal entry
app.post("/api/journal", async (req, res)=>{
  try {
    const journals = await JournalModel.find();
    //const journalHash = encrypt(Buffer.from(req.body, 'utf8'));
   const newJournal = await JournalModel.create(req.body);
    ///const journalText = decrypt(journals);
    res.redirect("/");
   // res.render("index", {journals: journals, newJournal: newJournal});
    /*let myData = newJournal.firstname;
    //res.status(201).json(newJournal);
    res.render("index", {
      myData: myData
    });*/
  } catch (error) {
    console.log(error);
    res.status(500);
    res.render("error", {error});
    //res.status(500).json({ error: "Internal Server Error" });
  }
})

//Shows all journals
app.get("/journals", async (req, res) => {
  try {
   const journals = await JournalModel.find();
    res.render("journals", {journals});
    //res.status(200).json(journals);
  } catch (error) {
    //res.status(500).json({ error: "Internal Server Error" });
    console.log(error);
    res.status(500);
    res.render("error", {error});
  }
});

//deletes all journals
app.get("/purge", async (req, res) => {
  try {
    await JournalModel.deleteMany();
    res.render("index", {journals: null, newJournal: null});
    //res.status(200).json(journals);
  } catch (error) {
    console.log(error);
    res.status(500);
    res.render("error", {error});
    //res.status(500).json({ error: "Internal Server Error" });
  }
});

//FITBIT
app.get("/callback", function (req, res) {
  
var authOptions = {
  method: 'POST',
  url: 'https://api.fitbit.com/oauth2/token',
  headers: {'content-type': 'application/x-www-form-urlencoded', Authorization: "Basic " + Buffer.from("23RTQD" + ":" + "fce8b10c985c39fac31229e8a5ae5973", 'utf-8').toString('base64')},
  data: new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: "23RTQD",
    client_secret: "fce8b10c985c39fac31229e8a5ae5973",
    code: req.query.code,
    redirect_uri: 'https://tsamentalhealthapp-0fee6615a9d9.herokuapp.com/callback',
    code_verifier: "204p224i500h154j03333h2p4b2b553k6r1o4r3633303g1j6c5j1q350c3f5x2i4t5b5d1l3s5k0p47062y4n43206b0o3n4l642h164c1e5f5l2w4i65181p43290h"
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
    apiCallOptions.headers.Authorization = "Bearer " + response.data.access_token;
    //testApiCallOptions.headers.Authorization = "Bearer " + response.data.access_token;
    //API call
    axios.request(apiCallOptions).then(function (response) {
      console.log(response.data);
      res.status(201).json(response.data);
    }).catch(function (error) {
      console.error("API call error" + error);
    });
   // res.redirect('/')
  }).catch(function (error) {
    console.error("Token request error " + error);
  });

});

//test request after fitbit auth
app.get("/request", function (req, res) {
//axios.request(testApiCallOptions).then(function (response) {
   axios.request(apiCallOptions).then(function (response) {
  console.log(response.data);
  res.status(201).json(response.data);
}).catch(function (error) {
  console.error("API call error" + error);
});
});


//TODO: add fitbit refresh token route

//Shows home page
app.get("/", async (req, res) => {
  try {
    const journals = await JournalModel.find();
    res.render("index", {journals, newJournal: null});
    //res.status(200).json(journals);
  } catch (error) {
    console.log(error);
    res.status(500);
    res.render("error", {error});
    //res.status(500).json({ error: "Internal Server Error" });
  }
});






//TODO: Doctor routing
app.get("/doctor", async (req, res) => {
  //axios.request(testApiCallOptions).then(function (response) {
    try {
      const journals = await JournalModel.find();
      res.render("index", {journals, newJournal: null});
      //res.status(200).json(journals);
    } catch (error) {
      console.log(error);
      res.status(500);
      res.render("error", {error});
      //res.status(500).json({ error: "Internal Server Error" });
    }
  });
app.listen(process.env.PORT || port, () => {
  console.log(`Server is listening on port ${port}`);
});
