const PaymentCard = require('../models/PaymentCard');
const createError = require('http-errors');

const findPaymentCard = async (req, res, next) => {
    try {
      const traineeId = req.user.id;
      const paymentCard = await PaymentCard.findOne({ trainee: traineeId });
  
      if (!paymentCard) {
        const error = createError(404, 'Payment card not found');
        return next(error);
      }
  
      req.paymentCard = paymentCard;
      next();
    } catch (error) {
      return next(error);
    }
  };

module.exports=findPaymentCard;
  