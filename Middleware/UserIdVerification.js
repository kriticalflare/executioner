const mongoose = require("mongoose");

module.exports.userIdVerification = (req, res, next) => {
  const userId = req.body.user_id;
  if (mongoose.isValidObjectId(userId)) {
    next();
  } else {
    return res.status(400).json({ message: "User Id is not valid" });
  }
};
