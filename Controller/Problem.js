const ProblemModel = require("./../Models/Problem");

module.exports.CreateProblem = async (req, res, next) => {
  const problem = req.body;
  problem.createdBy = req.user._id;

  const createdProblem = await ProblemModel.create(problem);
  //   add to queue

  res.status(201).json({ message: "Successful", data: createdProblem });
};

module.exports.ViewProblem = async (req, res, next) => {
  const probId = req.params.id;
  const problem = await ProblemModel.findOne({
    _id: probId,
  });
  res.status(200).json({ message: "Successful", data: problem });
};
