const nodeMailer = require('nodemailer');
const htmlToText = require('html-to-text');
exports.sendMail = async (options) => {
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

exports.Email = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Shreyan Naskar <${process.env.MAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodeMailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    return nodeMailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      auth: {
        user: process.env.MAILTRAP_USER_NAME,
        password: process.env.MAILTRAP_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });
    // define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the natours family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Password reset token only valid for 10 minutes!',
    );
  }
};
