const mongoose = require("mongoose");
const submissionSchema = mongoose.Schema({
  problem: {
    type: mongoose.Types.ObjectId,
    ref: "Problem",
    required: true,
  },
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
    enum: ["QUEUED", "ACCEPTED", "WA", "NZEC"],
    default: "QUEUED",
  },
  output: {
    type: String,
    default: null,
  },
});

module.exports = mongoose.model("Submission", submissionSchema);
