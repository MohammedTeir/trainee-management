const Joi = require('joi');

const registerTraineeSchema = Joi.object({

  name: Joi.string().required().messages({
    'any.required': 'Name is required',
    'string.empty': 'Name must not be empty',
  }),
  email: Joi.string().email().required().messages({
    'any.required': 'Email is required',
    'string.empty': 'Email must not be empty',
    'string.email': 'Email must be a valid email address',
  }),
  password: Joi.string().min(6).required().messages({
    'any.required': 'Password is required',
    'string.empty': 'Password must not be empty',
    'string.min': 'Password must be at least 6 characters long',
  }),
  phone: Joi.string().required().messages({
    'any.required': 'Phone number is required',
    'string.empty': 'Phone number must not be empty',
  }),
  address: Joi.string().required().messages({
    'any.required': 'Address is required',
    'string.empty': 'Address must not be empty',
  }),
  discipline: Joi.string().required().messages({
    'any.required': 'Discipline ID is required',
    'string.empty': 'Discipline ID must not be empty',
  }),
  files: Joi.array().required().min(1).messages({
      'any.required': 'Identity documents are required',
      'array.empty': 'Identity documents must not be empty',
    }),
});

  const loginSchema = Joi.object({
    authId: Joi.string().required().messages({
      'string.base': 'authId must be a string',
      'any.required': 'authId is required'
    }),
    password: Joi.string().required().messages({
      'string.base': 'password must be a string',
      'any.required': 'password is required'
    })
  });

  const getTraineeByIdSchema = Joi.object({
    id: Joi.string()
      .required()
      .messages({
        'any.required': 'Trainee ID is required',
        'string.empty': 'Trainee ID must not be empty',
      }),
  });


  const uploadDocumentsSchema = Joi.object({
    files: Joi.array().required().messages({
      'any.required': 'Files are required',
      'array.empty': 'At least one file must be provided',
    }),
  });



  const requestTraineeAppointmentSchema = Joi.object({

    appointmentDate: Joi.date().required().messages({
      'any.required': 'Appointment date is required.',
      'date.base': 'Invalid appointment date.',
    }),
    duration: Joi.number().integer().positive().required().messages({
      'any.required': 'Duration is required.',
      'number.base': 'Duration must be a number.',
      'number.integer': 'Duration must be an integer.',
      'number.positive': 'Duration must be a positive number.',
    }),
    location: Joi.string().required().messages({
      'any.required': 'Location is required.',
      'string.empty': 'Location must not be empty.',
    }),
    notes: Joi.string().allow('').optional(),
  });

  const cancelAppointmentSchema = Joi.object({
    id: Joi.string().required().messages({
      'any.required': 'Appointment ID is required',
      'string.empty': 'Appointment ID must not be empty'
    })
  });

  const updateTraineeProfileSchema = Joi.object({
    name: Joi.string().optional().trim().max(255).messages({
      'string.trim': 'Name must not have leading or trailing spaces',
      'string.max': 'Name must not exceed 255 characters'
    }),
    email: Joi.string().optional().email().trim().max(255).messages({
      'string.email': 'Email must be a valid email address',
      'string.trim': 'Email must not have leading or trailing spaces',
      'string.max': 'Email must not exceed 255 characters'
    }),
    phone: Joi.string().optional().trim().max(20).messages({
      'string.trim': 'Phone must not have leading or trailing spaces',
      'string.max': 'Phone must not exceed 20 characters'
    }),
    address: Joi.string().optional().trim().max(255).messages({
      'string.trim': 'Address must not have leading or trailing spaces',
      'string.max': 'Address must not exceed 255 characters'
    }),
    discipline: Joi.string().optional().messages({
      'string.empty': 'Discipline ID must not be empty'
    }),
    password: Joi.string().optional().min(6).max(255).messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password must not exceed 255 characters'
    })
  });

  const changeTraineePasswordSchema = Joi.object({
    oldPassword: Joi.string().required().messages({
      'any.required': 'Old password is required',
      'string.empty': 'Old password must not be empty'
    }),
    newPassword: Joi.string().required().min(6).max(255).messages({
      'any.required': 'New password is required',
      'string.empty': 'New password must not be empty',
      'string.min': 'New password must be at least 6 characters long',
      'string.max': 'New password must not exceed 255 characters'
    })
  });

  const joinToTrainingProgramSchema = Joi.object({
    id: Joi.string().required().messages({
      'any.required': 'Program ID is required',
      'string.empty': 'Program ID must not be empty'
    })
  });

  const removeTraineeFromProgramSchema = Joi.object({
    id: Joi.string().required().messages({
      'any.required': 'Program ID is required',
      'string.empty': 'Program ID must not be empty'
    })
  });

  const getEnrolledProgramDetailsSchema = Joi.object({
    id: Joi.string().required().messages({
      'any.required': 'Program ID is required',
      'string.empty': 'Program ID must not be empty'
    })
  });

  const getTrainingProgramsByStatusSchema = Joi.object({
    status: Joi.string().valid('Enrolled', 'Completed', 'Cancelled').required().messages({
      'any.required': 'Status is required',
      'string.empty': 'Status value must not be empty',
      'any.only': 'Status must be one of "enrolled", "completed", or "canceled"'
    })
  });
  
  const currentYear = new Date().getFullYear();

const addPaymentCardSchema = Joi.object({
  cardNumber: Joi.string().required().messages({
    'any.required': 'Card number is required.',
    'string.empty': 'Card number is required.',
  }),
  cardHolder: Joi.string().required().messages({
    'any.required': 'Card holder name is required.',
    'string.empty': 'Card holder name is required.',
  }),
  expirationMonth: Joi.number()
    .integer()
    .min(1)
    .max(12)
    .required()
    .messages({
      'any.required': 'Expiration month is required.',
      'number.base': 'Expiration month must be a number.',
      'number.integer': 'Expiration month must be an integer.',
      'number.min': 'Invalid expiration month.',
      'number.max': 'Invalid expiration month.',
    }),
  expirationYear: Joi.number()
    .integer()
    .min(currentYear)
    .required()
    .messages({
      'any.required': 'Expiration year is required.',
      'number.base': 'Expiration year must be a number.',
      'number.integer': 'Expiration year must be an integer.',
      'number.min': 'Invalid expiration year.',
    }),
  cvv: Joi.string().required().messages({
    'any.required': 'CVV is required.',
    'string.empty': 'CVV is required.',
  }),
});

const payBillingSchema = Joi.object({
  id: Joi.string().required().messages({
    'any.required': 'Billing ID is required',
    'string.empty': 'Billing ID must not be empty',
  }),
});
  
const createBillingSchema = Joi.object({
  amount: Joi.number().required().min(0).positive().precision(2)
    .messages({
      'any.required': 'Amount is required',
      'number.base': 'Amount must be a number',
      'number.empty': 'Amount is required',
      'number.min': 'Amount must be greater than or equal to 0',
      'number.positive': 'Amount must be a positive number',
      'number.precision': 'Amount must have up to 2 decimal places',
    }),
  description: Joi.string().required().trim().min(3).max(100)
    .messages({
      'any.required': 'Description is required',
      'string.base': 'Description must be a string',
      'string.empty': 'Description is required',
      'string.min': 'Description must be at least 3 characters long',
      'string.max': 'Description cannot exceed 100 characters',
    }),
});

const updateEnrollmentSchema = Joi.object({
  program: Joi.string()
    .required()
    .messages({
      'any.required': 'Program ID is required',
      'string.empty': 'Program ID must not be empty',
    }),
  status: Joi.string()
    .valid('Enrolled', 'Completed', 'Cancelled')
    .required()
    .messages({
      'any.required': 'Enrollment status is required',
      'string.empty': 'Enrollment status must not be empty',
      'any.only': 'Enrollment status must be one of "enrolled", "completed", or "cancelled"',
    }),
});

  module.exports={
    registerTraineeSchema,
    loginSchema,
    getTraineeByIdSchema,
    uploadDocumentsSchema,
    requestTraineeAppointmentSchema,
    cancelAppointmentSchema,
    updateTraineeProfileSchema,
    changeTraineePasswordSchema,
    joinToTrainingProgramSchema,
    removeTraineeFromProgramSchema,
    getEnrolledProgramDetailsSchema,
    getTrainingProgramsByStatusSchema,
    addPaymentCardSchema,
    payBillingSchema,
    createBillingSchema,
    updateEnrollmentSchema,
  };
