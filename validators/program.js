const Joi = require('joi');


const createTrainingProgramSchema = Joi.object({

      name: Joi.string().required().messages({
        'string.empty': 'Name is required',
      }),
      description: Joi.string().required().messages({
        'string.empty': 'Description is required',
      }),
      startDate: Joi.date().required().messages({
        'date.empty': 'Start date is required',
        'any.required': 'Start date is required',
      }),
      endDate: Joi.date()
        .min(Joi.ref('startDate'))
        .required()
        .messages({
          'date.empty': 'End date is required',
          'date.min': 'End date must be greater than or equal to the start date',
          'any.required': 'End date is required',
        }),
      cost: Joi.number().positive().required().messages({
        'number.base': 'Cost must be a number',
        'number.positive': 'Cost must be a positive number',
        'number.empty': 'Cost is required',
        'any.required': 'Cost is required',
      }),
      discipline: Joi.string().required().messages({
        'string.empty': 'Discipline ID is required',
      }),
      image: Joi.required().messages({
        'object.empty': 'Image file is required',
        'any.required': 'Image file is required.',
      }),
      materials: Joi.array().required().min(1).messages({
        'any.required': 'Materials are required',
        'array.min': 'At least one material must be provided'
      })
    });

const getTrainingProgramSchema = Joi.object({
        id: Joi.string().required().messages({
          'string.empty': 'Training program ID is required',
        }),
      });


const updateTrainingProgramSchema = Joi.object({
        name: Joi.string().optional(),
        description: Joi.string().allow('').optional(),
        startDate: Joi.date().optional(),
        endDate: Joi.date()
          .min(Joi.ref('startDate'))
          .optional()
          .messages({
            'date.min': 'End date must be greater than or equal to the start date',
          }),
        cost: Joi.number().positive().optional().messages({
          'number.base': 'Cost must be a number',
          'number.positive': 'Cost must be a positive number',
        }),
        discipline: Joi.string().optional(),
      });

const updateEnrollmentSchema= Joi.object({
    id: Joi.string().required().messages({
      'string.empty': 'Enrollment ID is required',
    }),
    trainee: Joi.string().required().messages({
      'string.empty': 'Trainee ID is required',
    }),
    status: Joi.string().required().messages({
      'string.empty': 'Status is required',
    }),
  });

const addMaterialsToProgramSchema = Joi.object({
    program: Joi.string().required().messages({
      'string.empty': 'Program ID is required',
    }),
    materials: Joi.array().required().min(1).messages({
      'any.required': 'Materials are required',
      'array.min': 'At least one material must be provided'
    })
  });

const removeMaterialFromProgramSchema = Joi.object({
    id: Joi.string().required().messages({
      'string.empty': 'Training program ID is required',
    }),
    material: Joi.string().required().messages({
      'string.empty': 'Material ID is required',
    }),
  });

const deleteTrainingProgramSchema = Joi.object({
    id: Joi.string().required().messages({
      'string.empty': 'Training program ID is required',
    }),
  });

const getProgramEnrolledTraineesSchema = Joi.object({
    id: Joi.string().required().messages({
      'string.empty': 'Program ID is required',
    }),
  });

const getTraineesInProgramSchema = Joi.object({
    id: Joi.string().required().messages({
      'string.empty': 'Program ID is required',
    }),
  });

const getMaterialsByTrainingProgramSchema = Joi.object({
    id: Joi.string().required().messages({
      'string.empty': 'Training program ID is required',
    }),
  });

const getTrainingProgramsByTraineeSchema = Joi.object({
    trainee: Joi.string().required().messages({
      'string.empty': 'Trainee ID is required',
    }),
  });

const getTrainingProgramsByDateRangeSchema = Joi.object({
    startDate: Joi.date().required().messages({
      'date.base': 'Start date must be a valid date',
      'any.required': 'Start date is required',
    }),
    endDate: Joi.date().required().messages({
      'date.base': 'End date must be a valid date',
      'any.required': 'End date is required',
    }),
  });

const getTrainingProgramsByCostRangeSchema = Joi.object({

    minCost: Joi.number().required().messages({
      'number.base': 'Minimum cost must be a valid number',
      'number.empty': 'Minimum cost is required',
    }),
    maxCost: Joi.number().required().messages({
      'number.base': 'Maximum cost must be a valid number',
      'number.empty': 'Maximum cost is required',
    }),
  });

const getTrainingProgramsByKeywordSchema = Joi.object({
    keyword: Joi.string().required().messages({
      'string.empty': 'Keyword is required',
    }),
  });


const getTrainingProgramsByDisciplineSchema = Joi.object({
    id: Joi.string().required().messages({
      'string.empty': 'Discipline ID is required',
    }),
  });

const updateTrainingProgramStatusSchema = Joi.object({
    id: Joi.string().required(),
    status: Joi.string().valid('planned', 'in_progress', 'completed').required()
  });

  const updateTrainingProgramImageSchema = Joi.object({
    id: Joi.string().required().messages({
      'any.required': 'The training program ID is required.',
      'string.empty': 'The training program ID must not be empty.',
    }),
    image: Joi.object().required().messages({
      'any.required': 'Image file is required.',
    }),
  });

module.exports={
    createTrainingProgramSchema,
    getTrainingProgramSchema,
    updateTrainingProgramSchema,
    updateEnrollmentSchema,
    addMaterialsToProgramSchema,
    removeMaterialFromProgramSchema,
    deleteTrainingProgramSchema,
    getProgramEnrolledTraineesSchema,
    getTraineesInProgramSchema,
    getMaterialsByTrainingProgramSchema,
    getTrainingProgramsByTraineeSchema,
    getTrainingProgramsByDateRangeSchema,
    getTrainingProgramsByCostRangeSchema,
    getTrainingProgramsByKeywordSchema,
    getTrainingProgramsByDisciplineSchema,
    updateTrainingProgramStatusSchema,
    updateTrainingProgramImageSchema
};