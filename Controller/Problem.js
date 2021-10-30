const ProblemModel = require("./../Models/Problem");

module.exports.CreateProblem = async (req, res, next) => {
  const problem = req.body;
  problem.createdBy = req.user._id;

  const createdProblem = await ProblemModel.create(problem);

  res.status(201).json({ message: "Successful", data: createdProblem });
};

module.exports.ViewProblem = async (req, res, next) => {
  const probId = req.params.id;
  const problem = await ProblemModel.findOne({
    _id: probId,
  }).select("-tests");
  res.status(200).json({ message: "Successful", data: problem });
};

module.exports.ViewAllProblems = async (req, res, next) => {
  const page = req.query.page || 1;
  const limit = 5;
  const skip = (page - 1) * limit;
  const problems = await ProblemModel.find()
    .select("-tests")
    .skip(skip)
    .limit(limit);
  res.status(200).json({ message: "Successful", data: problems });
};
