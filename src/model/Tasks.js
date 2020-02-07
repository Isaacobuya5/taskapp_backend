const mongoose = require("mongoose");

const Tasks = mongoose.Schema({
  task: { type: String, required: true },
  description: { type: String, required: true },
  completed: { type: String, required: true }
});

module.exports = mongoose.model("Tasks", Tasks);
