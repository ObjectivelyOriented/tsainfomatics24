const mongoose = require('mongoose');
const {Schema} = mongoose;

const JournalSchema = new Schema({
    firstname: {
        type: String,
        required: [true, "Firstname is required"]
    }, 
    lastname: {
        type: String,
        required: [true, "Lastname is required"]
    },
    checkbox1: Boolean,
    checkbox2: Boolean,
    checkbox3: Boolean,
})

const JournalModel = mongoose.model("journal", JournalSchema)
module.exports = JournalModel
