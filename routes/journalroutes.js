require("dotenv").config();
const express = require('express');
const router = express.Router();
const JournalModel = require("../models/journal");

//TODO: add user objectid when journal is created


//Shows newly created journal entry
router.post("/new", async (req, res)=>{
    try {
       await JournalModel.create(req.body);
    
      res.redirect("/");
    } catch (error) {
      console.log(error);
      res.status(500);
      res.render("error", {error});
    }
  })
  
  //Shows all journals
  router.get("/", async (req, res) => {
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