const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  title: String,
  description: String
});

module.exports = mongoose.model("Quiz", quizSchema);