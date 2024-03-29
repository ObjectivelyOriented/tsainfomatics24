require("dotenv").config();
const express = require('express');
const router = express.Router();
const JournalModel = require("../models/journal");

//TODO: add user objectid when journal is created

var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/');
}
//Shows newly created journal entry
router.post("/new", isAuthenticated,async (req, res)=>{
    try {
        await JournalModel.create({...req.body, postedBy: req.user._id});
      res.redirect("/journals");
    } catch (error) {
      console.log(error);
      res.status(500);
      res.render("error", {error});
    }
  })
  router.get("/new", isAuthenticated,async (req, res) => {
    res.render("newjournal", {user: req.user});
  });
  
  //Shows all journals
  router.get("/", isAuthenticated,async (req, res) => {
    try {
    // const journals = await JournalModel.find();
     const journals = await JournalModel.find({postedBy: req.user._id});
    // .populate('author', 'username email'); 
      res.render("journals", {user:req.user,journals:journals, patients:null});
      //res.status(200).json(journals);
    } catch (error) {
      //res.status(500).json({ error: "Internal Server Error" });
      console.log(error);
      res.status(500); 
      res.render("error", {error});
    }
  });
  
  //deletes all journals
  router.get("/purge", async (req, res) => {
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


module.exports = router