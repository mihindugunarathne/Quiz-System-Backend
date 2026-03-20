const Attempt = require("../models/Attempt");
const Quiz = require("../models/Quiz");
const Question = require("../models/Question");
const formatQuestion = require("../utils/formatQuestion");

/**create quiz */
exports.createQuiz = async (req, res) => {
  try {
    const { title, description } = req.body;

    const quiz = await Quiz.create({ title, description });

    res.status(201).json({ quizId: quiz._id, title: quiz.title });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**add question to a quiz */
exports.createQuestion = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { questionText, options } = req.body;

    const question = await Question.create({ quizId, questionText, options });

    res.status(201).json(question);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**start quiz */
exports.startQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    const attempt = await Attempt.create({ quizId });

    const questions = await Question.find({ quizId });
    const firstQuestion = questions[0];

    res.json({
      attemptId: attempt._id,
      totalQuestions: questions.length,
      question: formatQuestion(firstQuestion)
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**get question */
exports.getQuestion = async (req, res) => {
  try {
    const { quizId, index } = req.params;
    const { attemptId } = req.query;

    const questions = await Question.find({ quizId });
    const question = questions[index];

    const attempt = await Attempt.findById(attemptId);

    const existingAnswer = attempt.answers.find(
      a => a.questionId.toString() === question._id.toString()
    );

    res.json({
      question: formatQuestion(question),
      selectedOption: existingAnswer ? existingAnswer.selectedOptionIndex : null
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**submit answer */
exports.submitAnswer = async (req, res) => {
  try {
    const { attemptId, questionId, selectedOptionIndex } = req.body;

    const attempt = await Attempt.findById(attemptId);
    const question = await Question.findById(questionId);

    const isCorrect = question.options[selectedOptionIndex].isCorrect;

    const existing = attempt.answers.find(
      a => a.questionId.toString() === questionId
    );

    if (existing) {
      if (existing.isCorrect) attempt.score--;

      existing.selectedOptionIndex = selectedOptionIndex;
      existing.isCorrect = isCorrect;

    } else {
      attempt.answers.push({
        questionId,
        selectedOptionIndex,
        isCorrect
      });

      attempt.answeredQuestions++;
    }

    if (isCorrect) attempt.score++;

    await attempt.save();

    res.json({
      correct: isCorrect,
      score: attempt.score
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**get progress */
exports.getProgress = async (req, res) => {
  try {
    const { attemptId } = req.params;

    const attempt = await Attempt.findById(attemptId);

    const totalQuestions = await Question.countDocuments({
      quizId: attempt.quizId
    });

    res.json({
      total: totalQuestions,
      answered: attempt.answeredQuestions,
      score: attempt.score
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**get result */
exports.getResult = async (req, res) => {
  try {
    const { attemptId } = req.params;

    const attempt = await Attempt.findById(attemptId);

    const totalQuestions = await Question.countDocuments({
      quizId: attempt.quizId
    });

    const correct = attempt.answers.filter(a => a.isCorrect).length;
    const wrong = attempt.answers.filter(a => !a.isCorrect).length;
    const percentage = Math.round((correct / totalQuestions) * 100);

    attempt.completed = true;
    await attempt.save();

    res.json({
      totalQuestions,
      score: attempt.score,
      correct,
      wrong,
      percentage
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};