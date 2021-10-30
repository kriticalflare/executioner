const express = require("express");
const passport = require("passport");
const { userVerification } = require("../Middleware/UserVerification");
const { adminVerification } = require("../Middleware/AdminVerification");
const ProblemController = require("../Controller/Problem");
const ProblemRoutes = express.Router();

ProblemRoutes.use(passport.authenticate("jwt", { session: false }));
ProblemRoutes.use(userVerification);

ProblemRoutes.get("/dashboard", ProblemController.ViewAllProblems);
ProblemRoutes.get("/id/:id", ProblemController.ViewProblem);

ProblemRoutes.use(adminVerification);
ProblemRoutes.put("/create", ProblemController.CreateProblem);

module.exports = ProblemRoutes;
