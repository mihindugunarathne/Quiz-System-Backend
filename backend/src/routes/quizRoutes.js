const express = require("express");
const router = express.Router();

const {
  createQuiz,
  createQuestion,
  startQuiz,
  getQuestion,
  submitAnswer,
  getProgress,
  getResult
} = require("../controllers/quizController");

const {
  validateCreateQuiz,
  validateCreateQuestion,
  validateSubmitAnswer
} = require("../middleware/validate");

router.post("/", validateCreateQuiz, createQuiz);
router.post("/:quizId/questions", validateCreateQuestion, createQuestion);
router.post("/:quizId/start", startQuiz);
router.get("/:quizId/question/:index", getQuestion);
router.post("/answer", validateSubmitAnswer, submitAnswer);
router.get("/progress/:attemptId", getProgress);
router.get("/result/:attemptId", getResult);

module.exports = router;
