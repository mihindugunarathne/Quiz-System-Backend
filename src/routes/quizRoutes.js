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

router.post("/", createQuiz);
router.post("/:quizId/questions", createQuestion);
router.post("/:quizId/start", startQuiz);
router.get("/:quizId/question/:index", getQuestion);
router.post("/answer", submitAnswer);
router.get("/progress/:attemptId", getProgress);
router.get("/result/:attemptId", getResult);

module.exports = router;