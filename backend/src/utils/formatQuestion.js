const formatQuestion = (question) => {
  return {
    _id: question._id,
    questionText: question.questionText,
    options: question.options.map(opt => ({
      text: opt.text
    }))
  };
};

module.exports = formatQuestion;