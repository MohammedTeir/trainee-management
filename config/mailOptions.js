module.exports = {
    traineeApprove: (email, authId,advisorName) => ({
      from: 'ittraining-center@gmail.com',
      to: email,
      subject: 'Approval of Unique Trainee ID',
      text: `Congratulations! Your unique trainee ID has been approved. Your trainee ID is ${authId}. You have been assigned to advisor ${advisorName}.`,
    }),

    advisorAssigned: (email, authId) => ({
        from: 'ittraining-center@gmail.com',
        to: email,
        subject: 'Approval of Trainee ID',
        text: `Congratulations! The trainee with ID ${authId} has been approved and assigned to you.`,
      }),

      advisorApprove: (email, authId) => ({
        from: 'ittraining-center@gmail.com',
        to: email,
        subject: 'Approval of Unique Advisor ID',
        text: `Congratulations! Your unique advisor ID has been approved. Your advisor ID is ${authId}.`,
      }),
  };


  