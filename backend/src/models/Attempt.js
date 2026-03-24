const mongoose = require("mongoose");

const attemptSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },

  score: { type: Number, default: 0 },
  answeredQuestions: { type: Number, default: 0 },

  answers: [
    {
      questionId: mongoose.Schema.Types.ObjectId,
      selectedOptionIndex: Number,
      isCorrect: Boolean
    }
  ],

  currentQuestionIndex: { type: Number, default: 0 },
  completed: { type: Boolean, default: false }
});

module.exports = mongoose.model("Attempt", attemptSchema);