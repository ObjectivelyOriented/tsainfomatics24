const express = require('express');
const router = express.Router();
var passport = require('passport');
const User = require("../models/userModel");

router.get('/profile', function(req, res, next) {
    res.send(req.user);
});

  module.exports = router;