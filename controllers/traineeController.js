const Trainee = require('../models/Trainee');
const GeneralAdvice = require('../models/GeneralAdvice');
const TraineeAppointment = require('../models/TraineeAppointment');
const TraineeAttendance = require('../models/TraineeAttendance');
const TraineeNotification = require('../models/TraineeNotification');
const EnrolledProgram = require('../models/EnrolledProgram');
const Billing = require('../models/Billing');
const PaymentCard = require('../models/PaymentCard');
const Advisor = require('../models/Advisor');
const Document = require('../models/Document');
const TrainingProgram = require('../models/TrainingProgram');


const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const dotenv = require('dotenv');
const revoked = require('../utils/revokeToken');
dotenv.config() // load environment variables from .env file
const secret = process.env.JWT_TRAINEE_SECRET;
const saltRounds = process.env.SALT_ROUNDS;
const salt = bcryptjs.genSaltSync(parseInt(saltRounds));
const createError = require('http-errors');
const {storage,getDownloadURL,ref , getMetadata , deleteObject,uploadBytesResumable} = require('../config/firebase');

const {traineeValidator}= require('../validators');

// const { Storage } = require('@google-cloud/storage');

// Create a new instance of Google Cloud Storage and specify the name of the GCS bucket
// const gcstorage = new Storage({
//   projectId: process.env.GCLOUD_PROJECT_ID,
//   keyFilename: path.join(__dirname, "../", process.env.GCLOUD_APPLICATION_CREDENTIALS),
// });

// const bucketName = process.env.GCLOUD_STORAGE_BUCKET_URL;

// const bucketName = process.env.FIREBASE_STORAGE_BUCKET_URL;


const registerTrainee = async (req, res, next) => {
  try {

    const { name, email, password, phone, address, discipline } = req.body;

    const { error: validationError } = traineeValidator.registerTraineeSchema.validate( {
      name:name, email:email, password:password, 
      phone:phone, address:address,
      discipline:discipline , files:req.files
    
    });
    if (validationError) {
      const error =  createError(400, validationError.details[0].message);
      return next(error);
    }

      // Check if user with same email already exists
      const existingTrainee = await Trainee.findOne({ email: email });
      if (existingTrainee) {
          const error = createError(400,'Trainee already exists');
          return next(error);
      }

      // Hash password and create new user
      const hashedPassword = await bcryptjs.hash(password, salt);

      // Create new advisor document in MongoDB
      const trainee = new Trainee({
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
       const folderName = `identityDocuments/trainees/${trainee._id}`;

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


       const registeredTrainee = trainee.identityDocuments=identityDocuments;

       await trainee.save();


     return res.status(201).json({
          message: 'Trainee registered successfully',
          data: registeredTrainee,
      });
  } catch (error) {
     return next(error);
  }
};



// Function to login an existing manager
const login = async (req, res, next) => {
    try {

      const { error:validationError, value } = traineeValidator.loginSchema.validate(req.body);
          if (validationError) {

            const error = createError(400,validationError.details[0].message);
            return next(error);
            
          }

      const { authId, password } = value;
  
      // Check if manager with provided email exists
      const trainee = await Trainee.findOne({ authId });
      if (!trainee) {

        const error = createError(401,'Invalid authId or password');
        return next(error);

      }
  
      // Check if provided password matches user's hashed password
      const isValidPassword = await bcryptjs.compare(password, trainee.password);
      if (!isValidPassword) {
        const error = createError(401,'Invalid authId or password');
        return next(error);
      }
  
      // Create JWT token
      const accessToken = jwt.sign({ id: trainee._id }, secret, { expiresIn: '24h' });
      return res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: trainee,
        tokens: {
          accessToken
        }
      });
    } catch (error) {
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

  // Retrieves the trainee's profile information from the database and returns it to the client.

  const myProfile = async (req, res, next) => {

    const id  = req.user.id;

    try {
      const trainee = await Trainee.findById(id).select(['-password']).populate('uploadedDocuments advisor');
      if (!trainee) {
        const error = createError(404, 'Trainee not found');
        return next(error);
      }

      const attendanceRecords = await TraineeAttendance.find({ trainee: id })
      .populate({
        path: 'trainingProgram',
        select: 'name',
      })
      .exec();

      trainee.attendanceRecords = attendanceRecords;

      return res.status(200).json({
        status: 'success',
        message: 'Trainee data retrieved successfully',
        data: trainee
      });
    } catch (error) {
      return next(error);
    }
  };

  // To retrieve the details of a specific trainee based on their ID.
  const getTraineeById = async (req, res, next) => {
    try {

      const { error:validationError, value } = traineeValidator.getTraineeByIdSchema.validate({id:req.params.id});
      if (validationError) {

        const error = createError(400,validationError.details[0].message);
        return next(error);
        
      }

        const {id} = value;

        const trainee = await Trainee.findById(id).populate('uploadedDocuments','name url');

        const traineeAttendance = await TraineeAttendance.find({ trainee: id }).populate('trainingProgram','name status');
        trainee.attendanceRecords = traineeAttendance;
        if (!trainee) {
          const error =  createError(404, 'Trainee not found');
          return next(error);
        }

      return res.status(200).json({data:trainee});
      } catch (err) {
        return next(error);
      }
};

  // To retrieve the attendance records of a trainee for a specific training program.
  const getTraineeAttendance = async (req, res, next) => {
    try {
      const traineeId = req.user.id;
      
      // Retrieve the trainee's attendance records from MongoDB
      const traineeAttendance = await TraineeAttendance.find({ trainee: traineeId }).populate('trainingProgram','name status');
  
      return res.status(200).json({ data:traineeAttendance });
    } catch (error) {
      return next(error);
    }
  };
  

  // To retrieve the notifications sent to a trainee.
  const getTraineeNotifications = async (req, res, next) => {
    try {
      const traineeId = req.user.id;
      const notifications = await TraineeNotification.find({ recipients: traineeId })
        .populate('sender', 'name email').select(['-recipients'])
        .sort({ date: -1 });
      return res.status(200).json({ data:notifications });
    } catch (error) {
      return next(error);
    }
  };
  
  

// To retrieve the uploaded documents of a trainee.
const myDocuments = async (req, res, next) => {
  try {
    const traineeId = req.user.id;

    const mydocuments = await Document.find({ uploader: traineeId }); // Await the execution

    return res.status(200).json({
      message: 'Documents retrieved successfully',
      data: mydocuments,
    });
  } catch (error) {
    return next(error);
  }
};

// Allows the trainee to upload a document and saves it to the database.
const uploadDocuments = async (req, res, next) => {
  try {

    const { error: validationError ,value } = traineeValidator.uploadDocumentsSchema.validate({files:req.files});
    if (validationError) {
      const error =  createError(400, validationError.details[0].message);
      return next(error);
    }

    const traineeId = req.user.id;
    const trainee = await Trainee.findById(traineeId);

    if (!trainee) {
      const error =  createError(404, 'Trainee not found');
      return next(error);
    }

    const folderName = `uploadedDocuments/trainess/${trainee._id}`;
    const {files} = value;
   
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
      uploader: trainee._id, // Set the uploader field as the ID of the trainee who uploaded the document
      uploadDate: new Date() // Set the upload date as the current date and time
    });

    await document.save();

    trainee.uploadedDocuments.push(document._id);
    }


    await trainee.save();

   return res.status(200).json({
      message: 'Document uploaded successfully',
      data: trainee
    });
  } catch (error) {
    return next(error);
  }
};


const getAdvisorDocuments = async (req, res, next) => {
  try {
    const  traineeId  = req.user.id;

    // Retrieve the trainee object from the database
    const trainee = await Trainee.findById(traineeId);

    // Get the advisorId from the trainee object
    const advisorId = trainee.advisor._id;

    // Retrieve the advisor's documents from Google Cloud Storage
    const advisorDocuments = await Document.find({ uploader: advisorId }).select(['-uploader']); // Await the execution

    

    return res.status(200).json({
      message: 'Documents retrieved successfully',
      data:advisorDocuments,
    });
  } catch (error) {
    return next(error);
  }
};



  // To retrieve general advice for a trainee.
  const getTraineeGeneralAdvice = async (req, res, next) => {
    try {

      const traineeId = req.user.id;      // Check if the trainee and advisor exist
      const trainee = await Trainee.findById(traineeId);
      if (!trainee) {
        const error =  createError(404, 'Trainee or advisor not found');
        return next(error);
      }
  
      // Retrieve all general advice given by the advisor to the trainee
      const generalAdvice = await GeneralAdvice.find({ trainees: traineeId}).populate('advisor','name email').select(['-trainees']);
      return res.status(200).json({data:generalAdvice});
    } catch (error) {
      return next(error);
    }
  };
  

  const getTraineeBillings = async (req, res, next) => {
    try {
      const traineeId = req.user.id;
      const billing = await Billing.find({ trainee: traineeId }).populate('trainee','name email');
      
      if (!billing) {
        const error =  createError(404,'Billing not found' );
        return next(error);
      }
      
      return res.status(200).json({data:billing});
    } catch (error) {
      return next(error);
    }
  };

  const getUnpaidBillings = async (req, res, next) => {

    try {
      const traineeId = req.user.id;
      const unpaidBillings = await Billing.find({ trainee: traineeId, status: 'unpaid' }).populate('trainee','name email');
      
      return res.status(200).json({data:unpaidBillings});
    } catch (error) {
      return next(error);
    }

  };
  
  const getPaidBillings = async (req, res, next) => {
    try {

      
     

      const traineeId = req.user.id;
      const paidBillings = await Billing.find({ trainee: traineeId, status: 'paid' }).populate('trainee','name email');
      
      return res.status(200).json({data:paidBillings});
    } catch (error) {
      return next(error);
    }
  };
  
  const payBilling = async (req, res, next) => {
    try {

      const { error: validationError ,value } = traineeValidator.payBillingSchema.validate({id:req.params.id});
      if (validationError) {
        const error =  createError(400, validationError.details[0].message);
        return next(error);
      }

      const billingId = value.id;
      const billing = await Billing.findById(billingId);
      
      
      if (!req.paymentCard) {
        const error = createError(404, 'Payment card not found');
        return next(error);
      }

      if (!billing) {
        const error =  createError(404, 'Billing not found');
        return next(error);
      }
      
      billing.status = 'paid';
      billing.paymentDate = new Date();
      await billing.save();
      
      return res.json({ message: 'Billing payment successful' , data:billing});
    } catch (error) {
      return next(error);
    }
  };
  
  
  
  
  
  const requestAppointment = async (req, res, next) => {
    try {
      const { error: validationError, value } = traineeValidator.requestTraineeAppointmentSchema.validate(
        req.body
      );
      if (validationError) {
        const error = createError(400, validationError.details[0].message);
        return next(error);
      }
  
      const { appointmentDate, duration, location, notes } = value;
      const traineeId = req.user.id; // assuming the trainee ID is stored in the req object
  
      const currentDate = new Date().setHours(0, 0, 0, 0);
  
      // Check if the trainee has already requested an appointment for the current date
      const existingAppointment = await TraineeAppointment.findOne({
        trainee: traineeId,
        createdDate: { $gte: currentDate, $lt: new Date() },
      });
  
      if (existingAppointment) {
        const error = createError(400, 'Appointment already requested for today');
        return next(error);
      }
  
      const trainee = await Trainee.findById(traineeId);
      if (!trainee) {
        const error = createError(404, 'Trainee not found');
        return next(error);
      }
  
      const advisor = trainee.advisor; // Assuming the trainee has an advisor field referencing the advisor
  
      const traineeAppointment = new TraineeAppointment({
        trainee: traineeId,
        advisor: advisor,
        appointmentDate: appointmentDate,
        duration: duration,
        location: location,
        notes: notes,
      });
  
      await traineeAppointment.save();
  
      await traineeAppointment.populate('advisor', 'name email');
  
      return res.status(201).json({
        status: 'success',
        message: 'Trainee appointment requested successfully',
        data: traineeAppointment,
      });
    } catch (error) {
      return next(error);
    }
  };
  
  
 
  const cancelAppointment = async (req, res, next) => {
    try {

      const { error: validationError ,value } = traineeValidator.cancelAppointmentSchema.validate({id:req.params.id});
      if (validationError) {
        const error =  createError(400, validationError.details[0].message);
        return next(error);
      }

      const { id } = value;
  
      // Find the appointment
      const appointment = await TraineeAppointment.findById(id);
      if (!appointment) {
        const error =  createError(404, 'Appointment not found');
        return next(error);
      }
  
      // Check if appointment is already cancelled
      if (appointment.status === 'Cancelled') {

        
        const error =  createError(400, 'Appointment is already cancelled');
        return next(error);

      }
  
      // Update appointment status to cancelled
      appointment.status = 'Cancelled';
      await appointment.save();
  
      // Send response
      return res.status(200).json({
        status: 'success',
        message: 'Appointment cancelled successfully',
        data:appointment
      });
    } catch (error) {
      return next(error);
    }
  };
  

  const  updateTraineeProfile = async (req, res , next) => {
    try {

      const { error: validationError ,value } = traineeValidator.updateTraineeProfileSchema.validate(req.body);
      if (validationError) {
        const error =  createError(400, validationError.details[0].message);
        return next(error);
      }

      const {name,email,phone,address,discipline,password} = value
      const trainee = await Trainee.findById(req.user.id);

      // Update advisor information
      trainee.name = name || trainee.name;
      trainee.email = email|| trainee.email;
      trainee.contactInfo.phone = phone || trainee.contactInfo.phone;
      trainee.contactInfo.address = address|| trainee.contactInfo.address;
      trainee.discipline = discipline || trainee.discipline ;
  
      if (password) {
        const hashedPassword = await bcryptjs.hash(password, salt);
        trainee.password = hashedPassword;
      }
  
      const updatedTrainee = await trainee.save();
      return res.status(200).json({data:updatedTrainee});
    } catch (error) {
       return next(error);

    }
  };
  
  const deleteTraineeAccount = async (req, res , next) => {
    try {
      const trainee = await Trainee.findById(req.user.id);
      await trainee.deleteOne();
      return res.status(200).json({ message: 'Trainee account deleted successfully.' , data:trainee });
    } catch (error) {
      return next(error);
    }
  };

  const changeTraineePassword = async (req, res , next) => {

    try {

      const { error: validationError ,value } = traineeValidator.changeTraineePasswordSchema.validate(req.body);
      if (validationError) {
        const error =  createError(400, validationError.details[0].message);
        return next(error);
      }

      const {  oldPassword, newPassword } = value;

      const trainee = await Trainee.findById(req.user.id);

      if (!trainee) {
        const error =  createError(404, 'Trainee not found');
        return next(error);
      }

      if (!bcryptjs.compareSync(oldPassword, trainee.password)) {

        const error =  createError(401, 'Incorrect old password');
        return next(error);
      }

      const hashedPassword = bcryptjs.hashSync(newPassword, salt);

      await Trainee.findByIdAndUpdate(req.user.id, { password: hashedPassword });

      return res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {

       return  next(error);
    }
  };
  
  const getActiveTrainees = async (req, res, next) => {
    try {
      const activeTrainees = await Trainee.find({ status: "active" }).populate("advisor", "name email");
      return res.status(200).json({ data: activeTrainees });
    } catch (error) {
      return next(error);
    }
  };

  const getInactiveTrainees = async (req, res, next) => {
    try {
      const trainees = await Trainee.find({ status: "inactive" }); // find all trainees with a status of inactive and populate the advisor field with their name and email
     return res.status(200).json({ data: trainees }); // return the list of trainees in the response
    } catch (error) {
      return next(error); // return a server error response if there is an error
    }
  };

  const addPaymentCard = async (req, res, next) => {
    try {
      // Validate request body using addPaymentCardSchema
      const { error: validationError, value } = traineeValidator.addPaymentCardSchema.validate(req.body);
  
      if (validationError) {
        // Extract validation error messages and return them as a response
        const error= createError(400,validationError.details[0].message);
        return next(error);
      }
  
      // Extract validated payment card data from the value object
      const { cardNumber, cardHolder, expirationMonth, expirationYear, cvv } = value;
  
      // Create and save the payment card document
      const paymentCard = new PaymentCard({
        cardNumber,
        cardHolder,
        expirationMonth,
        expirationYear,
        cvv,
        trainee:req.user.id
      });
      await paymentCard.save();
      const trainee = Trainee.findById(req.user.id);

      trainee.paymentCard= paymentCard._id;

      // Return a success response
      return res.status(201).json({
        message: 'Payment card added successfully',
        data: paymentCard,
      });
    } catch (error) {
      return next(error);
    }
  };
  
  

  // const getIdentityDocuments = async (req, res, next) => {
  //   try {
  //     const traineeId = req.params.id; // get the trainee ID from the path parameters
  //     const trainee = await Trainee.findOne({ _id: traineeId }); // find the trainee with the given ID in the database
  //     if (!trainee) {
  //       return res.status(404).json({ message: "Trainee not found" }); // return an error response if the trainee does not exist
  //     }
  //     const bucket = storage.bucket(bucketName);
  
  //     // Specify the folder where the identity documents are stored for this trainee
  //     const folderName = `identityDocuments/trainee/${trainee._id}`;
  
  //     // Get all files from the folder and return their download URLs
  //     const [files] = await bucket.getFiles({
  //       prefix: folderName,
  //     });
  
  //     const identityDocuments = files.map((file) => {
  //       const downloadURL = `https://storage.googleapis.com/${bucketName}/${file.name}`;
  //       return {
  //         fileName: file.name.split("/").pop(),
  //         downloadURL,
  //       };
  //     });
  
  //     res.status(200).json({ data:identityDocuments });
  //   } catch (error) {
  //     next(error); // return a server error response if there is an error
  //   }
  // };

  
  

  const joinToTrainingProgram = async (req, res, next) => {
    try {

      const { error: validationError, value } = traineeValidator.joinToTrainingProgramSchema.validate({id:req.params.id});
  
      if (validationError) {
        // Extract validation error messages and return them as a response
        const error= createError(400,validationError.details[0].message);
        return next(error);
      }

      const programId = value.id;
      const traineeId = req.user.id;

      const program = await TrainingProgram.findById(programId);
  
      // Check if trainee and program exist

    if (!program) {
      const error =  createError(400, 'Training program not exist');
      return next(error);
    }

    const existingEnrollment = await EnrolledProgram.findOne({
      trainee: traineeId,
      program: programId,
      status: { $in: ['Enrolled', 'Completed'] }
    });
    
    if (existingEnrollment) {
      const error = createError(400, 'Trainee is already enrolled in this program or has already completed it');
      return next(error);
    }


    //Billing Added
    const { error: billingValidationError } = traineeValidator.createBillingSchema.validate({
      amount: program.cost,
      description: `Billing for program: ${program.name}`,
    });

    if (billingValidationError) {
      const error = createError(400, billingValidationError.details[0].message);
      return next(error);
    }

    // Create new billing record
    const billing = new Billing({
      trainee: traineeId,
      amount: program.cost,
      description: `Billing for program: ${program.name}`,
      status: 'unpaid',
      program:programId,
    });

    await billing.save();

      // Check if the trainee is already enrolled in the program

    // Create a new enrollment instance
    const enrollment = new EnrolledProgram({ 
      trainee:traineeId,
      program:programId,
      enrollmentDate: Date.now(),
      status: "Enrolled"
     });

    // Save the new enrollment to the database
    const savedEnrollment = await (await enrollment.populate('trainee program' , 'name email')).save();


   return  res.status(201).json({
    message: "Enrollment successfully",
    data:savedEnrollment, 
    billing:billing
  });
  } catch (error) {
    return next(error);
  }
  };
  
const getTraineeEnrolledPrograms = async (req, res, next) => {
  try {
    const traineeId = req.user.id;

    // Find all enrolled or completed programs for the trainee
    const enrolledPrograms = await EnrolledProgram.find({ trainee: traineeId })
      .populate('program')
      .where('status')
      .in(['Enrolled', 'Completed']);

    return res.status(200).json({ data: enrolledPrograms });
  } catch (error) {
    next(error);
  }
};



  const removeTraineeFromProgram = async (req, res, next) => {
    try {

      const { error: validationError ,value } = traineeValidator.removeTraineeFromProgramSchema.validate({id:req.params.id});
      if (validationError) {
        const error =  createError(400, validationError.details[0].message);
        return next(error);
      }

      const traineeId = req.user.id;
      const  programId  = value.id;
  
      // const enrollment = await EnrolledProgram.findOne({ trainee: traineeId, program: programId });

      // Find and delete the enrolled program for the trainee and program
       const CancelledEnrollment = await EnrolledProgram.findOneAndUpdate(
        { trainee: traineeId, program: programId },
        { status: 'Cancelled' },
        { new: true }
      );

      if (!CancelledEnrollment) {
        const error =  createError(404, 'Enrollment not found');
        return next(error);
        
      }
  
      return res.json({ message: 'Enrollment cancelled successfully' , data:CancelledEnrollment });
    } catch (error) {
     return next(error);
    }
  };

  const getEnrolledProgramDetails = async (req, res, next) => {
    try {

      const { error: validationError ,value } = traineeValidator.getEnrolledProgramDetailsSchema.validate({id:req.params.id});
      if (validationError) {
        const error =  createError(400, validationError.details[0].message);
        return next(error);
      }


      const traineeId = req.user.id;
      const  programId  = value.id;
  
      // Find the enrolled program for the trainee and program
      const enrolledProgram = await EnrolledProgram.findOne({ trainee: traineeId, program: programId , status:'Enrolled'}).exec();
  
      if (!enrolledProgram) {
        const error =  createError(404, 'Enrollment not found');
        return next(error);
      }
  
      // Populate the program field with the program details
      await enrolledProgram.populate('program');
  
      return res.json({data:enrolledProgram});
    } catch (error) {
     return  next(error);
    }
  };
  
    // Retrieves all training programs that have been completed or are currently in progress
    const getTrainingProgramsByStatus = async (req, res, next) => {
      try {

        const { error: validationError ,value } = traineeValidator.getTrainingProgramsByStatusSchema.validate({status:req.params.status});
        if (validationError) {
          const error =  createError(400, validationError.details[0].message);
          return next(error);
        }

        const { status } = value;
        
        const enrolledPrograms = await EnrolledProgram.find({ trainee: req.user.id, status:status  }).populate('program');
        
        const programIds = enrolledPrograms.map(enrolledProgram => enrolledProgram.program.id);
        
        const programs = await TrainingProgram.find({
          _id: { $in: programIds },
        });
        
       return  res.status(200).json({data:programs});
      } catch (error) {
        return  next(error);
      }
    };
    
    const updateEnrollmentStatus = async (req, res, next) => {
      try {
  
  
        const { error: validationError, value } = traineeValidator.updateEnrollmentSchema.validate(req.body);
    
        if (validationError) {
          const error = createError(400, validationError.details[0].message);
          return next(error);
        }
    
        const { program, status } = value;
        const traineeId = req.user.id;
    
        // Find the enrolled program for the trainee and program
        const enrolledProgram = await EnrolledProgram.findOne({ trainee: traineeId, program: program }).exec();
    
        if (!enrolledProgram) {
          const error = createError(404,'Enrollment not found');
          return next(error);
        }
    
        // Update the enrollment status
        enrolledProgram.status = status;
    
        // Save the updated enrollment to the database
        const updatedEnrollment = await enrolledProgram.save();
    
        return res.status(200).json({data:updatedEnrollment});
      } catch (error) {
        return next(error);   
       }
    };

    const createTraineeAttendance = async (req, res, next) => {
      try {
        const { program, status } = req.body;
        const traineeId = req.user.id;
    
        // Get the current date
        const currentDate = new Date().setHours(0, 0, 0, 0);
    
        // Check if the trainee has already created an attendance record for the current date
        const existingAttendance = await TraineeAttendance.findOne({
          trainee: traineeId,
          trainingProgram: program,
          date: { $gte: currentDate },
        });
    
        if (existingAttendance) {
          const error = createError(400, 'Attendance already created for today');
          return next(error);
        }
    
        // Create new trainee attendance record
        const traineeAttendance = new TraineeAttendance({
          trainee: traineeId,
          trainingProgram: program,
          date: Date.now(),
          status: status,
        });
    
        const savedAttendance = await traineeAttendance.save();
        return res.status(200).json({
          data: savedAttendance,
        });
      } catch (error) {
        return next(error);
      }
    };
    

    const getTraineeAttendanceByTraineeId = async  (req,res,next) => {
      try {
        const attendance = await TraineeAttendance.find({ trainee: req.params.id }).populate('trainingProgram','name status');
        return res.status(200).json({
          data:attendance
        });
      } catch (error) {
        return next(error);
      }
    };

    const myAppointments = async (req, res, next) => {
      try {
        const traineeId = req.user.id; 
        const appointments = await TraineeAppointment.find({ trainee: traineeId }).populate('advisor',' name email').select(['-trainee']);
        return res.status(200).json({ data: appointments });
      } catch (error) {
        return next(error);
      }
    };


const getAllTrainingPrograms = async (req, res, next) => {
  try {
    // Find the programs in which the trainee is enrolled
    const enrolledPrograms = await EnrolledProgram.find({ trainee: req.user.id ,status:'Cancelled'}).distinct('program');

    // Find all programs that the trainee is not enrolled in
    const programsNotEnrolled = await TrainingProgram.find({ _id: { $nin: enrolledPrograms } });

    return res.status(200).json({ data: programsNotEnrolled });
  } catch (error) {
    return next(error);
  }
};







  module.exports={
  registerTrainee,
  login,
  logout,
  myProfile,
  getTraineeById,
  getTraineeAttendance,
  getTraineeNotifications,
  myDocuments,
  uploadDocuments,
  getAdvisorDocuments,
  getTraineeGeneralAdvice,
  requestAppointment,
  cancelAppointment,
  updateTraineeProfile,
  deleteTraineeAccount,
  changeTraineePassword,
  getActiveTrainees,
  getInactiveTrainees,
  // getIdentityDocuments,
  joinToTrainingProgram,
  getTraineeEnrolledPrograms,
  removeTraineeFromProgram,
  getEnrolledProgramDetails,
  getTrainingProgramsByStatus,
  addPaymentCard,
  updateEnrollmentStatus,
  getTraineeBillings,
  getUnpaidBillings,
  getPaidBillings,
  payBilling,
  createTraineeAttendance,
  getTraineeAttendanceByTraineeId,
  myAppointments,
  getAllTrainingPrograms
}
