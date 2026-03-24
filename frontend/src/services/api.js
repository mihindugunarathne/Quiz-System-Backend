const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const startQuiz = async (quizId) => {
  const res = await fetch(`${BASE_URL}/${quizId}/start`, { method: "POST" });
  return res.json();
};

export const getQuestion = async (quizId, index, attemptId) => {
  const res = await fetch(`${BASE_URL}/${quizId}/question/${index}?attemptId=${attemptId}`);
  return res.json();
};

export const submitAnswer = async (attemptId, questionId, selectedOptionIndex) => {
  const res = await fetch(`${BASE_URL}/answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ attemptId, questionId, selectedOptionIndex })
  });
  return res.json();
};

export const getProgress = async (attemptId) => {
  const res = await fetch(`${BASE_URL}/progress/${attemptId}`);
  return res.json();
};

export const getResult = async (attemptId) => {
  const res = await fetch(`${BASE_URL}/result/${attemptId}`);
  return res.json();
};
