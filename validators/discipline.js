
const Joi = require('joi');


const disciplineIdSchema = Joi.object({
    id: Joi.string().trim().required().messages({
      'any.required': 'Discipline ID is required',
      'string.empty': 'Discipline ID must not be empty'
    })
  });
  
  const createDisciplineSchema = Joi.object({
    name: Joi.string().required().messages({
      'any.required': 'Name is required',
      'string.empty': 'Name must not be empty'
    }),
    description: Joi.string().required().messages({
      'any.required': 'Description is required',
      'string.empty': 'Description must not be empty'
    })
  });

  const updateDisciplineSchema = Joi.object({
    name: Joi.string().optional(),
    description: Joi.string().allow('').optional()
  });
  const deleteDisciplineSchema = Joi.object({
    id: Joi.string().trim().required().messages({
      'any.required': 'Discipline ID is required',
      'string.empty': 'Discipline ID must not be empty'
    })
  });
  
  module.exports={disciplineIdSchema,createDisciplineSchema,updateDisciplineSchema,deleteDisciplineSchema};