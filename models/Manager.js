const mongoose = require('mongoose');
const { Schema } = mongoose;

const managerSchema = new Schema({
  name: {
    type: String,
    
  },
  email: {
    type: String,
    
    unique: true
  },
  password: {
    type: String,
    
  },
});

module.exports = mongoose.model('Manager', managerSchema);
