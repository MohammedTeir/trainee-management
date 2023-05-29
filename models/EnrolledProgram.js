const mongoose = require('mongoose');

const enrolledProgramSchema = new mongoose.Schema(
  {
    trainee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trainee',
    },
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TrainingProgram',
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    completionDate: {
      type: Date,
    },
    progress: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Enrolled', 'Completed', 'Cancelled'],
      default: 'Enrolled',
    },
  },
  {
    timestamps: true,
  }
);

enrolledProgramSchema.index({ traineeId: 1, programId: 1 }, { unique: true });

const EnrolledProgram = mongoose.model('EnrolledProgram', enrolledProgramSchema);

module.exports = EnrolledProgram;
