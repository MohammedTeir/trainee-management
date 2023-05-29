const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    
  },
  type: {
    type: String,
    trim: true,
    
  },
  url: {
    type: String,
    
  },
  uploader: [
    {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainee'
  },
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Advisor'
  }
],
  
  uploadDate: {
    type: Date,
    
  }
});

module.exports = mongoose.model('Document', documentSchema);
