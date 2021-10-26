const mongoose = require("mongoose");
const testSchema = mongoose.Schema({
  input: {
    type: String,
    required: true,
  },
  output: {
    type: String,
    required: true,
  },
});

module.exports.testSchema = testSchema;

module.exports.Tests = mongoose.model("Test", testSchema);
