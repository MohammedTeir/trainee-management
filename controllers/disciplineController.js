const Discipline = require('../models/Discipline');
const {disciplineValidator}= require('../validators');
const createError = require('http-errors');

const getAllDisciplines = async (req, res,next) => {
  try {
    const disciplines = await Discipline.find();
    return res.status(200).json({data:disciplines});
  } catch (error) {
    return next(error);
  }
};

// GET /disciplines/:id
const getDisciplineById = async (req, res,next) => {
  try {
    const { id } = req.params;

    const validation = disciplineValidator.disciplineIdSchema.validate({id});
    if (validation.error) {
      const error = createError(400, validation.error.details[0].message.replace(/"/g, ''));
      return next(error);
    }

    const discipline = await Discipline.findById(id);
    
    if (!discipline) {
      const error = createError(404, 'Discipline not found');
      return next(error);
    }

    return res.status(200).json({data:discipline});
  } catch (error) {
    return next(error);
  }
};

// POST /disciplines
const createDiscipline = async (req, res,next) => {
  try {

    
    const { name, description } = req.body;

   

    const validation = disciplineValidator.createDisciplineSchema.validate({ name, description });
    if (validation.error) {
      const error = createError(400, validation.error.details[0].message.replace(/"/g, ''));
      return next(error);
    }

    const existingDiscipline = await Discipline.findOne({ name });
    
    if (existingDiscipline) {
      const error = createError(409, 'A discipline with the same name already exists');
      return next(error);
    }

    const discipline = new Discipline({ name, description });
    const savedDiscipline = await discipline.save();
    
    return res.status(201).json({data:savedDiscipline});
  } catch (error) {
    return next(error);
  }
};

// PUT /disciplines/:id
const updateDiscipline = async (req, res,next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    
    const validation = disciplineValidator.updateDisciplineSchema.validate({ name, description });
    if (validation.error) {
      const error = createError(400, validation.error.details[0].message.replace(/"/g, ''));
      return next(error);
    }

    const existingDiscipline = await Discipline.findOne({ name, _id: { $ne: id } });
    if (existingDiscipline) {
      throw createError(409, 'A discipline with the same name already exists');
    }

    const discipline = await Discipline.findByIdAndUpdate(id, { name, description }, { new: true });
    
    if (!discipline) {

      const error = createError(404, 'Discipline not found');
      return next(error);
    }

    return res.status(200).json({data:discipline});
  } catch (error) {
    return next(error);
  }
};

// DELETE /disciplines/:id
const deleteDiscipline = async (req, res,next) => {
  try {
    const { id } = req.params;

    const validation = disciplineValidator.deleteDisciplineSchema.validate({id});
    if (validation.error) {
      const error = createError(400, validation.error.details[0].message.replace(/"/g, ''));
      return next(error);
    }

    const discipline = await Discipline.findByIdAndDelete(id);
    
    if (!discipline) {
      const error = createError(404, 'Discipline not found');
      return next(error);   
    
    }

    return res.status(200).json({ message: `${discipline.name} Discipline deleted successfully` });
  } catch (error) {
    return next(error)
  }
};

module.exports = {
  getAllDisciplines,
  getDisciplineById,
  createDiscipline,
  updateDiscipline,
  deleteDiscipline,
};
