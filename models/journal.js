const mongoose = require('mongoose');
const {Schema} = mongoose;

const QuestionaireSchema = new Schema({
    QuestionaireType: String,
    formAnswers: Array,
    optionalQuestion: String
})

const JournalSchema = new Schema({
    journalType: String,
    
    journalOne: {
        type: String,
        required: [true, "Firstname is required"]
    }, 
    journalTwo: {
        type: String,
        required: [true, "Lastname is required"]
    },
    checkbox: {
        type: Array
    },
    questionaire: [QuestionaireSchema],
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
    time : { type : Date, default: Date.now }
})

const JournalModel = mongoose.model("journal", JournalSchema)
module.exports = JournalModel
