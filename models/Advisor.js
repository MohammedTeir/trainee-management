const mongoose = require('mongoose');
const { Schema } = mongoose;

const statuses = ['active', 'inactive'];

const advisorSchema = new Schema({
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
    
  },
  contactInfo: {
    phone: {
      type: String,
      
    },
    address: {
      type: String,
      
    }
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
  trainees: [{
    type: Schema.Types.ObjectId,
    ref: 'Trainee'
  }],
  // meetings: [{
  //   type: Schema.Types.ObjectId,
  //   ref: 'ScheduledMeeting'
  // }],
  appointmentRequests: [{
    type: Schema.Types.ObjectId,
    ref: 'AdvisorAppointment'
  }],
  notifications: [{
    type: Schema.Types.ObjectId,
    ref: 'AdvisorNotification'
  }],
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
});

module.exports = mongoose.model('Advisor', advisorSchema);
