require("dotenv").config(); //for using variables from .env file.
const randomstring = require("randomstring");
const code_verifier = randomstring.generate(128);
const authCode = '';

module.exports.code_verifier = code_verifier;
module.exports.testAuthOptions = testAuthOptions;
