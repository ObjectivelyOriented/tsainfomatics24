require("dotenv").config(); //for using variables from .env file.
const express = require("express");
const mongoose = require("mongoose");
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


const doctorroutes = require('./routes/doctorroutes')
const fitbitroutes = require('./routes/fitbitroutes')
const journalroutes = require('./routes/journalroutes')
const secureRoutes = require('./routes/secureroutes');
const apptRoutes = require("./routes/apptroute");

const app = express();
const port = 3000;

var passport = require('passport');

var expressSession = require('express-session');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());

app.use(expressSession({
  secret: process.env.AUTH_SECRET_KEY,
  resave: true,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

var flash = require('connect-flash');
app.use(flash());

// Initialize Passport
var initPassport = require('./passport/init');
initPassport(passport);

var authroutes = require('./routes/authroutes')(passport);
app.use('/auth', authroutes);







app.use(express.static('public'));

app.use("/doctor", doctorroutes);
app.use("/fitbit", fitbitroutes);
app.use("/journals", journalroutes);
app.use("/user", secureRoutes);
app.use("/appt", apptRoutes);


app.use(express.static(__dirname + '/public'));
app.set('views', './views');
app.set("view engine", "ejs")


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
