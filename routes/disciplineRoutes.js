const express = require('express');
const router = express.Router();
const {disciplineController,trainingProgramController} = require('../controllers');
const auth = require('../middlewares/auth.middleware');

// GET /disciplines
router.get('/disciplines', disciplineController.getAllDisciplines);

// GET /disciplines/:id
router.get('/disciplines/:id', disciplineController.getDisciplineById);

// POST /disciplines
router.post('/disciplines', auth('manager') ,disciplineController.createDiscipline);

// PUT /disciplines/:id
router.put('/disciplines/:id',  auth('manager') ,disciplineController.updateDiscipline);

// DELETE /disciplines/:id
router.delete('/disciplines/:id',  auth('manager') ,disciplineController.deleteDiscipline);

router.get('/disciplines/:id/training-programs', trainingProgramController.getTrainingProgramsByDiscipline);

module.exports = router;
