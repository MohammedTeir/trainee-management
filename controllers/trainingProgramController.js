const EnrolledProgram = require('../models/EnrolledProgram');
const TrainingProgram = require('../models/TrainingProgram');
const Trainee = require('../models/Trainee');
const Discipline = require('../models/Discipline');
const TraineeAttendance = require('../models/TraineeAttendance')
const {storage,getDownloadURL,ref , getMetadata , deleteObject,uploadBytesResumable} = require('../config/firebase');
const createError = require('http-errors');
const {trainingProgramValidator} = require('../validators')
const dotenv = require('dotenv');
dotenv.config() // load environment variables from .env file

// const { Storage } = require('@google-cloud/storage');

// Create a new instance of Google Cloud Storage and specify the name of the GCS bucket
// const gcstorage = new Storage({
//   projectId: process.env.GCLOUD_PROJECT_ID,
//   keyFilename: path.join(__dirname, "../", process.env.GCLOUD_APPLICATION_CREDENTIALS),
// });

// const bucketName = process.env.GCLOUD_STORAGE_BUCKET_URL;

// const bucketName = process.env.FIREBASE_STORAGE_BUCKET_URL;

// create a new training program and add it to the database



const createTrainingProgram = async (req, res, next) => {

    try {


      const { error: validationError , value} = trainingProgramValidator.createTrainingProgramSchema.validate( {
        name:req.body.name, description:req.body.description, startDate:req.body.startDate, 
        endDate:req.body.endDate, cost:req.body.cost,
        discipline:req.body.discipline , materials:req.files.materials ,
        image:req.files.image[0]
      
      });
      if (validationError) {
        const error =  createError(400, validationError.details[0].message);
        return next(error);
      }
  

      const {name,description,startDate,endDate,cost,discipline,materials,image} = value
      // Create a new TrainingProgram instance and set its properties

       // Check if a training program with the same name already exists
    const existingProgram = await TrainingProgram.findOne({ name:name });
      if (existingProgram) {
      const error = createError(400, 'A training program with the same name already exists');
      return next(error);
    }

    const isDiscipline = await Discipline.findById(discipline);
    if (!isDiscipline) {

      const error = createError(404, 'Discipline not found');
      return next(error);
    }

      const program = new TrainingProgram({
        name,
        description,
        startDate,
        endDate,
        cost,
        manager:req.user.id,
        // req.user.id,
        discipline:discipline

      });

        // Get discipline folder
        const disciplineFolder = `disciplines/${isDiscipline.name}`;

        // Create a sub-folder with the name of the training program
        // Upload any associated documents to Google Cloud Storage and add their metadata to the program's materials array

        const fileName = image.originalname;
        const destination = `${disciplineFolder}/training-programs/${program.name}/${fileName}`;
        // const fileBuffer = file.buffer;

        const trainingProgramReference = ref(storage, `${destination}`);
        const snapshot = await uploadBytesResumable(trainingProgramReference,image.buffer,{
          contentType: image.mimetype,
        });

        const downloadURL = await getDownloadURL(snapshot.ref);
        program.image=downloadURL;



        
      const programMaterials = [];
      for (const file of materials) {
        const fileName = file.originalname;
        const destination = `${disciplineFolder}/training-programs/${program.name}/materials/${fileName}`;
        // const fileBuffer = file.buffer;

        const trainingProgramReference = ref(storage, `${destination}`);
        const snapshot = await uploadBytesResumable(trainingProgramReference,file.buffer,{
          contentType: file.mimetype,
        });

        const downloadURL = await getDownloadURL(snapshot.ref);
        programMaterials.push({ url: downloadURL, name: fileName });
      }


      
      program.materials = programMaterials;
  
      //add image of the program

      // Save the new training program to the database
      const savedProgram = await program.save();
  
      return res.status(201).json({
        message: 'Training program created successfully.',
        data: savedProgram
      });
    } catch (error) {
      return next(error);
    }
  };

const updateTrainingProgramImage = async (req, res, next) => {
    try {
      const { error: validationError , value } = trainingProgramValidator.updateTrainingProgramImageSchema.validate({id:req.params.id  , image:req.file} );
      if (validationError) {
        const error =  createError(400, validationError.details[0].message);
        return next(error);
      }

      const { id ,image } = value;
      
  
      // Find the training program by ID
      const program = await TrainingProgram.findById(id);
      if (!program) {
        const error = createError(404, 'Training program not found');
        return next(error);
      }
  
      const isDiscipline = await Discipline.findById(program.discipline);
    if (!isDiscipline) {

      const error = createError(404, 'Discipline not found');
      return next(error);
    }

    
      // Get the discipline folder
      const disciplineFolder = `disciplines/${isDiscipline.name}`;
  
      // Upload the new image to Firebase Storage
      const fileName = image.originalname;
      const destination = `${disciplineFolder}/training-programs/${program.name}/${fileName}`;
      const trainingProgramReference = ref(storage, destination);
      const snapshot = await uploadBytesResumable(trainingProgramReference, image.buffer, {
        contentType: image.mimetype,
      });
  
      // Get the download URL of the updated image
      const downloadURL = await getDownloadURL(snapshot.ref);
  
      // Update the program's image URL
      program.image = downloadURL;
  
      // Save the updated program
      const updatedProgram = await program.save();
  
      return res.status(200).json({
        message: 'Training program image updated successfully.',
        data: updatedProgram,
      });
    } catch (error) {
      return next(error);
    }
  };

  
// retrieve a training program from the database by its ID
const getTrainingProgramById = async (req, res, next) => {

  const { error: validationError, value } = trainingProgramValidator.getTrainingProgramSchema.validate({ id: req.params.id });
    if (validationError) {
      const error = createError(400, validationError.details[0].message);
      return next(error);
    }

    const { id } = value;

  try {
    const program = await TrainingProgram.findById(id)
    .populate('materials', 'name url');
    if (!program) {
      const error = createError(404, 'Training program not found');
      return next(error);
    }

    const enrolledPrograms = await EnrolledProgram.find({ program: id })
      .populate('trainee', 'name email');

    program.enrolledPrograms = enrolledPrograms;

    return res.status(200).json({data:program});
  } catch (error) {
    return next(error);
  }
};
// update the details of an existing training program
const updateTrainingProgram = async (req, res, next) => {
  try {

    const { error: validationError, value } = trainingProgramValidator.updateTrainingProgramSchema.validate(req.body);
    if (validationError) {
      const error = createError(400, validationError.details[0].message);
      return next(error);
    }

    const { name, description, startDate, endDate, cost ,discipline } = value;

    const program = await TrainingProgram.findById(req.params.id);
    if (!program) {
      const error = createError(404,'Training program not found');
      return next(error);
    }

    const existingProgram = await TrainingProgram.findOne({ name, _id: { $ne: req.params.id } });
    if (existingProgram) {
      const error = createError(400, 'A training program with the same name already exists');
      return next(error);
    }

    program.name = name ||program.name;
    program.description = description||program.description;
    program.startDate = startDate ||program.startDate;
    program.endDate = endDate ||program.endDate;
    program.cost = cost ||program.cost;
    program.discipline = discipline ||program.discipline;

    const updatedProgram = await program.save();
    return res.status(200).json({data:updatedProgram});
  } catch (error) {
    return next(error);
    }
};



const addMaterialsToProgram = async (req, res, next) => {
    try {

      
      const { error: validationError, value } = trainingProgramValidator.addMaterialsToProgramSchema.validate({
        program: req.body.program,
        materials: req.files,
      });
  
      if (validationError) {
        const error = createError(400, validationError.details[0].message);
        return next(error);
      }
  
      const { program, materials } = value;

           
      const isProgram = await TrainingProgram.findById(program);
  
      if (!isProgram) {

        const error = createError(404,'Training program not found');
        return next(error);

      }

      // Get discipline name
    const discipline = await Discipline.findById(isProgram.discipline);
    if (!discipline) {
      const error = createError(404, 'Discipline not found');
      return next(error);
    }
  
       // Get discipline folder
       const disciplineFolder = `disciplines/${discipline.name}`;

       // Create a sub-folder with the name of the training program
       // Upload any associated documents to Google Cloud Storage and add their metadata to the program's materials array

       for(const file of materials){
      const fileName = file.originalname;
      const destination = `${disciplineFolder}/training-programs/${isProgram.name}/materials/${fileName}`;
       // const fileBuffer = file.buffer;

       const materialReference = ref(storage, `${destination}`);
       const snapshot = await uploadBytesResumable(materialReference,file.buffer,{
         contentType: file.mimetype,
       });

       const downloadURL = await getDownloadURL(snapshot.ref);
       const material = { url: downloadURL, name: fileName };
     

       isProgram.materials.push(material);
       }
  
      const savedProgram = await isProgram.save();
  
      return res.status(200).json({data:savedProgram.materials});
    } catch (error) {
      return next(error);   
     }
  };
  
  const removeMaterialFromProgram = async (req, res, next) => {
    try {


      const { error: validationError, value } = trainingProgramValidator.removeMaterialFromProgramSchema.validate({
        id: req.params.id,
        material: req.params.material,
      });
  
      if (validationError) {
        const error =  createError(400, validationError.details[0].message);
        return next(error);
      }
  
      const { id, material } = value;
  
      // Find the program and material
      const program = await TrainingProgram.findById(id);
      if (!program) {
        
        const error = createError(404,'Training program not found');
        return next(error);
      }
      const deletedMaterial = program.materials.find((m) => m._id.equals(material));

      if (!deletedMaterial) {
        const error = createError(404,'Material not found');
        return next(error);
      }
      
      // Delete the file from Firebase Storage
      const { url } = deletedMaterial;

      try {
        const fileRef = ref(storage, url);
        await getMetadata(fileRef);
        await deleteObject(fileRef);

      } catch (error) {
        // If the object doesn't exist, continue without deleting the file
        console.log('File does not exist in Firebase Storage:', url);
      }


      // Remove the material from the program's materials array

      program.materials = program.materials.filter((m) => !m._id.equals(material));

      // Save the program and return the updated materials array
      await program.save();

      return res.status(200).json({data:material});
    } catch (error) {
      return next(error);
    }
  };

  
// remove a training program from the database
    const deleteTrainingProgram = async (req, res, next) => {
    try {

      const { error: validationError, value } = trainingProgramValidator.deleteTrainingProgramSchema.validate({ id: req.params.id });
      if (validationError) {
        const error =  createError(400, validationError.details[0].message);
        return next(error);
      }

        const { id } = value;

        const program = await TrainingProgram.findById(id);

        if (!program) {
          const error = createError(404,'Training program not found');
          return next(error);
          }
  

          
        try {
          for (const material of program.materials) {
            const fileRef = ref(storage, material.url);
            await getMetadata(fileRef);
            await deleteObject(fileRef);
          }
        } catch (error) {
          // If the object doesn't exist, continue without deleting the file
          console.log('File does not exist in Firebase Storage:', error);
        }

        await program.deleteOne();

        return res.status(200).json({ message: `${program.name} Training program deleted successfully` });
    } catch (error) {
      return next(error);
    }
    };


    const getProgramEnrolledTrainees = async (req, res, next) => {
        try {

          const { error: validationError, value } = trainingProgramValidator.getProgramEnrolledTraineesSchema.validate({ id: req.params.id });
          if (validationError) {
            const error =  createError(400, validationError.details[0].message);
            return next(error);
          }

          const { id } = value;

    
        // Find all trainees enrolled in the program
        const enrolledTrainees = await EnrolledProgram.find({ program: id })
            .populate('trainee')
            .exec();
    
       return res.status(200).json({data:enrolledTrainees});
        } catch (error) {
          return next(error);
        }
    };

    // Retrieves all trainees enrolled in a particular training program
    const getTraineesInProgram = async (req, res, next) => {
        try {

          const { error: validationError, value } = trainingProgramValidator.getTraineesInProgramSchema.validate({ id: req.params.id });
          if (validationError) {
            const error =  createError(400, validationError.details[0].message);
            return next(error);
          }

          const { id } = value;


        // Find all enrolled programs for the given programId
        const enrolledPrograms = await EnrolledProgram.find({ program: id });
    
        // Extract the trainee IDs from the enrolled programs
        const traineeIds = enrolledPrograms.map(ep => ep.trainee);
    
        // Find all trainees with matching IDs
        const trainees = await Trainee.find({ _id: { $in: traineeIds } });
    
        return res.status(200).json({data:trainees});
        } catch (error) {
          return next(error);
        }
    };
    


    // Retrieves all materials associated with a particular training program
    const getMaterialsByTrainingProgram = async (req, res, next) => {
    try {

      const { error: validationError, value } = trainingProgramValidator.getMaterialsByTrainingProgramSchema.validate({ id: req.params.id });
      if (validationError) {
        const error =  createError(400, validationError.details[0].message);
        return next(error);
      }

        const { id } = value;
        
        const program = await TrainingProgram.findById(id).populate('materials', 'name url');
        if (!program) {
        const error = createError(404,'Training program not found');
        return next(error);
        }
        return res.status(200).json({data:program.materials});
    } catch (error) {
      return next(error);

    }
    };

    // Retrieves all training programs enrolled in by a particular trainee
    const getTrainingProgramsByTrainee = async (req, res, next) => {
    try {

      const { error: validationError, value } = trainingProgramValidator.getTrainingProgramsByTraineeSchema.validate({ trainee: req.params.id });
      if (validationError) {
        const error = createError(400, validationError.details[0].message);
        return next(error);
      }

      const traineeId = value.trainee;

      const trainee = await Trainee.findById(traineeId);
    
      if (!trainee) {
        const error = createError(404, 'Trainee not found');
        return next(error);
      }

        const programs = await EnrolledProgram.find({ trainee: traineeId }).populate('program');
        return res.status(200).json({data:programs.map(p => p.program)});
    } catch (error) {
      return next(error);
    }
    };
    // Retrieves all training programs that fall within a given date range
    const getTrainingProgramsByDateRange = async (req, res, next) => {
        try {

          const { error: validationError, value } = trainingProgramValidator.getTrainingProgramsByDateRangeSchema.validate({
            startDate: req.query.startDate,
            endDate: req.query.endDate,
          });
      
          if (validationError) {
            const error = createError(400, validationError.details[0].message);
            return next(error);
          }
      
          const { startDate, endDate } = value;

        const programs = await TrainingProgram.find({
            startDate: { $gte: startDate },
            endDate: { $lte: endDate }
        }).populate('materials');
        return res.status(200).json({data:programs});
        } catch (error) {
          return next(error);

        }
    };
    
  // Retrieves all training programs that fall within a given cost range
  const getTrainingProgramsByCostRange = async (req, res, next) => {
    try {

      const { error: validationError, value } = trainingProgramValidator.getTrainingProgramsByCostRangeSchema.validate({
        minCost: req.query.minCost,
        maxCost: req.query.maxCost,
      });
  
      if (validationError) {
        const error = createError(400, validationError.details[0].message);
        return next(error);
      }
  
      const { minCost, maxCost } = value;

      const programs = await TrainingProgram.find({
        cost: { $gte: minCost, $lte: maxCost }
      }).populate('materials');
      return res.status(200).json({data:programs});
    } catch (error) {
      return next(error);

    }
  };
  
  // Retrieves all training programs that match a given keyword or phrase
  const getTrainingProgramsByKeyword = async (req, res, next) => {
    try {

      const { error: validationError, value } = trainingProgramValidator.getTrainingProgramsByKeywordSchema.validate({ keyword: req.query.k });
      if (validationError) {
        const error = createError(400, validationError.details[0].message);
        return next(error);
      }
  
      const { keyword } = value;

      const programs = await TrainingProgram.find({
        $or: [
          { name: { $regex: keyword, $options: 'i' } },
          { description: { $regex: keyword, $options: 'i' } }
        ]
      }).populate('materials');
      return res.status(200).json({data:programs});
    } catch (error) {
      return next(error);

    }
  };
  


const getTrainingProgramsByDiscipline = async (req, res,next) => {
  try {
    
    const { error: validationError, value } = trainingProgramValidator.getTrainingProgramsByDisciplineSchema.validate({ id: req.params.id });
    if (validationError) {
      const error = createError(400, validationError.details[0].message);
      return next(error);
    }

    const { id } = value;
    
    const discipline = await Discipline.findById(id);
    
    if (!discipline) {
      const error = createError(404,'Discipline not found');
      return next(error);
    
    }

    const trainingPrograms = await TrainingProgram.find({ discipline: discipline._id });
    
   return res.status(200).json({data:trainingPrograms , materials:trainingPrograms.materials});
  } catch (error) {
    return next(error);
  }
};

const getAllTrainingPrograms = async (req, res, next) => {
  try {
    const trainingPrograms = await TrainingProgram.find();
    return res.status(200).json({ data: trainingPrograms });
  } catch (error) {
    return next(error);
  }
};

const changeTrainingProgramStatus = async (req, res, next) => {
  try {


    const { error: validationError, value } = trainingProgramValidator.updateTrainingProgramStatusSchema.validate({
      id: req.params.id,
      status: req.body.status,
    });

    if (validationError) {
      const error = createError(400, validationError.details[0].message);
      return next(error);
    }

    const { id, status } = value;

    // Validate programId and status if needed

    // Find the training program by its ID
    const trainingProgram = await TrainingProgram.findById(id);
    
    if (!trainingProgram) {
      const error = createError(404, 'Training program not found');
      return next(error);
    }

    // Update the status
    trainingProgram.status = status;
    await trainingProgram.save();

    return res.status(200).json({ message: 'Training program status updated successfully' , data:trainingProgram });
  } catch (error) {
    return next(error);
  }
};

const getTraineeAttendanceByProgramId = async (req,res,next) => {
  try {
    const attendance = await TraineeAttendance.find({ trainingProgram: req.params.id }).populate('trainee trainingProgram');
    return res.status(200).json({
      data:attendance
    });
  } catch (error) {
    return next(error);
  }
};

  module.exports={
    createTrainingProgram,
    getTrainingProgramById,
    updateTrainingProgram,
    addMaterialsToProgram,
    removeMaterialFromProgram,
    deleteTrainingProgram,
    getProgramEnrolledTrainees,
    getTraineesInProgram,
    getMaterialsByTrainingProgram,
    getTrainingProgramsByTrainee,
    getTrainingProgramsByDateRange,
    getTrainingProgramsByCostRange,
    getTrainingProgramsByKeyword,
    getTrainingProgramsByDiscipline,
    getAllTrainingPrograms,
    changeTrainingProgramStatus,
    updateTrainingProgramImage,
    getTraineeAttendanceByProgramId
  };