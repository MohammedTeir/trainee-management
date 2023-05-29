const {Router} = require('express');
const router = Router();
const auth = require('../middlewares/auth.middleware');
const multer = require('../config/multer');
const {traineeController,advisorController,trainingProgramController,managerController} = require('../controllers');

router.post('/manager', managerController.createManager);

router.put('/manager', auth('manager'), managerController.updateManager);

router.delete('/manager', auth('manager'), managerController.deleteManager);

router.get('/managers', auth('manager'), managerController.getAllManagers);

// router.get('/managers/:id', auth('manager'), managerController.getManagerById);

router.post('/manager/login', managerController.login);

router.post('/manager/logout', auth('manager'), managerController.logout);

router.get('/manager/profile', auth('manager'), managerController.profile);

// Route for generating a unique trainee ID and assigning an advisor
router.post('/manager/trainees/approval', multer.none() , auth('manager'), managerController.approvalUniqueTraineeID);

// Route for generating a unique advisor ID
router.post('/manager/advisors/approval', multer.none() , auth('manager'), managerController.approvalUniqueAdvisorID);

router.get('/inactive-trainees', multer.none() ,auth('manager'),  traineeController.getInactiveTrainees);

router.get('/active-trainees', multer.none() ,auth('manager'),  traineeController.getActiveTrainees);

router.get('/active-advisors', multer.none() ,auth('manager'),  advisorController.getActiveAdvisors);//

router.get('/inactive-advisors', multer.none() ,auth('manager'),  advisorController.getInactiveAdvisors);//

router.get('/program/attendance/:id', multer.none(), auth('manager'), trainingProgramController.getTraineeAttendanceByProgramId);


module.exports = router;
