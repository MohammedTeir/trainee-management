const {Router} = require('express');
const {trainingProgramController} = require('../controllers');
const router = Router();
const auth = require('../middlewares/auth.middleware');
const multer = require('../config/multer');


const uploadMiddleware = multer.fields([{ name: 'image' },{ name: 'materials' }]);


// Training program routes
router.post('/' , auth('manager') , uploadMiddleware , trainingProgramController.createTrainingProgram);
router.get('/date-range', multer.none() ,trainingProgramController.getTrainingProgramsByDateRange);
router.get('/trainees/:id/programs',multer.none() , trainingProgramController.getTrainingProgramsByTrainee);//
router.get('/cost-range', multer.none() ,trainingProgramController.getTrainingProgramsByCostRange);
router.get('/', multer.none() ,trainingProgramController.getTrainingProgramsByKeyword);
router.get('/all', multer.none() ,trainingProgramController.getAllTrainingPrograms);
router.post('/materials', auth('manager') , multer.array('materials'), trainingProgramController.addMaterialsToProgram);
router.delete('/:id/materials/:material', auth('manager') , multer.none() , trainingProgramController.removeMaterialFromProgram);
router.get('/:id/trainees/all', multer.none() ,trainingProgramController.getTraineesInProgram);
router.get('/:id/trainees', multer.none() ,trainingProgramController.getProgramEnrolledTrainees);
router.get('/:id/materials', multer.none() ,trainingProgramController.getMaterialsByTrainingProgram);
router.put('/:id/image', auth('manager'),  multer.single('image'), trainingProgramController.updateTrainingProgramImage);
router.put('/:id/status',auth('manager'),multer.none(),trainingProgramController.changeTrainingProgramStatus);
router.get('/:id' , multer.none() , trainingProgramController.getTrainingProgramById);
router.put('/:id', auth('manager') , multer.none()  ,trainingProgramController.updateTrainingProgram);
router.delete('/:id',auth('manager') , multer.none() , trainingProgramController.deleteTrainingProgram);

module.exports = router;
