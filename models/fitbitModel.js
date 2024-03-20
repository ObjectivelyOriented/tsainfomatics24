const mongoose = require('mongoose');
const {Schema} = mongoose;

const fitbitSchema = new Schema({
    userId: String,
    accessToken: String,
    refreshToken: String
})

const FitbitModel = mongoose.model("fitbit", fitbitSchema)
module.exports = FitbitModel
