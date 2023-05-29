const {Router} = require('express');
const {advisorController} = require('../controllers');
const router = Router();
const auth = require('../middlewares/auth.middleware');
const multer = require('../config/multer');


router.get('/trainees', multer.none() , auth('advisor'),  advisorController.viewTrainees);//
router.get('/trainee-progress/:id', multer.none() ,auth('advisor'),  advisorController.viewTraineeProgress);//
router.post('/register-advisor', multer.array('files') , advisorController.registerAdvisor);//
router.post('/login', multer.none() ,advisorController.login);//
router.delete('/', auth('advisor'), advisorController.deleteAdvisor);//
router.put('/', multer.none() , auth('advisor') ,advisorController.updateAdvisor);//
router.post('/logout', multer.none() , auth('advisor'),  advisorController.logout);//
router.post('/notifications', multer.none() ,auth('advisor'),  advisorController.sendNotification);//
router.get('/attendance-records', multer.none() ,auth('advisor'),  advisorController.viewAttendanceRecords);//
router.get('/appointment-requests', multer.none() ,auth('advisor'),  advisorController.viewAppointmentRequests);//
router.patch('/appointment-requests/accept/:id', multer.none() ,auth('advisor'),  advisorController.acceptAppointmentRequest);//
router.patch('/appointment-requests/reject/:id', multer.none() ,auth('advisor'),  advisorController.rejectAppointmentRequest);//
router.get('/trainee-documents', multer.none() ,auth('advisor'),  advisorController.viewTraineeUploadedDocuments);
router.get('/documents', multer.none() , auth('advisor'),  advisorController.myDocuments);//
router.post('/upload', multer.array('files') , auth('advisor'),  advisorController.uploadDocuments);//
router.get('/profile', multer.none() ,auth('advisor'), advisorController.profile);//
router.post('/general-advice', multer.none() ,auth('advisor'),advisorController.createGeneralAdvice);//
router.get('/:id', auth('manager'), multer.none(), advisorController.getAdvisorById);



module.exports = router;
