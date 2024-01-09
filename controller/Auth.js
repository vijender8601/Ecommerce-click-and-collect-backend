const { User } = require("../model/User");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { sanitizeUser } = require("../services/Common");
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
