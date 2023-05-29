const Manager = require('../models/Manager');
const Trainee = require('../models/Trainee');
const Advisor = require('../models/Advisor');
const createError = require('http-errors');
const {managerValidator} = require('../validators')
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const dotenv = require('dotenv');
const revoked = require('../utils/revokeToken');
dotenv.config() // load environment variables from .env file
const transporter = require('../config/transporter');
const mailOptions = require('../config/mailOptions');

const secret = process.env.JWT_MANAGER_SECRET;
const saltRounds = process.env.SALT_ROUNDS;
const salt = bcryptjs.genSaltSync(parseInt(saltRounds));

// Function to create a new manager
const createManager = async (req, res, next) => {
    try {
      const { name , email, password } = req.body;
  

      const validation = managerValidator.createManagerSchema.validate({ name, email, password });
      if (validation.error) {
      const error = createError(400, validation.error.details[0].message.replace(/"/g, ''));
      return next(error);
      }

      // Check if user with same email already exists
      const existingManager = await Manager.findOne({ email: email });
      if (existingManager) {

        const error = createError(400,'Manager already exists');
        return next(error);

         
      }

      // Hash password and create new user
      const hashedPassword = await bcryptjs.hash(password, salt);
      const manager = new Manager({
        name,
        email,
        password: hashedPassword,
      });
      await manager.save();
  
      return res.status(201).json({
        status: 'success',
        message: 'Manager created successfully',
        data:manager
      });
    } catch (error) {
      return next(error);
    }
  };


  const updateManager = async (req, res, next) => {
    try {
      const { name, email, password } = req.body;
  
      const validation = managerValidator.updateManagerSchema.validate({ name, email, password });
      if (validation.error) {
        const error = createError(400, validation.error.details[0].message.replace(/"/g, ''));
        return next(error);
      }

      // Check if user with same email already exists
      const existingManager = await Manager.findOne({ email, _id: { $ne: req.user.id } });
      if (existingManager) {
        const error = createError(400, 'Email already exists');
        return next(error);
      }
  
    // Update a manager account
    const manager = await Manager.findById(req.user.id);
    manager.email = email || manager.email;
    manager.name = name || manager.name;
      if (password) {
        const hashedPassword = await bcryptjs.hash(password, salt);
        manager.password = hashedPassword;
      }
  
      await manager.save();
  
      res.status(200).json({
        _id: manager._id,
        status: 'success',
        message: 'Manager account updated successfully',
        data:manager

      });
    } catch (error) {
      next(error);
    }
  };


// Delete a manager account
const deleteManager = async (req, res, next) => {
    try {
      const managerID = req.user.id;
  
      let responseSent = false;
  
      // Delete the user
      const deletedManager = await Manager.findOneAndDelete({ _id: managerID });
  
      if (!deletedManager) {
        const error = createError(404,'Manager not found');
        return next(error);
      }
  
      if (!responseSent) {
        revoked(req.token);
        return res.status(200).json({ message: 'Manager deleted successfully', status: 'success' , _id: managerID});
      }
    } catch (error) {
      return next(error);
    }
  };

// Get all managers
const getAllManagers = async (req, res) => {
  try {
    const managers = await Manager.find();
    return res.status(200).json({status:'success',data:managers});
  } catch (error) {
    
    return next(error);
  }
};

// Get a specific manager
const getManagerById = async (req, res) => {
  try {
    const  id  = req.params.id;
    const manager = await Manager.findById(id);
    return res.status(200).json({status:'success',data:manager});
  } catch (error) {
    return next(error);
  }
};

// Function to login an existing manager
const login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
  
       // Validate the request body
      const validation = managerValidator.loginSchema.validate({ email, password });
      if (validation.error) {
        const error = createError(400, validation.error.details[0].message.replace(/"/g, ''));
        return next(error);
      }

      // Check if manager with provided email exists
      const manager = await Manager.findOne({ email });
      if (!manager) {
        const error = createError(401, 'Invalid email or password');
        return next(error);
      }
  
      // Check if provided password matches user's hashed password
      const isValidPassword = await bcryptjs.compare(password, manager.password);
      if (!isValidPassword) {
        const error = createError(401, 'Invalid email or password');
        return next(error);
      }
  
      // Create JWT token
      const accessToken = jwt.sign({ id: manager._id }, secret, { expiresIn: '24h' });
      res.status(200).json({
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
  
  
  // Function to get currently logged in manager
  const profile = async (req, res, next) => {

    const id  = req.user.id;

    try {
      const manager = await Manager.findById(id).select(['-password','-_id']);
      if (!manager) {

        const error = createError(404, 'Manager not found');
        return next(error);
      }
      return res.status(200).json({
        status: 'success',
        message: 'Manager data retrieved successfully',
        data: manager
      });
    } catch (error) {
      return next(error);
    }
  };

  const getLastTraineeApprovedAuthId = async () => {
    const lastApprovedTrainee = await Trainee.findOne(
      { status: 'active', authId: { $regex: /^TR-\d{8}$/ } }, // Find advisors with an authId in the format "AD-20230000"
      {},
      { sort: { authId: -1 } } // Sort in descending order to get the latest approved authId
    );
  
    if (lastApprovedTrainee) {
      const lastAuthId = lastApprovedTrainee.authId;
      const lastNumber = parseInt(lastAuthId.slice(-4)); // Extract the number part from the last authId
      return lastNumber;
    } else {
      // If no previous advisor is found, return a starting number
      return 0;
    }
  };

  const approvalUniqueTraineeID = async (req, res, next) => {
    try {


      const { error: validationError , value}  = managerValidator.traineeIdSchema.validate(req.body);
      if (validationError) {
        const error = createError(400, validation.error.details[0].message);
        return next(error);
      }

      const traineeID = value.trainee;
      const existingTrainee = await Trainee.findById(  traineeID ); // find the trainee with the given ID in the database
      if (!existingTrainee) {
        const error = createError(404, "Trainee not found");
        return next(error); // return an error response if the trainee does not exist
    }

        // If the trainee is already active and has an authId, return the existing authId
        if (existingTrainee.status === 'active' && existingTrainee.authId) {
          return res.status(200).json({
            loginTraineeId: existingTrainee.authId,
            message: `Trainee ${existingTrainee.name} is already approved with login ID: ${existingTrainee.authId}.`,
          });
        }

        const year = new Date().getFullYear().toString(); // Get the last two digits of the current year
        const lastNumber = await getLastTraineeApprovedAuthId();
        const nextNumber = lastNumber + 1;
        const authId = `TR-${year}${nextNumber.toString().padStart(4, '0')}`; // Generate the unique Trainee ID
    
        const discipline = existingTrainee.discipline; // get the trainee's discipline
        existingTrainee.authId = authId; // set the unique trainee ID on the trainee object
        existingTrainee.status = 'active'; // set the status to active
      
      // get all active advisors with the same discipline as the trainee
      const advisors = await Advisor.find({ discipline: discipline, status: 'active' });

      // sort advisors by the number of trainees they currently have (ascending order)
      advisors.sort((a, b) => a.trainees.length - b.trainees.length);

      // assign the trainee to the advisor with the fewest number of trainees
      const advisor = advisors[0];

      existingTrainee.advisor = advisor._id; // assign the advisor to the trainee
      advisor.trainees.push(existingTrainee._id); // add the trainee to the advisor's list of trainees
      await Promise.all([existingTrainee.save(), advisor.save()]); // save both the trainee and the advisor

       // Send the email
      //   transporter.sendEmail(mailOptions.traineeApprove(existingTrainee.email,authId,advisor.name), (error, info) => {
      //   if (error) {
      //     console.error('Error sending email:', error);
      //   } else {
      //     console.log('Email sent:', info.response);
      //   }
      // });

      // transporter.sendEmail(mailOptions.advisorAssigned(existingAdvisor.email,authId), (error, info) => {
      //   if (error) {
      //     console.error('Error sending email:', error);
      //   } else {
      //     console.log('Email sent:', info.response);
      //   }
      // });
      

         return res.status(200).json({ loginTraineeId: authId , message:`Trainee ${existingTrainee.name} has been registered with trainee ID ${authId} and assigned to advisor ${advisor.name}.` }); // return the unique trainee ID and assigned advisor in the response
    } catch (error) {
     return next(error); // return a server error response if there is an error
    }
  };
  
  
  const getLastAdvisorApprovedAuthId = async () => {
    const lastApprovedAdvisor = await Advisor.findOne(
      { status: 'active', authId: { $regex: /^AD-\d{8}$/ } }, // Find advisors with an authId in the format "AD-20230000"
      {},
      { sort: { authId: -1 } } // Sort in descending order to get the latest approved authId
    );
  
    if (lastApprovedAdvisor) {
      const lastAuthId = lastApprovedAdvisor.authId;
      const lastNumber = parseInt(lastAuthId.slice(-4)); // Extract the number part from the last authId
      return lastNumber;
    } else {
      // If no previous advisor is found, return a starting number
      return 0;
    }
  };


  const approvalUniqueAdvisorID = async (req, res, next) => {
    try {


      const { error: validationError , value} = managerValidator.advisorIdSchema.validate( req.body );
      if (validationError) {
        const error = createError(400, validation.error.details[0].message);
        return next(error);
      }

      const advisorID = value.advisor;
      const existingAdvisor = await Advisor.findById(  advisorID ); // find the advisor with the given ID in the database
      
      if (!existingAdvisor) {

        
        const error = createError(404, "Advisor not found"); 
        // return an error response if the advisor does not exist

        return next(error); // 
      }

       // If the advisor is already active and has an authId, return the existing authId
    if (existingAdvisor.status === 'active' && existingAdvisor.authId) {
      return res.status(200).json({
        loginAdvisorId: existingAdvisor.authId,
        message: `Advisor ${existingAdvisor.name} is already approved with login ID: ${existingAdvisor.authId}.`,
      });
    }
        

    const year = new Date().getFullYear().toString(); // Get the last two digits of the current year
    const lastNumber = await getLastAdvisorApprovedAuthId();
    const nextNumber = lastNumber + 1;
    const authId = `AD-${year}${nextNumber.toString().padStart(4, '0')}`; // Generate the unique advisor ID

        existingAdvisor.authId=authId;
        existingAdvisor.status = 'active'; // set the status of the advisor to "active"
        await existingAdvisor.save(); // save the advisor object with the updated unique advisor ID and status

        // transporter.sendEmail(mailOptions.advisorApprove(existingAdvisor.email,authId), (error, info) => {
        //   if (error) {
        //     console.error('Error sending email:', error);
        //   } else {
        //     console.log('Email sent:', info.response);
        //   }
        // });

        return res.status(200).json({ loginAdvisorId: authId, message: `Advisor ${existingAdvisor.name} has been Approved with login ID ${authId}.` }); // return the unique advisor ID in the response
    } catch (error) {
      return next(error); // return a server error response if there is an error
    }
  };


  
  
module.exports = {
  createManager,
  updateManager,
  deleteManager,
  getAllManagers,
  getManagerById,
  login,
  profile,
  logout,
  approvalUniqueTraineeID,
  approvalUniqueAdvisorID,

};
