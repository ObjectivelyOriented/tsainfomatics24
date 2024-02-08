require("dotenv").config(); //for using variables from .env file.
const express = require("express");
const mongoose = require("mongoose");
const JournalModel = require("./models/journal")
var axios = require("axios").default;
const app = express();
const port = 3000;

var apiCallOptions = {
  method: 'GET',
  url: 'https://api.fitbit.com/1/user/-/profile.json',
  headers: {'content-type': 'application/json', authorization: ''}
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
app.use(express.static(__dirname + '/public'));
app.set('views', './views');
app.set("view engine", "ejs")


//Shows newly created journal entry
app.post("/api/journal", async (req, res)=>{
  try {
    const journals = await JournalModel.find();
    const newJournal = await JournalModel.create(req.body);
    
    res.render("index", {journals: journals, newJournal: newJournal});
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
app.get("/callback", function (req, res) {
  
var authOptions = {
  method: 'POST',
  url: 'https://api.fitbit.com/oauth2/token',
  headers: {'content-type': 'application/x-www-form-urlencoded', Authorization: "Basic " + Buffer.from(process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET, 'utf-8').toString('base64')},
  data: new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    code: '',
    redirect_uri: 'https://tsamentalhealthapp-0fee6615a9d9.herokuapp.com/callback'
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
  
    res.redirect('/')
  }).catch(function (error) {
    console.error("Token request error " + error);
  });

});
app.get("/request", function (req, res) {
   axios.request(apiCallOptions).then(function (response) {
//axios.request(testApiCallOptions).then(function (response) {
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
app.listen(process.env.PORT || port, () => {
  console.log(`Server is listening on port ${port}`);
});
