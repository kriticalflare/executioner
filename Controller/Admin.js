const UserModel = require("../Models/User");

module.exports.PromoteToAdmin = async (req, res, next) => {
  const userId = req.body.user_id;
  const update = {
    $set: {
      role: "ADMIN",
    },
  };
  const result = await UserModel.findByIdAndUpdate(userId, update);
  if (result) {
    res.status(201).json({ message: "User has been promoted to admin" });
  }
};
