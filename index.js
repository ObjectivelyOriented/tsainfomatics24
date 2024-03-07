require("dotenv").config(); //for using variables from .env file.
const express = require("express");
const mongoose = require("mongoose");
const { auth, requiresAuth } = require('express-openid-connect');
const randomstring = require("randomstring");
const JournalModel = require("./models/journal");
const doctorroutes = require('./routes/doctorroutes')
const fitbitroutes = require('./routes/fitbitroutes')
const journalroutes = require('./routes/journalroutes')
const app = express();
const port = 3000;

mongoose.connect(process.env.MONGODB_URL).then(() => {
  console.log("MongoDB is connected!");
});

const config = {
  authRequired: false,
  auth0Logout: true,
  baseURL: 'https://arcane-castle-84229-a0015ab2dc2b.herokuapp.com',
  clientID: 'gmZvUkTxUt9c7PTzn2gb1Z6pNHxYZIZ3',
  issuerBaseURL: 'https://dev-v-xmfn6j.us.auth0.com',
  secret: randomstring.generate(64)
};

app.use(auth(config));

app.use(express.urlencoded({extended: true}))

app.use(express.static('public'));
app.use("/doctor", doctorroutes);
app.use("/fitbit", fitbitroutes);
app.use("/journals", journalroutes);
app.use(express.static(__dirname + '/public'));
app.set('views', './views');
app.set("view engine", "ejs")

//Shows home page
app.get("/", async (req, res) => {
  try {
    const journals = await JournalModel.find();
    res.render("index", { journals:null, newJournal: null, date: null});
    res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
    //res.status(200).json(journals);
  } catch (error) {
    console.log(error);
    res.status(500);
    res.render("error", {error});
    //res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get('/profile', requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user, null, 2));
});

app.listen(process.env.PORT || port, () => {
  console.log(`Server is listening on port ${port}`);
});
