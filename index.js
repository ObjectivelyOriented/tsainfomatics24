require("dotenv").config(); //for using variables from .env file.
const express = require("express");
const mongoose = require("mongoose");
var passport = require('passport');
var session = require('express-session');


const User = require("./models/userModel");

const doctorroutes = require('./routes/doctorroutes')
const fitbitroutes = require('./routes/fitbitroutes')
const journalroutes = require('./routes/journalroutes')
const authroutes = require('./routes/authroutes')
const secureRoute = require('./routes/secureroutes');

const app = express();
const port = 3000;

mongoose.connect(process.env.MONGODB_URL).then(() => {
  console.log("MongoDB is connected!");
});


app.use(express.urlencoded({extended: true}))

app.use(express.static('public'));

app.use("/doctor", doctorroutes);
app.use("/fitbit", fitbitroutes);
app.use("/journals", journalroutes);
app.use("/auth", authroutes);
app.use('/user', passport.authenticate('jwt', { session: false }), secureRoute);

app.use(express.static(__dirname + '/public'));
app.set('views', './views');
app.set("view engine", "ejs")

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,

}));

app.use(passport.session());

//Shows home page
app.get("/", async (req, res) => {
  try {
    res.render("index");
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
