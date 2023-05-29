const sendgrid = require('@sendgrid/mail');
sendgrid.setApiKey(process.env.SENDGRID_API_KEY || '<your-sendgrid-api-key>');


const sendEmail = (data) => async (req,res,next) => {
  await sendgrid.send(data);
  next();
}

module.exports= {
  sendEmail
};