const nodeMailer = require('nodemailer');
const sendEmail = async (options) => {
  const transporter = nodeMailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    auth: {
      user: process.env.MAILTRAP_USER_NAME,
      password: process.env.MAILTRAP_PASSWORD,
    },
  });

  const mailOptions = {
    from: 'Shreyan Naskar <hello@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  //   await transporter.sendMail(mailOptions);
  console.log(`Email sent from /utils/sendMail func`);
};

module.exports = sendEmail;
