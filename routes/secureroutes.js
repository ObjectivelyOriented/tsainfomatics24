const express = require('express');
const router = express.Router();
const User = require("../models/userModel");

router.get(
    '/profile',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
      User.find({}, (err, result) => {
        res.status(200).json({ data: result });
      });
    }
  );

  module.exports = router;