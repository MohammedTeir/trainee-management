const Joi = require('joi');

const registerAdvisorSchema = Joi.object({
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
      'any.required': 'Advisor ID is required',
      'string.empty': 'Advisor ID must not be empty'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required',
      'string.empty': 'Password must not be empty'
    })
  });

  const viewTraineeProgressSchema = Joi.object({
    id: Joi.string().required().messages({
      'any.required': 'The traineeId parameter is required.',
      'string.empty': 'The traineeId parameter cannot be empty.',
    }),
  });

  const sendNotificationSchema = Joi.object({
    message: Joi.string().required().messages({

      'any.required': 'message is required',
      'string.empty': 'message must not be empty',
      
    }),
  });
  
  const viewAttendanceRecordsSchema = Joi.object({
    trainee: Joi.string().required().messages({
      'any.required': 'The traineeId field is required.',
      'string.empty': 'The traineeId field must not be empty.',
    }),
    program: Joi.string().required().messages({
      'any.required': 'The trainingProgramId field is required.',
      'string.empty': 'The trainingProgramId field must not be empty.',
    }),
  });

  const acceptAppointmentSchema = Joi.object({
    id: Joi.string().required().messages({
      'any.required': 'Appointment ID is required',
      'string.empty': 'Appointment ID must not be empty',
    }),
  });

  const rejectAppointmentRequestSchema = Joi.object({
    id: Joi.string().required().messages({
      'string.base': 'Appointment ID must be a string',
      'any.required': 'Appointment ID is required',
    }),
  });

  const viewTraineeUploadedDocumentsSchema = Joi.object({
    trainee: Joi.string().required().messages({
      'any.required': 'Trainee ID is required.',
      'string.empty': 'Trainee ID must not be empty.',
    }),
    
  });
  const uploadDocumentsSchema = Joi.object({
    files: Joi.array().required().min(1).messages({
      'any.required': 'Materials are required',
      'array.min': 'At least one material must be provided'
    })
  });


  const updateAdvisorSchema = Joi.object({
    name: Joi.string().optional(),
    email: Joi.string().email().optional().messages({
      'string.email': 'Invalid email format',
    }),
    password:Joi.string().min(6).optional(),
    phone: Joi.string().optional(),
    address: Joi.string().optional(),
    discipline: Joi.string().optional(),
  });

  const createGeneralAdviceSchema = Joi.object({
    subject: Joi.string().required().messages({
      'string.base': 'Subject must be a string',
      'any.required': 'Subject is required',
    }),
    content: Joi.string().required().messages({
      'string.base': 'Content must be a string',
      'any.required': 'Content is required',
    }),
  });

module.exports={
  registerAdvisorSchema,
  loginSchema,
  viewTraineeProgressSchema,
  sendNotificationSchema,
  viewAttendanceRecordsSchema,
  acceptAppointmentSchema,
  rejectAppointmentRequestSchema,
  viewTraineeUploadedDocumentsSchema,
  uploadDocumentsSchema,
  updateAdvisorSchema,
  createGeneralAdviceSchema
};
