const UserRoutes = require("./UserRoutes");
const SubmissionRoutes = require("./SubmissionRoutes");
const ProblemRoutes = require("./ProblemRoutes");
const AdminRoutes = require("./AdminRoutes");
const { ErrorHandler, NotFoundHandler } = require("../Utils/ErrorUtils");

const Routesinit = (app) => {
  app.use("/user", UserRoutes);
  app.use("/submission", SubmissionRoutes);
  app.use("/problem", ProblemRoutes);
  app.use("/admin", AdminRoutes);

  app.use(NotFoundHandler);
  app.use(ErrorHandler);
};
module.exports = Routesinit;
