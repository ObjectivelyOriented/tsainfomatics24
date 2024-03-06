require("dotenv").config(); //for using variables from .env file.
const express = require("express");
const mongoose = require("mongoose");
const JournalModel = require("./models/journal");
const doctorroutes = require('./routes/doctorroutes')
const fitbitroutes = require('./routes/fitbitroutes')
const app = express();
const port = 3000;

mongoose.connect(process.env.MONGODB_URL).then(() => {
  console.log("MongoDB is connected!");
});


app.use(express.urlencoded({extended: true}))

app.use(express.static('public'));
app.use("/doctor", doctorroutes);
app.use("/fitbit", fitbitroutes);
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
