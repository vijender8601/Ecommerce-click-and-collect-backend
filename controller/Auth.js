const { User } = require("../model/User");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { sanitizeUser, sendMail } = require("../services/Common");
const SECRET_KEY = "SECRET_KEY";

exports.createUser = async (req, res) => {
  var salt = crypto.randomBytes(16);
  try {
    crypto.pbkdf2(
      req.body.password,
      salt,
      310000,
      32,
      "sha256",
      async function (err, hashedPassword) {
        const user = new User({ ...req.body, password: hashedPassword, salt });
        const response = await user.save();
        req.login(sanitizeUser(response), (err) => {
          if (err) {
            res.status(400).json(err);
          } else {
            const token = jwt.sign(sanitizeUser(response), SECRET_KEY);
            res
              .cookie("jwt", token, {
                expires: new Date(Date.now() + 8 * 3600000),
                httpOnly: true,
              })
              .status(201)
              .json({id: response.id, role: response.role});
          }
        });
      }
    );
  } catch (err) {
    res.status(400).json(err);
  }
};

exports.loginUser = async (req, res) => {
  res.cookie("jwt", req.user.token, {
      expires: new Date(Date.now() + 8 * 3600000),
      httpOnly: true,
    })
    .status(201)
    .json({id: req.user.id, role: req.user.role});
};

exports.checkAuth = async (req, res) => {
  // console.log("here", req.user);
  if(req.user)
  {
    res.json(req.user);
  } else {
    res.sendStatus(401);
  }
};

exports.resetPasswordRequest = async (req, res) => {
  const email = req.body.email;
  const user = await User.findOne({email: email});
//https://ecommerce-click-and-co-git-274371-vijender-srivastavas-projects.vercel.app/
  if(user)
  {
      const token = crypto.randomBytes(48).toString('hex');
      user.resetPasswordToken = token;
      await user.save();
      const resetPage = "https://ecommerce-click-and-co-git-274371-vijender-srivastavas-projects.vercel.app/reset-password?token="+token+"&email="+email;
      const html = `<p>Click <a href=${resetPage}>here</a> to Reset password</p>`;
      const subject = "reset password for Click & Collect";

      // we have to send email and token in the email id to cerify that user has click to right link
      if(email)
      {
        const response = await sendMail({to: email, subject, html});
        res.json(response);
      } else {
        res.sendStatus(400);
      }
  } else {
    res.sendStatus(401);
  }

  
};

exports.resetPassword = async (req, res) => {
  const {email, token, password} = req.body;
  const user = await User.findOne({email: email, resetPasswordToken: token});

  if(user)
  {
    try{
      var salt = crypto.randomBytes(16);
    
      crypto.pbkdf2(
        password,
        salt,
        310000,
        32,
        "sha256",
        async function (err, hashedPassword) {
          user.password = hashedPassword;
          user.salt = salt;
          await user.save();

          const html = `<p>Password reset successfully</p>`;
          const subject = "Successfully reset password of Click & Collect";
          const response = await sendMail({to: email, subject, html});
          res.json(response);

        });
    } catch(err)
    {
      res.status(400).json(err);
    }
  } else {
    res.sendStatus(401).json("user not found");
  }

  
};

exports.logout = async (req, res) => {
  res.cookie("jwt", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  })
  .sendStatus(200)
}