require("dotenv").config();
const express = require('express');
const router = express.Router();
var User = require('../models/userModel');
//const {isAuthenticated} = require ("./secureroutes");
var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated())
      return next();
    res.redirect('/');
  }

router.get("/", isAuthenticated ,async (req, res)=>{

    res.render("appt", {appointments: req.user});
  })
  

  router.post("/newappt", isAuthenticated, async (req, res) => {
    try {
    const user = await User.findOne({ username: req.user.username });
      user.appointments.push(req.body);
      await user.save();
      res.render("/appt");
      //res.status(200).json(journals);
    } catch (error) {
      //res.status(500).json({ error: "Internal Server Error" });
      console.log(error);
      res.status(500);
      res.render("error", {error});
    }
  });
  router.post("/newappt", isAuthenticated, async (req, res) => {
    try {
    const user = await User.findOne({ username: req.user.username });
      user.appointments.push(req.body);
      await user.save();
      res.redirect("/appt");
      //res.status(200).json(journals);
    } catch (error) {
      //res.status(500).json({ error: "Internal Server Error" });
      console.log(error);
      res.status(500);
      res.render("error", {error});
    }
  });
  
  //deletes all appt
  router.get("/purge/:id",isAuthenticated,async (req, res) => {
    try {     
        await User.updateOne({ username: req.user.username  }, {
            $pull: {
                appointments: {_id: req.params.id},
            },
        });
        console.log("Deleted appt id: " + req.params.id);
    res.redirect("/appt");
    } catch (error) {
      console.log(error);
      res.status(500);
      res.render("error", {error});
      //res.status(500).json({ error: "Internal Server Error" });
    }
  });


module.exports = router