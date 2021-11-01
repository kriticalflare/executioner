const UserModel = require("../Models/User");
const { catchAsync } = require("../Utils/CatchAsync");

module.exports.PromoteToAdmin = catchAsync(async (req, res, next) => {
  const userId = req.body.user_id;
  const update = {
    $set: {
      role: "ADMIN",
    },
  };
  const result = await UserModel.findByIdAndUpdate(userId, update);
  if (result) {
    res.status(201).json({ message: "User has been promoted to admin" });
  } else {
    res.status(400).json({ message: "Unsuccessful" });
  }
});

module.exports.DemoteToUser = catchAsync(async (req, res, next) => {
  const userId = req.body.user_id;
  const update = {
    $set: {
      role: "USER",
    },
  };
  const result = await UserModel.findByIdAndUpdate(userId, update);
  if (result) {
    res.status(201).json({ message: "User has been demoted from admin" });
  } else {
    res.status(400).json({ message: "Unsuccessful" });
  }
});
