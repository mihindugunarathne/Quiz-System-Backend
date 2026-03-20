const Attempt = require("../models/Attempt");
const Quiz = require("../models/Quiz");
const Question = require("../models/Question");
const formatQuestion = require("../utils/formatQuestion");

exports.createQuiz = async (title, description) => {
  return await Quiz.create({ title, description });
};

exports.createQuestion = async (quizId, questionText, options) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    const err = new Error("Quiz not found");
    err.status = 404;
    throw err;
  }
  return await Question.create({ quizId, questionText, options });
};

exports.startQuiz = async (quizId) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    const err = new Error("Quiz not found");
    err.status = 404;
    throw err;
  }

  const questions = await Question.find({ quizId });
  if (!questions.length) {
    const err = new Error("This quiz has no questions");
    err.status = 400;
    throw err;
  }

  const attempt = await Attempt.create({ quizId });

  return {
    attemptId: attempt._id,
    totalQuestions: questions.length,
    question: formatQuestion(questions[0])
  };
};

exports.getQuestion = async (quizId, index, attemptId) => {
  const questions = await Question.find({ quizId });
  if (!questions.length) {
    const err = new Error("No questions found for this quiz");
    err.status = 404;
    throw err;
  }

  const question = questions[index];
  if (!question) {
    const err = new Error(`Question at index ${index} does not exist. Valid range: 0–${questions.length - 1}`);
    err.status = 404;
    throw err;
  }

  const attempt = await Attempt.findById(attemptId);
  if (!attempt) {
    const err = new Error("Attempt not found");
    err.status = 404;
    throw err;
  }

  const existingAnswer = attempt.answers.find(
    a => a.questionId.toString() === question._id.toString()
  );

  return {
    question: formatQuestion(question),
    selectedOption: existingAnswer ? existingAnswer.selectedOptionIndex : null
  };
};

exports.submitAnswer = async (attemptId, questionId, selectedOptionIndex) => {
  const attempt = await Attempt.findById(attemptId);
  if (!attempt) {
    const err = new Error("Attempt not found");
    err.status = 404;
    throw err;
  }

  const question = await Question.findById(questionId);
  if (!question) {
    const err = new Error("Question not found");
    err.status = 404;
    throw err;
  }

  if (selectedOptionIndex >= question.options.length) {
    const err = new Error(`Invalid option index. Valid range: 0–${question.options.length - 1}`);
    err.status = 400;
    throw err;
  }

  const isCorrect = question.options[selectedOptionIndex].isCorrect;

  const existing = attempt.answers.find(
    a => a.questionId.toString() === questionId
  );

  if (existing) {
    if (existing.isCorrect) attempt.score--;
    existing.selectedOptionIndex = selectedOptionIndex;
    existing.isCorrect = isCorrect;
  } else {
    attempt.answers.push({ questionId, selectedOptionIndex, isCorrect });
    attempt.answeredQuestions++;
  }

  if (isCorrect) attempt.score++;
  await attempt.save();

  return { correct: isCorrect, score: attempt.score };
};

exports.getProgress = async (attemptId) => {
  const attempt = await Attempt.findById(attemptId);
  if (!attempt) {
    const err = new Error("Attempt not found");
    err.status = 404;
    throw err;
  }

  const totalQuestions = await Question.countDocuments({ quizId: attempt.quizId });

  return {
    total: totalQuestions,
    answered: attempt.answeredQuestions,
    score: attempt.score
  };
};

exports.getResult = async (attemptId) => {
  const attempt = await Attempt.findById(attemptId);
  if (!attempt) {
    const err = new Error("Attempt not found");
    err.status = 404;
    throw err;
  }

  const totalQuestions = await Question.countDocuments({ quizId: attempt.quizId });

  const correct = attempt.answers.filter(a => a.isCorrect).length;
  const wrong = attempt.answers.filter(a => !a.isCorrect).length;
  const percentage = Math.round((correct / totalQuestions) * 100);

  attempt.completed = true;
  await attempt.save();

  return { totalQuestions, score: attempt.score, correct, wrong, percentage };
};
