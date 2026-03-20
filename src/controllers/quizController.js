const quizService = require("../services/quizService");

exports.createQuiz = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const quiz = await quizService.createQuiz(title, description);
    res.status(201).json({ quizId: quiz._id, title: quiz.title });
  } catch (err) {
    next(err);
  }
};

exports.createQuestion = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const { questionText, options } = req.body;
    const question = await quizService.createQuestion(quizId, questionText, options);
    res.status(201).json(question);
  } catch (err) {
    next(err);
  }
};

exports.startQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const result = await quizService.startQuiz(quizId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getQuestion = async (req, res, next) => {
  try {
    const { quizId, index } = req.params;
    const { attemptId } = req.query;
    const result = await quizService.getQuestion(quizId, index, attemptId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.submitAnswer = async (req, res, next) => {
  try {
    const { attemptId, questionId, selectedOptionIndex } = req.body;
    const result = await quizService.submitAnswer(attemptId, questionId, selectedOptionIndex);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getProgress = async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const result = await quizService.getProgress(attemptId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getResult = async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const result = await quizService.getResult(attemptId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
