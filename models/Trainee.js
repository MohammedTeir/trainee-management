const mongoose = require('mongoose');
const { Schema } = mongoose;

const statuses = ['active', 'inactive'];

const traineeSchema = new Schema({
  name: {
    type: String,
    
  },
  email: {
    type: String,
    
    unique: true
  },
  authId: {
    type: String,
  },
  password: {
    type: String,
  
  paymentCard: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentCard',
  },

  },
  discipline: {
    type: Schema.Types.ObjectId,
    ref: 'Discipline',
    
  },
  status: {
    type: String,
    enum: statuses,
    default: 'inactive'
  },
  contactInfo: {
    phone: {
      type: String,
      
    },
    address: {
      type: String,
      
    }
  },
  advisor: {
    type: Schema.Types.ObjectId,
    ref: 'Advisor'
  },
  
  identityDocuments: [{
    name: {
      type: String,
      
    },
    url: {
      type: String,
      
    },
  }],
  uploadedDocuments: [{
    type: Schema.Types.ObjectId,
    ref: 'Document'
  }],
  
  attendanceRecords: [{
    type: Schema.Types.ObjectId,
    ref: 'TraineeAttendance'
  }]
});

module.exports = mongoose.model('Trainee', traineeSchema);
