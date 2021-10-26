const { addToQ } = require("../Judge/Judger");
const { options } = require("../Routes/UserRoutes");
const SubmissionModel = require("./../Models/Submission");

module.exports.CreateSubmission = async (req, res, next) => {
  const submission = req.body;
  submission.createdBy = req.user._id;
  submission.status = "QUEUED";
  const createdSubmission = await SubmissionModel.create(submission);
  //   add to queue
  // console.log("b4 q", submissionQueue);
  // submissionQueue.add({ submission: createdSubmission }, { attempts: 2 });
  addToQ(createdSubmission);
  res.status(201).json({ message: "Successful", data: createdSubmission });
};

module.exports.ViewSubmission = async (req, res, next) => {
  const subId = req.params.id;
  const submission = await SubmissionModel.findOne({
    _id: subId,
    createdBy: req.user._id,
  });
  res.status(200).json({ message: "Successful", data: submission });
};
