const nodemailer = require("nodemailer");

exports.sendMail = function mail(subject, text, recipient) {
  let transporter = nodemailer.createTransport({
    service: process.env.MAIL_PROVIDER,
    auth: {
      type: "OAuth2",
      user: process.env.MAIL_ADDRESS_FROM,
      pass: process.env.MAIL_PASS,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
    },
  });

  let mailOptions;
  mailOptions = {
    from: process.env.MAIL_ADDRESS_FROM,
    to: recipient,
    subject: subject,
    html: text,
  };
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};
