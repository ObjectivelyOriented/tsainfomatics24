const mongoose = require('mongoose')
const {Schema} = mongoose
const apptSchema = new Schema({
      createdAt: { type : Date, default: Date.now },
    apptName: String,
    date: String,
    startTime: String,
    endTime: String,
    doctor: {type: Boolean, default: false},
    meds: {type: Boolean, default: false}
})
const patientSchema = new Schema ({
    userid: { type: Schema.Types.ObjectId, required: true },
    username: { type: String, required: true },

})

const UserSchema = new Schema ({
    username: String,
    password: String,
//email: String,
firstName: String,
lastName: String,
doctorName: String,
doctor: {type: Boolean, default: false},
user: {type: Boolean, default: false},
createdOn : { type : Date, default: Date.now },
appointments: [apptSchema],
patient:[patientSchema],
illnesses: {type: Array},
fitbitData:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'fitbit'
}

})


const UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel;