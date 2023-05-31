const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
  trainee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainee',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  description:{
    type: String,
  },
program: { 
    type: mongoose.Schema.Types.ObjectId,  
    ref: 'TrainingProgram' 
},
  status: {
    type: String,
    enum: ['unpaid', 'paid'],
    default: 'unpaid',
  },
  paymentDate: {
    type: Date,
  },
  // Other relevant fields can be added as needed
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

const Billing = mongoose.model('Billing', billingSchema);

module.exports = Billing;
