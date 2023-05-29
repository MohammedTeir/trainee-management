const mongoose = require('mongoose');

const disciplineSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
  },
  description: {
    type: String,
    
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Discipline', disciplineSchema);
