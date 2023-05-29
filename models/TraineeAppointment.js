const mongoose = require('mongoose');

const traineeAppointmentSchema = new mongoose.Schema({
  trainee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainee',
    
  },
  advisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Advisor',
    
  },
  appointmentDate: {
    type: Date,
    
  },
  duration: {
    type: Number,
    
  },
  location: {
    type: String,
    
  },
  notes: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Cancelled'],
    default: 'Pending'
  },
  createdDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('TraineeAppointment', traineeAppointmentSchema);
