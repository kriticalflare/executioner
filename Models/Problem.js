const mongoose = require("mongoose");
const { testSchema } = require("./Tests");

const problemSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  tests: {
    type: [testSchema],
    required: true,
    default: [],
  },
});

module.exports = mongoose.model("Problem", problemSchema);
