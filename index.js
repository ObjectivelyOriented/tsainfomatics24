require("dotenv").config(); //for using variables from .env file.
const express = require("express");
const mongoose = require("mongoose");
const JournalModel = require("./models/journal")
const app = express();
var session = require('express-session');
const port = 3000;
//const uri = "mongodb+srv://HendricksonTSA:a4MzaUFZ67HcIFdh@tsa2324.nwxsyzn.mongodb.net/";
const uri = "mongodb+srv://HendricksonTSA:a4MzaUFZ67HcIFdh@tsa2324.nwxsyzn.mongodb.net/?retryWrites=true&w=majority";
var passport = require('passport');
var FitbitStrategy = require( 'passport-fitbit-oauth2' ).FitbitOAuth2Strategy;;

var fitbitStrategy = new FitbitStrategy({
  clientID: "23RTQD",
  clientSecret: "fce8b10c985c39fac31229e8a5ae5973",
  scope: ['activity','heartrate','location','profile'],
  callbackURL: "http://localhost:3000/auth/fitbit/callback"
}, function(accessToken, refreshToken, profile, done) {
  // TODO: save accessToken here for later use

  done(null, {
    accessToken: accessToken,
    refreshToken: refreshToken,
    profile: profile
  });

});
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.authenticate('session'));
passport.use(fitbitStrategy);

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

var fitbitAuthenticate = passport.authenticate('fitbit', {
  successRedirect: '/auth/fitbit/success',
  failureRedirect: '/auth/fitbit/failure'
});

app.get('/auth/fitbit', fitbitAuthenticate);
app.get('/auth/fitbit/callback', fitbitAuthenticate);

app.get('/auth/fitbit/success', function(req, res, next) {
  res.send(req.user);
});

mongoose.connect(process.env.MONGODB_URL || uri).then(() => {
  console.log("MongoDB is connected!");
});


app.use(express.urlencoded({extended: true}))
app.use(express.static('public'));
app.set('views', './views');
app.set("view engine", "ejs")
app.use(passport.initialize());
app.use(passport.session({
  resave: false,
  saveUninitialized: true
}));


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
