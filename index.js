require("dotenv").config(); //for using variables from .env file.
const express = require("express");
const mongoose = require("mongoose");
const JournalModel = require("./models/journal");
var axios = require("axios").default;
const randomstring = require("randomstring");
const crypto = require("crypto");
const base64url = require("base64url");
const doctorroutes = require('./routes/doctorroutes')
const app = express();
const port = 3000;


const code_verifier = randomstring.generate(128);

const base64Digest = crypto
  .createHash("sha256")
  .update(code_verifier)
  .digest("base64");

const code_challenge = base64url.fromBase64(base64Digest);
console.log(code_verifier);
console.log(code_challenge);


var apiCallOptions = {
  method: 'GET',
  url: 'https://api.fitbit.com/1/user/-/profile.json',
  //url: 'https://api.fitbit.com/1.2/user/-/sleep/list.json?afterDate=2010-05-01&sort=asc&offset=0&limit=1n',
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
    res.render("index", { journals:null, newJournal: null, date: null});
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
app.get("/fitbit", async (req, res) => {

  res.redirect("https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=23RVHM&scope=activity+cardio_fitness+electrocardiogram+heartrate+location+nutrition+oxygen_saturation+profile+respiratory_rate+settings+sleep+social+temperature+weight&code_challenge="+ code_challenge +"&code_challenge_method=S256&redirect_uri=https%3A%2F%2Farcane-castle-84229-a0015ab2dc2b.herokuapp.com%2Fcallback");
  
});

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
    code_verifier: "2u61543l3b2g3x60601n5c553348732v3t07475x3j2k6g2y5u4l6p6z130e1u3m47504f1d2l3g3h6g2e5q2m6n670h1x6v16345j101h4q0x4x2q015l1k0j2r6d3s"
  })
};
var testAuthOptions = {
  method: 'POST',
  url: 'https://api.fitbit.com/oauth2/token',

  headers: {'content-type': 'application/x-www-form-urlencoded', Authorization: "Basic " + Buffer.from("23RVHM" + ":" + "db95c38a5330ceadb41e0e0e333630ff", 'utf-8').toString('base64')},
  data: new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: "23RVHM",
    client_secret: "db95c38a5330ceadb41e0e0e333630ff",
   
    code: req.query.code,
    redirect_uri: 'https://arcane-castle-84229-a0015ab2dc2b.herokuapp.com/callback',
    code_verifier: code_verifier
  })
};
  console.log(req.params);
  console.log(req.query.code);
  //TODO: Add if statement to check if state in url is equal to generated state
  //Access token request
  axios.request(testAuthOptions).then(function (response) {
    
    //axios.request(testAuthOptions).then(function (response) {
    console.log(response.data);
    //apiCallOptions.headers.Authorization = "Bearer " + response.data.access_token;
    testApiCallOptions.headers.Authorization = "Bearer " + response.data.access_token;
    //API call
    axios.request(testApiCallOptions).then(function (response) {
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
/*
app.get("/request", function (req, res) {
//axios.request(testApiCallOptions).then(function (response) {
   //axios.request(apiCallOptions).then(function (response) {
  console.log(response.data);
  res.status(201).json(response.data);
}).catch(function (error) {
  console.error("API call error" + error);
});
//});
*/

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
