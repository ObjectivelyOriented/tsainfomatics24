require("dotenv").config(); //for using variables from .env file.
const randomstring = require("randomstring");
const code_verifier = randomstring.generate(128);

var authOptions = {
    method: 'POST',
    url: 'https://api.fitbit.com/oauth2/token',
    headers: {'content-type': 'application/x-www-form-urlencoded', Authorization: "Basic " + Buffer.from(process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET, 'utf-8').toString('base64')},
    data: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      code: req.query.code,
      redirect_uri: 'https://tsamentalhealthapp-0fee6615a9d9.herokuapp.com/callback',
      code_verifier: code_verifier
    })
  };
  
var testAuthOptions = {
    method: 'POST',
    url: 'https://api.fitbit.com/oauth2/token',
  
    headers: {'content-type': 'application/x-www-form-urlencoded', Authorization: "Basic " + Buffer.from(process.env.TEST_CLIENT_ID + ":" + process.env.TEST_CLIENT_SECRET, 'utf-8').toString('base64')},
    data: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.TEST_CLIENT_ID,
      client_secret: process.env.TEST_CLIENT_SECRET,
      code: req.query.code,
      redirect_uri: 'https://arcane-castle-84229-a0015ab2dc2b.herokuapp.com/testcallback',
      code_verifier: code_verifier
    })
};

module.exports.authOptions = authOptions;
module.exports.code_verifier = code_verifier;
module.exports.testAuthOptions = testAuthOptions;