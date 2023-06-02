const {Router} = require('express');
const {traineeController} = require('../controllers');
const router = Router();
const auth = require('../middlewares/auth.middleware');
const findPaymentCard = require('../middlewares/findPaymentCard');

const multer = require('../config/multer');

router.get('/appointments', auth('trainee'), multer.none(), traineeController.myAppointments);
router.post('/attendance',auth('trainee'),multer.none(), traineeController.createTraineeAttendance);
router.post('/logout',  auth('trainee'), multer.none(),  traineeController.logout);
router.put('/', auth('trainee'), multer.none(), traineeController.updateTraineeProfile);
router.get('/documents', auth('trainee'), multer.none(), traineeController.myDocuments);
router.get('/notifications', auth('trainee'),multer.none(),  traineeController.getTraineeNotifications);
router.get('/general-advice', multer.none(), auth('trainee'),  traineeController.getTraineeGeneralAdvice);
router.get('/attendance', multer.none(),auth('trainee'), traineeController.getTraineeAttendance);
router.get('/attendance/:id', multer.none(),auth('advisor'), traineeController.getTraineeAttendanceByTraineeId);
router.post('/join-program/:id', auth('trainee'), multer.none(), traineeController.joinToTrainingProgram);
router.get('/enrolled-programs', auth('trainee'),multer.none(),traineeController.getTraineeEnrolledPrograms);
router.delete('/remove-program/:id',auth('trainee'), multer.none(), traineeController.removeTraineeFromProgram);
router.get('/enrollment-details/:id', auth('trainee'), multer.none(),traineeController.getEnrolledProgramDetails);
router.put('/program/status',auth('trainee'), multer.none() , traineeController.updateEnrollmentStatus);
router.get('/programs/status/:status', auth('trainee'), traineeController.getTrainingProgramsByStatus);
router.get('/billings',auth('trainee'), multer.none(), traineeController.getTraineeBillings);
router.get('/billings/unpaid', auth('trainee'), multer.none(),traineeController.getUnpaidBillings);
router.get('/billings/paid/', auth('trainee'), multer.none(), traineeController.getPaidBillings);
router.patch('/billing/:id/pay',auth('trainee'),multer.none(),traineeController.payBilling);
router.post('/upload', auth('trainee'), multer.array('files'), traineeController.uploadDocuments);
router.get('/my-advisor/documents', auth('trainee'),multer.none(),  traineeController.getAdvisorDocuments);
router.post('/appointments', multer.none(), auth('trainee'),  traineeController.requestAppointment);
router.put('/appointments/:id', auth('trainee'), multer.none(), traineeController.cancelAppointment);
router.patch('/change-password', auth('trainee'),multer.none(),  traineeController.changeTraineePassword);
router.post('/payment-card', auth('trainee'),multer.none(),  traineeController.addPaymentCard);
router.get('/',  auth('trainee') , multer.none(), traineeController.myProfile);
//  router.get('/identity-documents', auth('trainee'),  traineeController.getIdentityDocuments);
router.post('/login', multer.none(), traineeController.login);
router.post('/register', multer.array('files'), traineeController.registerTrainee);
router.delete('/', auth('trainee'),multer.none(),traineeController.deleteTraineeAccount);
router.get('/:id', auth('advisor'), multer.none(), traineeController.getTraineeById);
router.get('/all-programs', auth('trainee'), multer.none(), traineeController.getAllTrainingPrograms);




module.exports = router;
