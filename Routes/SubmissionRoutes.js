const express = require("express");
const passport = require("passport");
const { userVerification } = require("../Middleware/UserVerification");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const SubmissionController = require("../Controller/Submission");
const SubmissionRoutes = express.Router();

SubmissionRoutes.use(passport.authenticate("jwt", { session: false }));
SubmissionRoutes.use(userVerification);

SubmissionRoutes.put("/create", SubmissionController.CreateSubmission);
SubmissionRoutes.put(
  "/upload",
  upload.fields([{ name: "source", maxCount: 1 }]),
  SubmissionController.FileSubmission
);
SubmissionRoutes.get(
  "/allSubmissions",
  SubmissionController.ViewAllSubmissions
);
SubmissionRoutes.get("/:id", SubmissionController.ViewSubmission);

module.exports = SubmissionRoutes;
