const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

const managerRoutes = require('./routes/managerRoutes');
const advisorRoutes = require('./routes/advisorRoutes');
const traineeRoutes = require('./routes/traineeRoutes');
const trainingProgramRoutes = require('./routes/trainingProgramRoutes');
const disciplineRoutes = require('./routes/disciplineRoutes');



const app = express();


// Middlewares
app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.set('view engine', 'ejs');



// Routes

app.use('/api/advisor', advisorRoutes);
app.use('/api/trainee', traineeRoutes);
app.use('/api/program', trainingProgramRoutes);
app.use('/api', disciplineRoutes);
app.use('/api', managerRoutes);

app.get('/', (req, res) => {
    
     res.status(200).json({message:'Hello, Boy!'});
    
  });


module.exports = app;
