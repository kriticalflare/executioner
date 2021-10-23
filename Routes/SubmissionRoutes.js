const express = require("express");
const passport = require("passport");
const { userVerification } = require("../Middleware/UserVerification");
const SubmissionController = require("../Controller/Submission");
const SubmissionRoutes = express.Router();

SubmissionRoutes.use(passport.authenticate("jwt", { session: false }));
SubmissionRoutes.use(userVerification);

SubmissionRoutes.put("/create", SubmissionController.CreateSubmission);
SubmissionRoutes.get("/:id", SubmissionController.ViewSubmission);

module.exports = SubmissionRoutes;
