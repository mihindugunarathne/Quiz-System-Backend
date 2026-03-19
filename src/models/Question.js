const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
  questionText: String,
  options: [
    {
      text: String,
      isCorrect: Boolean
    }
  ]
});

module.exports = mongoose.model("Question", questionSchema);