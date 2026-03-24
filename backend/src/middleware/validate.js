exports.validateCreateQuiz = (req, res, next) => {
  const { title } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: "title is required" });
  }

  next();
};

exports.validateCreateQuestion = (req, res, next) => {
  const { questionText, options } = req.body;

  if (!questionText || !questionText.trim()) {
    return res.status(400).json({ error: "questionText is required" });
  }

  if (!Array.isArray(options) || options.length < 2) {
    return res.status(400).json({ error: "options must be an array with at least 2 items" });
  }

  const hasInvalidOption = options.some(o => !o.text || !o.text.trim());
  if (hasInvalidOption) {
    return res.status(400).json({ error: "each option must have a text field" });
  }

  const correctCount = options.filter(o => o.isCorrect === true).length;
  if (correctCount !== 1) {
    return res.status(400).json({ error: "exactly one option must have isCorrect: true" });
  }

  next();
};

exports.validateSubmitAnswer = (req, res, next) => {
  const { attemptId, questionId, selectedOptionIndex } = req.body;

  if (!attemptId) {
    return res.status(400).json({ error: "attemptId is required" });
  }

  if (!questionId) {
    return res.status(400).json({ error: "questionId is required" });
  }

  if (selectedOptionIndex === undefined || selectedOptionIndex === null) {
    return res.status(400).json({ error: "selectedOptionIndex is required" });
  }

  if (typeof selectedOptionIndex !== "number" || selectedOptionIndex < 0) {
    return res.status(400).json({ error: "selectedOptionIndex must be a non-negative number" });
  }

  next();
};
