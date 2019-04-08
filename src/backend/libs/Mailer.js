const path = require('path');
const dvalue = require('dvalue');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

const Bot = require(path.resolve(__dirname, 'Bot.js'));
const Utils = require(path.resolve(__dirname, 'Utils.js'));

class Mailer extends Bot {

  constructor() {
    super();
    this.name = 'Mailer';
  }

  init({ config, database, logger, i18n }) {
    return super.init({ config, database, logger, i18n });
  }

  start() {
    return super.start()
    .then(() => {});
  }

  ready() {

  }



  /* host, secure, port, user, password */
  send({ email, subject, content }) {
    const mailerConfig = {
      host: this.config.mailer.host,
      secure: this.config.mailer.secure,
      port: this.config.mailer.port,
      auth: {
        user: this.config.mailer.user,
        pass: this.config.mailer.password
      }
    };
    const mailTransport = nodemailer.createTransport(smtpTransport(mailerConfig));
    const mailOptions = {
        from: mailerConfig.auth.user,
        subject: subject,
        html: content
    };

    if(Array.isArray(email)) {
        mailOptions.bcc = email;
    }
    else {
        mailOptions.to = email;
    }

    return new Promise((resolve, reject) => {
      mailTransport.sendMail(mailOptions, (e) => {
        if(e) {
          reject(e);
        } else {
          resolve(true);
        }
      });
    });
  }
}

module.exports = Mailer;