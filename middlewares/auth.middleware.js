const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const createError = require('http-errors');
dotenv.config() // load environment variables from .env file
const { tokenBlocklist } = require('../tokenBlocklist');

const auth = (roleGuard) => async (req, res, next) => {
  try {

    let secret;
    switch (roleGuard) {
      case 'trainee':
        secret = process.env.JWT_TRAINEE_SECRET;
        break;
      case 'manager':
        secret = process.env.JWT_MANAGER_SECRET;
        break;
      case 'advisor':
        secret = process.env.JWT_ADVISOR_SECRET;
        break;
    }
    const token = req.header('Authorization').replace('Bearer ', '');

    const decodedToken = jwt.verify(token, secret);

    req.user = decodedToken;
    req.token = token;

    if (token && tokenBlocklist.includes(token)) {
      const authError = createError(401 , 'Token has expired');
      return next(authError);
    }

    return next();
  } catch (error) {
    const authError = createError(401 , 'Unauthorized');
    return next(authError);
  }
};

module.exports = auth;


