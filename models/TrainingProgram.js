const mongoose = require('mongoose');

const trainingProgramSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  cost: {
    type: Number,
    required: true
  },
  materials: [{
    name: String,
    url: String
  }],
  discipline: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Discipline',
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Manager',
    required: true
  },
  status: {
    type: String,
    enum: ['planned', 'in_progress', 'completed'],
    default: 'planned'
  },
  createdDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  image: {
    type: String,  
  }
});

module.exports = mongoose.model('TrainingProgram', trainingProgramSchema);
