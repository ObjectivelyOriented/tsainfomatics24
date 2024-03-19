const express = require('express');
const router = express.Router();
/* GET Home Page */
  var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated())
      return next();
    res.redirect('/');
  }
router.get('/profile', isAuthenticated, async(req, res)=>{
    res.render('profile', { user: req.user });
  });
  module.exports = router
 