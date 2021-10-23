const mongoose = require("mongoose");
const submissionSchema = mongoose.Schema({
  source: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["QUEUED", "SUCCESSFUL", "FAILED"],
    default: "QUEUED",
  },
  output: {
    type: String,
    default: null,
  },
});

module.exports = mongoose.model("Submission", submissionSchema);