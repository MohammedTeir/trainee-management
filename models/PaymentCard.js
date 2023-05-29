const mongoose = require('mongoose');

const paymentCardSchema = new mongoose.Schema({
  cardNumber: {
    type: String,
    required: true,
  },
  cardHolder: {
    type: String,
    required: true,
  },
  expirationMonth: {
    type: Number,
    required: true,
  },
  expirationYear: {
    type: Number,
    required: true,
  },
  cvv: {
    type: String,
    required: true,
  },
  trainee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainee',
  },
});

const PaymentCard = mongoose.model('PaymentCard', paymentCardSchema);

module.exports = PaymentCard;
