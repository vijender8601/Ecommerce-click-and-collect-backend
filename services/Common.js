const passport = require('passport');
const nodemailer = require('nodemailer');

// email
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "vijendersrivastava8601@gmail.com",
      pass: process.env.MAIL_PASSWORD,
    },
});

exports.isAuth = (req, res, done) => {
    return passport.authenticate('jwt');
};


exports.sanitizeUser = (user) => {
    return {id: user.id, role: user.role};
}

exports.cookieExtractor = function(req) {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies['jwt'];
    }
   
    // token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1OWQ1ZjVhMmM1MTgyZTA4MWFjNTg3ZSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzA0ODEyNTc2fQ.t0_qfhehxNtFIVYrR0JrLTgK-2rYzowfzg3FUdVeuTw";
    return token;
  };

  exports.sendMail = async function({to, subject, text, html}){
    
    const info = await transporter.sendMail({
      from: '"Click & Collect" <ecommerce@ecommerce.com>', // sender address
      to: to,
      subject,
      text,
      html
    });
  
    return info;
}
  