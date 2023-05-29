const mongoose = require('mongoose');

const TraineeNotificationSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Advisor',
    
  },
  recipients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainee',
    
  }],
  message: {
    type: String,
    
  },
  date: {
    type: Date,
    default:Date.now
  }
});

module.exports = mongoose.model('TraineeNotification', TraineeNotificationSchema);
