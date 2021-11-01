const mongoose = require("mongoose");
const { catchAsync } = require("../Utils/CatchAsync");
const ProblemModel = require("./../Models/Problem");

module.exports.CreateProblem = catchAsync(async (req, res, next) => {
  const problem = req.body;
  problem.createdBy = req.user._id;

  const createdProblem = await ProblemModel.create(problem);

  res.status(201).json({ message: "Successful", data: createdProblem });
});

module.exports.ViewProblem = catchAsync(async (req, res, next) => {
  const probId = req.params.id;
  if (!mongoose.isValidObjectId(probId)) {
    return res.status(400).json({ message: "Problem Id is not valid" });
  }
  const problem = await ProblemModel.findOne({
    _id: probId,
  }).select("-tests");
  res.status(200).json({ message: "Successful", data: problem });
});

module.exports.ViewAllProblems = catchAsync(async (req, res, next) => {
  const page = req.query.page || 1;
  const limit = 5;
  const skip = (page - 1) * limit;
  const problems = await ProblemModel.find()
    .select("-tests")
    .skip(skip)
    .limit(limit);
  res.status(200).json({ message: "Successful", data: problems });
});
