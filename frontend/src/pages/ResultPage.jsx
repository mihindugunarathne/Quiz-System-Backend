import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getResult } from "../services/api";

const QUIZ_ID = import.meta.env.VITE_QUIZ_ID;
const LABELS  = ["A", "B", "C", "D"];

const getGrade = (pct) => {
  if (pct === 100) return { label: "Perfect Score!",  emoji: "🏆", color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" };
  if (pct >= 80)  return { label: "Excellent!",       emoji: "🌟", color: "text-sky-600", bg: "bg-sky-50 border-sky-200" };
  if (pct >= 60)  return { label: "Great Job!",       emoji: "🎉", color: "text-green-600",  bg: "bg-green-50 border-green-200"   };
  if (pct >= 40)  return { label: "Good Effort!",     emoji: "💪", color: "text-amber-600",  bg: "bg-amber-50 border-amber-200"   };
  return               { label: "Keep Trying!",     emoji: "📚", color: "text-red-600",    bg: "bg-red-50 border-red-200"       };
};

const ResultPage = () => {
  const location        = useLocation();
  const navigate        = useNavigate();
  const attemptId       = location.state?.attemptId;
  const questionResults = location.state?.questionResults ?? [];

  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!attemptId) { navigate("/"); return; }
    getResult(attemptId).then((d) => { setResult(d); setLoading(false); });
  }, [attemptId]);

  if (loading)
    return (
      <div className="min-h-screen bg-[#F0F9FF] flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 border-4 border-sky-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-sky-400 text-sm font-semibold">Calculating results…</p>
      </div>
    );

  const grade = getGrade(result.percentage);

  return (
    <div className="min-h-screen bg-[#F0F9FF] flex flex-col">

      {/* ── Header ── */}
      <header className="bg-[#0C4A6E] px-8 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-sky-400/30 rounded-xl flex items-center justify-center">
            <span className="text-white font-extrabold text-base">Q</span>
          </div>
          <div>
            <p className="text-white font-extrabold text-base leading-none">QuizJoy</p>
            <p className="text-sky-300 text-xs mt-0.5">General Knowledge for Kids</p>
          </div>
        </div>
        <span className="bg-green-400/20 text-green-300 text-xs font-bold px-3 py-1.5 rounded-full border border-green-400/30">
          ✓ Quiz Completed
        </span>
      </header>

      {/* ── Main ── */}
      <div className="flex-1 flex gap-6 p-6 max-w-6xl mx-auto w-full">

        {/* ── Left: Results + review ── */}
        <div className="flex-1 flex flex-col gap-5">

          {/* Grade banner */}
          <div className={`${grade.bg} border-2 rounded-2xl p-5 flex items-center gap-4`}>
            <span className="text-5xl">{grade.emoji}</span>
            <div>
              <h1 className={`text-2xl font-extrabold ${grade.color}`}>{grade.label}</h1>
              <p className="text-gray-500 text-sm mt-0.5">
                You scored <strong>{result.score}</strong> out of <strong>{result.totalQuestions}</strong> — <strong>{result.percentage}%</strong> correct
              </p>
            </div>
          </div>

          {/* Answer Review */}
          <div className="bg-white rounded-2xl shadow-sm border border-sky-100 overflow-hidden">
            <div className="bg-sky-600 px-5 py-3 flex items-center justify-between">
              <p className="text-white font-extrabold text-sm">Answer Review</p>
              <span className="text-sky-200 text-xs">{result.correct} correct · {result.wrong} wrong</span>
            </div>

            <div className="divide-y divide-slate-100">
              {questionResults.map((q) => (
                <div key={q.index} className="p-5">

                  {/* Question row */}
                  <div className="flex items-start gap-3 mb-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0
                      ${q.correct ? "bg-green-100 text-green-600"
                      : q.selectedOptionIndex === null ? "bg-amber-100 text-amber-600"
                      : "bg-red-100 text-red-500"}`}>
                      {q.correct ? "✓" : q.selectedOptionIndex === null ? "−" : "✗"}
                    </span>
                    <p className="text-gray-700 font-semibold text-sm leading-snug flex-1">{q.questionText}</p>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-2 gap-2 ml-10">
                    {q.options.map((opt, i) => {
                      const isSelected = q.selectedOptionIndex === i;
                      const isCorrect  = q.correctOptionIndex === i;

                      let wrapClass  = "bg-slate-50 border-slate-100 opacity-40";
                      let labelClass = "bg-slate-200 text-slate-400";
                      let textClass  = "text-gray-400";

                      if (isCorrect) {
                        wrapClass  = "bg-green-50 border-green-200";
                        labelClass = "bg-green-500 text-white";
                        textClass  = "text-green-700";
                      }
                      if (isSelected && !q.correct) {
                        wrapClass  = "bg-red-50 border-red-200";
                        labelClass = "bg-red-400 text-white";
                        textClass  = "text-red-600";
                      }

                      return (
                        <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold ${wrapClass}`}>
                          <span className={`w-5 h-5 rounded-md text-xs font-extrabold flex items-center justify-center flex-shrink-0 ${labelClass}`}>
                            {LABELS[i]}
                          </span>
                          <span className={`flex-1 leading-snug ${textClass}`}>{opt.text}</span>
                          {isSelected && isCorrect  && <span className="flex-shrink-0 text-green-500">✅</span>}
                          {isSelected && !q.correct && <span className="flex-shrink-0 text-red-400">❌</span>}
                        </div>
                      );
                    })}
                  </div>

                  {q.selectedOptionIndex === null && (
                    <p className="text-amber-500 text-xs font-semibold ml-10 mt-2">⚠️ This question was not answered</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Summary panel ── */}
        <div className="w-64 flex-shrink-0 flex flex-col gap-4">

          {/* Score card */}
          <div className="bg-white rounded-2xl shadow-sm border border-sky-100 overflow-hidden">
            <div className="bg-sky-600 px-4 py-3">
              <p className="text-white font-extrabold text-sm">Your Score</p>
            </div>
            <div className="p-5 flex flex-col items-center gap-4">
              {/* Ring */}
              <div className="relative w-28 h-28">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#F0F9FF" strokeWidth="12" />
                  <circle
                    cx="50" cy="50" r="40" fill="none"
                    stroke="#0284C7" strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - result.percentage / 100)}`}
                    style={{ transition: "stroke-dashoffset 1s ease" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-sky-700 font-extrabold text-2xl">{result.percentage}%</span>
                </div>
              </div>

              <div className="w-full flex flex-col gap-2">
                <div className="flex items-center justify-between bg-sky-50 rounded-xl px-3 py-2">
                  <span className="text-gray-500 text-xs font-semibold">Score</span>
                  <span className="text-sky-700 font-extrabold text-sm">{result.score}/{result.totalQuestions}</span>
                </div>
                <div className="flex items-center justify-between bg-green-50 rounded-xl px-3 py-2">
                  <span className="text-gray-500 text-xs font-semibold">✅ Correct</span>
                  <span className="text-green-600 font-extrabold text-sm">{result.correct}</span>
                </div>
                <div className="flex items-center justify-between bg-red-50 rounded-xl px-3 py-2">
                  <span className="text-gray-500 text-xs font-semibold">❌ Wrong</span>
                  <span className="text-red-500 font-extrabold text-sm">{result.wrong}</span>
                </div>
                <div className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2">
                  <span className="text-gray-500 text-xs font-semibold">− Skipped</span>
                  <span className="text-slate-400 font-extrabold text-sm">{result.totalQuestions - result.correct - result.wrong}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <button
            onClick={() => navigate(`/quiz/${QUIZ_ID}`)}
            className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-sky-200 transition-all active:scale-95"
          >
            🔄 Play Again
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 bg-white hover:bg-slate-50 text-sky-600 font-extrabold text-sm rounded-xl border-2 border-sky-200 transition-all"
          >
            🏠 Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
