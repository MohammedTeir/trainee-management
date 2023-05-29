const Joi = require('joi');

// Validation schemas
const createManagerSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'Name is required',
    'string.empty': 'Name must not be empty',
  }),
  email: Joi.string().email().required().messages({
    'any.required': 'Email is required',
    'string.empty': 'Email must not be empty',
    'string.email': 'Email must be a valid email address',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
    'string.empty': 'Password must not be empty',
  }),
});

const updateManagerSchema = Joi.object({
  name: Joi.string().optional().messages({
    'string.empty': 'Name must not be empty',
  }),
  email: Joi.string().email().optional().messages({
    'string.empty': 'Email must not be empty',
    'string.email': 'Email must be a valid email address',
  }),
  password: Joi.string().optional().messages({
    'string.empty': 'Password must not be empty',
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'any.required': 'Email is required',
    'string.empty': 'Email must not be empty',
    'string.email': 'Email must be a valid email address',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
    'string.empty': 'Password must not be empty',
  }),
});


const traineeIdSchema = Joi.object({
  trainee: Joi.string().required().messages({
      'any.required': 'Trainee ID is required',
      'string.empty': 'Trainee ID must not be empty',
    }),
  });
  
  const advisorIdSchema = Joi.object({
  advisor: Joi.string().required().messages({
      'any.required': 'Advisor ID is required',
      'string.empty': 'Advisor ID must not be empty',
    }),
  });

  module.exports={
    createManagerSchema,
    updateManagerSchema,
    loginSchema,
    traineeIdSchema,
    advisorIdSchema,
  };
  