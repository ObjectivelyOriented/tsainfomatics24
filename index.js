require("dotenv").config(); //for using variables from .env file.
const express = require("express");
const mongoose = require("mongoose");
const JournalModel = require("./models/journal")
var axios = require("axios").default;
const app = express();
const port = 3000;
//const uri = "mongodb+srv://HendricksonTSA:a4MzaUFZ67HcIFdh@tsa2324.nwxsyzn.mongodb.net/";
const uri = "mongodb+srv://HendricksonTSA:a4MzaUFZ67HcIFdh@tsa2324.nwxsyzn.mongodb.net/?retryWrites=true&w=majority";
//Put client id and secret in env file

var authOptions = {
  method: 'POST',
  url: 'https://api.fitbit.com/oauth2/token',
  headers: {'content-type': 'application/x-www-form-urlencoded'},
  data: new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: '23RTQD',
    client_secret: 'fce8b10c985c39fac31229e8a5ae5973',
    code: '',
    redirect_uri: ' https://tsamentalhealthapp-0fee6615a9d9.herokuapp.com/callback'
  })
};

var apiCallOptions = {
  method: 'GET',
  url: 'https://api.fitbit.com/1/user/-/profile.json',
  headers: {'content-type': 'application/json', authorization: 'Bearer '}
};

mongoose.connect(process.env.MONGODB_URL /*|| uri*/).then(() => {
  console.log("MongoDB is connected!");
});


app.use(express.urlencoded({extended: true}))
app.use(express.static('public'));
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
  console.log(req.query.code);
  console.log(req.query.state);
  authOptions.data.code = req.query.code;
  //TODO: Add if statement to check if state in url is equal to generated state
  //Access token request
  axios.request(authOptions).then(function (response) {
    console.log(response.data);
    apiCallOptions.headers.authorization = "Bearer " + response.data.access_token;
    //API call
    axios.request(apiCallOptions).then(function (response) {
      console.log(response.data);
      res.status(201).json(response.data);
    }).catch(function (error) {
      console.error(error);
    });
  }).catch(function (error) {
    console.error(error);
  });

});

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
