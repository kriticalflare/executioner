const { addToQ } = require("../Judge/Judger");
const SubmissionModel = require("./../Models/Submission");
const mongoose = require("mongoose");
const { catchAsync } = require("../Utils/CatchAsync");

module.exports.CreateSubmission = catchAsync(async (req, res, next) => {
  const submission = req.body;
  submission.createdBy = req.user._id;
  submission.status = "QUEUED";
  const createdSubmission = await SubmissionModel.create(submission);
  addToQ(createdSubmission);
  res.status(201).json({ message: "Successful", data: createdSubmission });
});

module.exports.ViewSubmission = catchAsync(async (req, res, next) => {
  const subId = req.params.id;
  if (!mongoose.isValidObjectId(subId)) {
    return res.status(400).json({ message: "Submission Id is not valid" });
  }
  const submission = await SubmissionModel.findOne({
    _id: subId,
    createdBy: req.user._id,
  });
  if (submission) {
    res.status(200).json({ message: "Successful", data: submission });
  } else {
    res.status(404).json({ message: "Submission doesn't exist" });
  }
});

module.exports.ViewAllSubmissions = catchAsync(async (req, res, next) => {
  const page = req.query.page || 1;
  const limit = 5;
  const skip = (page - 1) * limit;
  const submissions = await SubmissionModel.find({ createdBy: req.user._id })
    .skip(skip)
    .limit(limit);
  if (submissions) {
    res.status(200).json({ message: "Successful", data: submissions });
  }
});
