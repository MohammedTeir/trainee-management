const Trainee = require('../models/Trainee');
const Advisor = require('../models/Advisor');
const EnrolledProgram = require('../models/EnrolledProgram')
const TraineeNotification = require('../models/TraineeNotification');
const TraineeAttendance = require('../models/TraineeAttendance');
const TraineeAppointment = require('../models/TraineeAppointment');
const Document = require('../models/Document');
const GeneralAdvice = require('../models/GeneralAdvice');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const dotenv = require('dotenv');
const revoked = require('../utils/revokeToken');
dotenv.config() // load environment variables from .env file
const secret = process.env.JWT_ADVISOR_SECRET;
const saltRounds = process.env.SALT_ROUNDS;
const salt = bcryptjs.genSaltSync(parseInt(saltRounds));

const createError = require('http-errors');
const {storage,getDownloadURL,ref , getMetadata , deleteObject,uploadBytesResumable} = require('../config/firebase');
const { advisorValidator } = require('../validators');




// // Function to create a new advisor
// const { Storage } = require('@google-cloud/storage');
// // Create a new instance of Google Cloud Storage and specify the name of the GCS bucket
// const storage = new Storage({
//   // projectId: process.env.GCLOUD_PROJECT_ID,
//   // keyFilename: path.join(__dirname, "../", process.env.GCLOUD_APPLICATION_CREDENTIALS),
// });

// const bucketName = process.env.GCLOUD_STORAGE_BUCKET_URL;

const registerAdvisor = async (req, res, next) => {
    try {

      const { name, email, password, phone, address, discipline } = req.body;

      const { error: validationError } = advisorValidator.registerAdvisorSchema.validate( {
        name:name, email:email, password:password, 
        phone:phone, address:address,
        discipline:discipline , files:req.files
      
      });
      if (validationError) {
        const error =  createError(400, validationError.details[0].message);
        return next(error);
      }

        // Check if user with same email already exists
        const existingAdvisor = await Advisor.findOne({ email: email });
        if (existingAdvisor) {
            const error = createError(400,'Advisor already exists');
            return next(error);
        }

        // Hash password and create new user
        const hashedPassword = await bcryptjs.hash(password, salt);

        // Create new advisor document in MongoDB
        const advisor = new Advisor({
            name: name,
            email: email,
            password: hashedPassword,
            contactInfo: {
                phone: phone,
                address: address
            },
            discipline: discipline,
        });

         // Upload identity documents to Google Cloud Storage
         const folderName = `identityDocuments/advisors/${advisor._id}`;

         const identityDocuments=[];
        
         for(const file of req.files){

          const fileName = file.originalname;
          const fileBuffer = file.buffer;
          const  destination = `${folderName}/${fileName}`;
          const identityDocumentReferance =  ref(storage,destination);
          const snapshot = await uploadBytesResumable(identityDocumentReferance,fileBuffer,{
         contentType: file.mimetype
       });

         const downloadURL = await getDownloadURL(snapshot.ref);

         identityDocuments.push({
           name: fileName,
           url: downloadURL,
         });

         }


         const registeredAdvisor = advisor.identityDocuments=identityDocuments;

         await advisor.save();


       return res.status(201).json({
            message: 'Advisor registered successfully',
            data: registeredAdvisor,
        });
    } catch (error) {
       return next(error);
    }
};



// Function to login an existing manager
const login = async (req, res, next) => {
    try {  
      
      const { error: validationError , value} = advisorValidator.loginSchema.validate(req.body);
      if (validationError) {
        const error =  createError(400, validationError.details[0].message);
        return next(error);
      }
      const { authId, password } = value;
      // Check if manager with provided email exists
      const advisor = await Advisor.findOne({ authId:authId });
      if (!advisor) {

        const error = createError(404, 'Advisor not found');
        return next(error);
      }
  
      // Check if provided password matches user's hashed password
      const isValidPassword = await bcryptjs.compare(password, advisor.password);
      if (!isValidPassword) {
        const error = createError(401,'Invalid id or password');
        return next(error);
      }
  
      // Create JWT token
      const accessToken = jwt.sign({ id: advisor._id }, secret, { expiresIn: '24h' });
      return res.status(200).json({
        status: 'success',
        message: 'Login successful',
        tokens: {
          accessToken
        }
      });
    } catch (error) {
      return next(error);
    }
  };
  

  const deleteAdvisor = async (req, res, next) => {
    try {
      const advisorID = req.user.id;
  
      let responseSent = false;
  
      const deletedAdvisor = await Advisor.findOneAndDelete({ _id: advisorID });
  
      if (!deletedAdvisor) {
        const error = createError(404,'Advisor not found');
        return next(error);
      }
  
      if (!responseSent) {
        revoked(req.token);
       return res.status(200).json({ message: 'Advisor deleted successfully', status: 'success' , _id: advisorID});
      }
    } catch (error) {
      return next(error);
    }
  };

  const updateAdvisor = async (req, res, next) => {
    try {

      const { error: validationError , value} = advisorValidator.updateAdvisorSchema.validate(req.body);
      if (validationError) {
        const error =  createError(400, validationError.details[0].message);
        return next(error);
      }

      const { name, email, phone, address, password , discipline } = value;
  
      const advisorId = req.user.id;
  
      // Check if advisor exists
      const advisor = await Advisor.findById(advisorId);
      if (!advisor) {
        const error = createError(404, 'Advisor not found');
        return next(error);
      }
  
      // Update advisor information
      advisor.name = name || advisor.name;
      advisor.email = email|| advisor.email;
      advisor.contactInfo.phone = phone || advisor.contactInfo.phone;
      advisor.contactInfo.address = address|| advisor.contactInfo.address;
      advisor.discipline = discipline|| advisor.discipline ;
  
      if (password) {
        const hashedPassword = await bcryptjs.hash(password, salt);
        advisor.password = hashedPassword;
      }
  

      // Save the updated advisor document
      await advisor.save();
  
      return res.status(200).json({
        message: 'Advisor updated successfully',
        data: advisor,
      });
    } catch (error) {
      return next(error);
    }
  };

  const getAdvisorById = async (req, res, next) => {
    try {

        const id = req.params.id;

        const advisor = await Advisor.findById(id);

        if (!advisor) {
          const error =  createError(404, 'Advisor not found');
          return next(error);
        }

        return res.status(200).json({data:advisor});
        
      } catch (err) {
        return next(error);
      }
  };
  

   // Function to log out manager
 const logout = async (req, res, next) => {
    try {
      // Clear JWT token from client-side
      res.clearCookie('token');

      revoked(req.token);

      return res.status(200).json({ message: 'Logout successful', status: 'success' });
      
    } catch (error) {
      return next(error);
    }
  };

// View list of trainees
const viewTrainees = async (req, res , next) => {
  try {

    const trainees = await Trainee.find({ advisor: req.user.id });


    return res.status(200).json({ data:trainees , count : trainees.length});
  } catch (error) {
    return next(error);
  }
};

// View trainee progress
const viewTraineeProgress = async (req, res, next) => {
  try {
    const { error: validationError, value } = advisorValidator.viewTraineeProgressSchema.validate({ id: req.params.id });
    if (validationError) {
      const error = createError(400, validationError.details[0].message);
      return next(error);
    }

    const traineeId = value.id;
    const advisorId = req.user.id;

    const trainee = await Trainee.findOne({ _id: traineeId, advisor: advisorId })
      .populate('uploadedDocuments')
      .exec();

    if (!trainee) {
      const error = createError(404, 'Trainee not found');
      return next(error);
    }

    const enrolledPrograms = await EnrolledProgram.find({ trainee: traineeId })
      .populate({
        path: 'program',
        select: 'name',
      })
      .exec();

    const attendanceRecords = await TraineeAttendance.find({ trainee: traineeId })
      .populate({
        path: 'trainingProgram',
        select: 'name',
      })
      .exec();

    trainee.enrolledPrograms = enrolledPrograms;
    trainee.attendanceRecords = attendanceRecords;

    return res.status(200).json({ data: trainee });
  } catch (error) {
    return next(error);
  }
};



// Send notifications
const sendNotification = async (req, res, next) => {
    try {

      const { error: validationError , value} = advisorValidator.sendNotificationSchema.validate(req.body);
      if (validationError) {
        const error =  createError(400, validationError.details[0].message);
        return next(error);
      }


    const { trainees, message } = value;
    const notification = new TraineeNotification({
    sender: req.user.id,
    recipients: trainees,
    message,
    });
    await notification.save();
    await notification.populate('sender recipients' , 'name email')
    return res.status(200).json({ message: 'Notification sent successfully' , data:notification });
    } catch (error) {
    return next(error);
    }
    };
// View attendance records
const viewAttendanceRecords = async (req, res, next) => {
  try {
    const { error: validationError, value } = advisorValidator.viewAttendanceRecordsSchema.validate(req.body);
    if (validationError) {
      const error = createError(400, validationError.details[0].message);
      return next(error);
    }

    const { trainee, program } = value;
    const attendanceRecords = await TraineeAttendance.find({ trainee: trainee, trainingProgram: program });
    return res.status(200).json({ data: attendanceRecords });
  } catch (error) {
    return next(error);
  }
};



    // View appointment requests
const viewAppointmentRequests = async (req, res, next) => {
    try {
    const appointmentRequests = await TraineeAppointment.find({ advisor: req.user.id }).populate('trainee' , 'name email').select(['-advisor']);
   return res.status(200).json({ data:appointmentRequests });
    } catch (error) {
   return  next(error);
    }
    };

    // Accept appointment request
    const acceptAppointmentRequest = async (req, res, next) => {
      try {

        const { error: validationError , value} = advisorValidator.acceptAppointmentSchema.validate({id:req.params.id});
      if (validationError) {
        const error =  createError(400, validationError.details[0].message);
        return next(error);
      }

        const { id } = value;
        const appointmentRequest = await TraineeAppointment.findOne({ _id: id, advisor: req.user.id }).populate('trainee' , 'name email').select(['-advisor']);
    
        if (!appointmentRequest) {
          const error = createError(404, 'Appointment request not found');
          return next(error);
        }
    
        // Check for conflicting appointments
        const conflictingAppointments = await TraineeAppointment.find({
          advisor: req.user.id,
          status: 'Approved',
          appointmentDate: appointmentRequest.appointmentDate,
        });
    
        if (conflictingAppointments.length > 0) {
          const error = createError(400, 'There is a conflicting appointment at the same time and date');
          return next(error);
        }
    
        appointmentRequest.status = 'Approved';
        await appointmentRequest.save();
    
        return res.status(200).json({ message: 'Appointment request accepted successfully' });
      } catch (error) {
        return next(error);
      }
    };
    
    

    // Reject appointment request
const rejectAppointmentRequest = async (req, res, next) => {
    try {

      const { error: validationError , value} = advisorValidator.rejectAppointmentRequestSchema.validate({id:req.params.id});
      if (validationError) {
        const error =  createError(400, validationError.details[0].message);
        return next(error);
      }

      const { id } = value;
    const appointmentRequest = await TraineeAppointment.findOne({ _id: id, advisor: req.user.id }).populate('trainee' , 'name email').select(['-advisor']);
    if (!appointmentRequest) {
      const error = createError(404,'Appointment request not found');
      return next(error);
    }
    appointmentRequest.status = 'Cancelled';
    await appointmentRequest.save();
    res.status(200).json({ message: 'Appointment request rejected successfully' });
    } catch (error) {
    return next(error);
    }
    };
    
    // View uploaded documents
    const viewTraineeUploadedDocuments = async (req, res, next) => {
      try {

        const { error: validationError , value} = advisorValidator.viewTraineeUploadedDocumentsSchema.validate(req.body);
        if (validationError) {
          const error =  createError(400, validationError.details[0].message);
          return next(error);
        }

        const { trainee } = value;
    
        // Find the trainee by ID
        const isTrainee = await Trainee.findOne({_id: trainee ,advisor:req.user.id}).populate(['uploadedDocuments','name url']).select(['-uploader']);
    
        if (!isTrainee) {
          const error = createError(404, 'Trainee not found');
          return next(error);
        }
    
        // Get the trainee's uploaded documents
       isTrainee.documents;

       isTrainee.save();
        return res.status(200).json({
          message: 'Trainee uploaded documents retrieved successfully',
          data: isTrainee.uploadedDocuments,
        });
      } catch (error) {
        return next(error);
      }
    };
    

const uploadDocuments = async (req, res, next) => {
      try {
        console.log(req);
        const { error: validationError ,value } = advisorValidator.uploadDocumentsSchema.validate({files:req.files});
        if (validationError) {
          const error =  createError(400, validationError.details[0].message);
          return next(error);
        }

        const advisorId = req.user.id;
        const advisor = await Advisor.findById(advisorId);
    
        if (!advisor) {
          const error =  createError(404, 'Advisor not found');
          return next(error);
        }
    
        const folderName = `uploadedDocuments/advisors/${advisor._id}`;
        const files = value.files;
        const documents=[];
       
        for(const file of files){

         const fileName = file.originalname;
         const fileBuffer = file.buffer;
         const  destination = `${folderName}/${fileName}`;
         const uploadedDocumentsReferance =  ref(storage,destination);
         const snapshot = await uploadBytesResumable(uploadedDocumentsReferance,fileBuffer,{
        contentType: file.mimetype
      });

        const downloadURL = await getDownloadURL(snapshot.ref);

        
        const document = new Document({
          name: fileName, // Set the name of the document as the file name
          type: file.mimetype, // Set the type of the document as the file mimetype
          url: downloadURL, // Set the URL of the document as the download URL obtained after uploading the file
          uploader: advisor._id, // Set the uploader field as the ID of the advisor who uploaded the document
          uploadDate: new Date() // Set the upload date as the current date and time
        });

        await document.save();

        documents.push(document._id);
        }


       advisor.uploadedDocuments=documents;
        await advisor.save();
    
       return res.status(200).json({
          message: 'Document uploaded successfully',
          data: advisor
        });
      } catch (error) {
        return next(error);
      }
    };

    
const myDocuments = async (req, res, next) => {
      try {
        const advisorId = req.user.id;
    
        const mydocuments = await Document.find({ uploader: advisorId }); // Await the execution
    
        return res.status(200).json({
          message: 'Documents retrieved successfully',
          data: mydocuments,
        });
      } catch (error) {
        return next(error);
      }
    };
    
    

  const getActiveAdvisors = async (req, res, next) => {
      try {
        const activeAdvisors = await Advisor.find({ status: 'active' }).populate('trainees', 'name email'); // find all active advisors and populate the 'discipline' field with the name of the discipline
       return res.status(200).json({data:activeAdvisors}); // return the active advisors in the response
      } catch (error) {
       return next(error); // return a server error response if there is an error
      }
    };

  const getInactiveAdvisors = async (req, res, next) => {
      try {
        const inactiveAdvisors = await Advisor.find({ status: "inactive" });
        return res.status(200).json({ data: inactiveAdvisors });
      } catch (error) {
        return next(error);
      }
    };
    
  const profile = async (req, res, next) => {

      const id  = req.user.id;
  
      try {
        const advisor = await Advisor.findById(id).select(['-password','-_id']).populate('uploadedDocuments trainees' , 'name url');
        if (!advisor) {
          const error = createError(404, 'Advisor not found');
          return next(error);
        }
        return res.status(200).json({
          status: 'success',
          message: 'Manager data retrieved successfully',
          data: advisor
        });
      } catch (error) {
        return next(error);
      }
    };

    const createGeneralAdvice = async (req, res, next) => {
      try {

        const { error: validationError ,value } = advisorValidator.createGeneralAdviceSchema.validate(req.body);
        if (validationError) {
          const error =  createError(400, validationError.details[0].message);
          return next(error);
        }

        const { subject, content, trainees } = value;
    
        // Check if the advisor exists
        const isAdvisor = await Advisor.findById(req.user.id);
        if (!isAdvisor) {
          const error = createError(404, 'Advisor not found');
          return next(error);
        }
    
        // Create a new general advice instance
        const generalAdvice = new GeneralAdvice({
          advisor: isAdvisor._id,
          subject,
          content,
          trainees: trainees,
        });
    
        // Save the general advice to the database
        const savedGeneralAdvice = await generalAdvice.save();
        await savedGeneralAdvice.populate('trainees','name');
        

        return res.status(201).json({
          message: 'General advice created successfully',
          data: savedGeneralAdvice,
        });
      } catch (error) {
        return next(error);
      }
    };

    
module.exports={
    viewTrainees,
    viewTraineeProgress,//
    registerAdvisor,
    login,
    logout,
    sendNotification,//
    viewAttendanceRecords,//
    viewAppointmentRequests,//
    acceptAppointmentRequest,//
    rejectAppointmentRequest,//
    viewTraineeUploadedDocuments,//
    getActiveAdvisors,
    getInactiveAdvisors,
    myDocuments,
    uploadDocuments,
    profile,
    updateAdvisor,
    deleteAdvisor,
    createGeneralAdvice,
    getAdvisorById,
}