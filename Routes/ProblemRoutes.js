const express = require("express");
const passport = require("passport");
const { userVerification } = require("../Middleware/UserVerification");
const ProblemController = require("../Controller/Problem");
const ProblemRoutes = express.Router();

ProblemRoutes.use(passport.authenticate("jwt", { session: false }));
ProblemRoutes.use(userVerification);

ProblemRoutes.put("/create", ProblemController.CreateProblem);
ProblemRoutes.get("/:id", ProblemController.ViewProblem);

module.exports = ProblemRoutes;
