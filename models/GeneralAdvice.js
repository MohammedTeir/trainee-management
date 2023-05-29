const mongoose = require('mongoose');
const { Schema } = mongoose;

const GeneralAdviceSchema = new Schema({
  advisor: {
    type: Schema.Types.ObjectId,
    ref: 'Advisor',
    
  },
  subject: {
    type: String,
    
  },
  content: {
    type: String,
    
  },
  date: {
    type: Date,
    default: Date.now
  },
  trainees: [{
    type: Schema.Types.ObjectId,
    ref: 'Trainee',
    
  }]
});

module.exports = mongoose.model('GeneralAdvice', GeneralAdviceSchema);
