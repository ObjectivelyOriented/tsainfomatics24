const express = require('express');
const router = express.Router();
/* GET Home Page */
// As with any middleware it is quintessential to call next()
  // if the user is authenticated
  var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated())
      return next();
    res.redirect('/');
  }
router.get('/profile', isAuthenticated, function(req, res){
    res.render('profile', { user: req.user });
  });

  module.exports = router;