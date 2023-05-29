const mongoose = require('mongoose');
const { Schema } = mongoose;

const TraineeAttendanceSchema = new Schema({
  trainee: { type: Schema.Types.ObjectId, ref: 'Trainee',  },
  trainingProgram: { type: Schema.Types.ObjectId, ref: 'TrainingProgram',  },
  date: { type: Date,  },
  status: { type: String, enum: ['Present', 'Absent'],  }
});

module.exports = mongoose.model('TraineeAttendance', TraineeAttendanceSchema);
