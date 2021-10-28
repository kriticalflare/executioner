const User = require("./../Models/User");
const bcrypt = require("bcrypt");
const { sendMail } = require("../Services/Mail");
const { createToken, verifyToken } = require("../Services/Token");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { catchAsync } = require("../Utils/CatchAsync");

module.exports.Register = catchAsync(async (req, res, next) => {
  let user = req.body;
  if (user.email) user.email = user.email.toLowerCase();
  user.password = await bcrypt.hash(
    req.body.password,
    parseInt(process.env.Salt)
  );
  const result = await User.create(user);
  const token = await createToken({ email: user.email });
  const subject = "Verify your email";
  const tokenUrl = `${process.env.DOMAIN}/user/verify?token=${token}`;
  const htmlText =
    'Click on this <a href="' + tokenUrl + '">link</a> to verify your email';

  const mailResult = await sendMail(subject, htmlText, user.email);

  res.status(201).json({
    message: "You Have Registered Sucessfully",
  });
});

module.exports.Login = catchAsync(async (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, msg) => {
    if (err) next(err);
    else if (!user) {
      res.status(401).json({
        message: msg,
      });
    } else {
      const token = jwt.sign({ id: user._id.toJSON() }, process.env.jwtKey, {
        expiresIn: 604800,
      });
      res.status(200).json({
        message: msg,
        user: user,
        token: token,
      });
    }
  })(req, res, next);
});

module.exports.Verify = catchAsync(async (req, res, next) => {
  const token = req.query.token;
  const decoded = await verifyToken(token);
  const result = await User.findOneAndUpdate(
    { email: decoded.email },
    {
      $set: {
        isVerified: true,
      },
    }
  );
  res.status(201).json({ message: "Account verified successfully" });
});
