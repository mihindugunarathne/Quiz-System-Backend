import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { startQuiz, getQuestion, submitAnswer } from "../services/api";

const LABELS = ["A", "B", "C", "D"];

const formatTime = (secs) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const QuizPage = () => {
  const { quizId } = useParams();
  const navigate   = useNavigate();

  const [loading, setLoading]         = useState(true);
  const [submitting, setSubmitting]   = useState(false);
  const [attemptId, setAttemptId]     = useState(null);
  const [totalQuestions, setTotal]    = useState(0);
  const [currentIndex, setIndex]      = useState(0);
  const [question, setQuestion]       = useState(null);
  const [questionsCache, setCache]    = useState({});
  const [selectedMap, setSelectedMap] = useState({});
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft]       = useState(null);

  /* ── Always-current ref to avoid stale closures in auto-submit ── */
  const stateRef = useRef({});
  stateRef.current = { questionsCache, selectedMap, totalQuestions, quizId, attemptId, submitting };

  /* ── Start quiz ── */
  useEffect(() => {
    const init = async () => {
      const data = await startQuiz(quizId);
      setAttemptId(data.attemptId);
      setTotal(data.totalQuestions);
      setQuestion(data.question);
      setCache({ 0: data.question });
      setTimeLeft(data.totalQuestions * 60); // 1 min per question
      setLoading(false);
    };
    init();
  }, [quizId]);

  /* ── Countdown tick ── */
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const tick = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(tick);
  }, [timeLeft]);

  /* ── Auto-submit when time runs out ── */
  useEffect(() => {
    if (timeLeft === 0) {
      const { submitting: busy } = stateRef.current;
      if (!busy) executeSubmit();
    }
  }, [timeLeft]);

  /* ── Core submit logic (reads from ref, safe to call anytime) ── */
  const executeSubmit = async () => {
    const { questionsCache: qc, selectedMap: sm,
            totalQuestions: tq, quizId: qid, attemptId: aid } = stateRef.current;

    setSubmitting(true);
    const allQ = { ...qc };
    for (let i = 0; i < tq; i++) {
      if (!allQ[i]) {
        const d = await getQuestion(qid, i, aid);
        allQ[i] = d.question;
      }
    }

    const results = [];
    for (let i = 0; i < tq; i++) {
      const q = allQ[i];
      const s = sm[q._id];
      if (s !== undefined) {
        const res = await submitAnswer(aid, q._id, s);
        results.push({ index: i + 1, questionText: q.questionText, options: q.options,
          selectedOptionIndex: s, correct: res.correct, correctOptionIndex: res.correctOptionIndex });
      } else {
        results.push({ index: i + 1, questionText: q.questionText, options: q.options,
          selectedOptionIndex: null, correct: false, correctOptionIndex: null });
      }
    }
    navigate("/result", { state: { attemptId: aid, questionResults: results } });
  };

  /* ── Navigate between questions ── */
  const goTo = async (index) => {
    setLoading(true);
    if (questionsCache[index]) {
      setQuestion(questionsCache[index]);
    } else {
      const data = await getQuestion(quizId, index, attemptId);
      setQuestion(data.question);
      setCache((prev) => ({ ...prev, [index]: data.question }));
    }
    setIndex(index);
    setLoading(false);
  };

  /* ── Select answer ── */
  const handleSelect = (i) => {
    if (submitting) return;
    setSelectedMap((prev) => ({ ...prev, [question._id]: i }));
    setShowWarning(false);
  };

  /* ── Manual finish (shows warning if not all answered) ── */
  const handleFinish = () => {
    const answered = Object.keys(selectedMap).length;
    if (answered < totalQuestions && !showWarning) { setShowWarning(true); return; }
    executeSubmit();
  };

  /* ── Timer display helpers ── */
  const totalTime    = totalQuestions * 60;
  const timePct      = timeLeft !== null ? (timeLeft / totalTime) * 100 : 100;
  const timerColor   = timeLeft <= 30  ? "text-red-400 animate-pulse"
                     : timeLeft <= 60  ? "text-amber-300"
                     : "text-white";
  const ringColor    = timeLeft <= 30  ? "#F87171"
                     : timeLeft <= 60  ? "#FCD34D"
                     : "#38BDF8";
  const circumference = 2 * Math.PI * 20;

  /* ── Loading screen ── */
  if (loading || !question)
    return (
      <div className="min-h-screen bg-[#F0F9FF] flex items-center justify-center flex-col gap-3">
        <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin" />
        <p className="text-sky-400 text-sm font-semibold">
          {submitting ? "Submitting your answers…" : "Loading question…"}
        </p>
      </div>
    );

  const answeredCount = Object.keys(selectedMap).length;
  const selected      = selectedMap[question._id] ?? null;
  const isLast        = currentIndex === totalQuestions - 1;

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

        <div className="flex items-center gap-3">
          {/* Answered counter */}
          <div className="bg-sky-800/60 rounded-xl px-4 py-2 text-center">
            <p className="text-sky-300 text-xs">Answered</p>
            <p className="text-white font-extrabold text-lg leading-none">{answeredCount}/{totalQuestions}</p>
          </div>

          {/* Question counter */}
          <div className="bg-sky-800/60 rounded-xl px-4 py-2 text-center">
            <p className="text-sky-300 text-xs">Question</p>
            <p className="text-white font-extrabold text-lg leading-none">{currentIndex + 1}/{totalQuestions}</p>
          </div>

          {/* ── Countdown timer ── */}
          {timeLeft !== null && (
            <div className={`bg-sky-800/60 rounded-xl px-4 py-2 flex items-center gap-3`}>
              {/* Ring */}
              <div className="relative w-10 h-10 flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="4" />
                  <circle
                    cx="24" cy="24" r="20" fill="none"
                    stroke={ringColor} strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - timePct / 100)}
                    style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs">⏱</span>
                </div>
              </div>
              {/* Time text */}
              <div className="text-center">
                <p className="text-sky-300 text-xs">Time left</p>
                <p className={`font-extrabold text-lg leading-none tabular-nums ${timerColor}`}>
                  {formatTime(timeLeft)}
                </p>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ── Progress bar (question progress) ── */}
      <div className="h-1.5 bg-sky-200">
        <div
          className="h-full bg-sky-600 transition-all duration-500"
          style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* ── Time warning banner ── */}
      {timeLeft !== null && timeLeft <= 60 && timeLeft > 0 && (
        <div className={`px-8 py-2 text-center text-sm font-bold
          ${timeLeft <= 30
            ? "bg-red-500 text-white animate-pulse"
            : "bg-amber-400 text-amber-900"}`}>
          {timeLeft <= 30
            ? `⚠️ Less than 30 seconds remaining! Quiz will auto-submit.`
            : `⏳ Less than 1 minute remaining!`}
        </div>
      )}

      {/* ── Main content ── */}
      <div className="flex-1 flex gap-5 p-6 max-w-6xl mx-auto w-full">

        {/* ── Left: Question area ── */}
        <div className="flex-1 flex flex-col gap-4">

          {/* Question card */}
          <div className="bg-white rounded-2xl shadow-sm border border-sky-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-sky-600 text-white text-xs font-extrabold px-3 py-1 rounded-full">
                Question {currentIndex + 1}
              </span>
              <span className="text-gray-400 text-xs">of {totalQuestions}</span>
            </div>
            <p className="text-gray-800 text-lg font-semibold leading-relaxed">
              {question.questionText}
            </p>
          </div>

          {/* Options */}
          <div className="bg-white rounded-2xl shadow-sm border border-sky-100 p-5 flex flex-col gap-3">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-1">
              Select one answer
            </p>
            {question.options.map((opt, i) => {
              const isSelected = selected === i;
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border-2 text-left transition-all duration-150 group
                    ${isSelected
                      ? "bg-sky-50 border-sky-500 shadow-sm"
                      : "bg-slate-50 border-slate-200 hover:border-sky-300 hover:bg-sky-50/50"
                    }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                    ${isSelected ? "border-sky-600 bg-sky-600" : "border-slate-300 group-hover:border-sky-400"}`}>
                    {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <span className={`w-8 h-8 rounded-lg text-sm font-extrabold flex items-center justify-center flex-shrink-0 transition-all
                    ${isSelected ? "bg-sky-600 text-white" : "bg-white border border-slate-200 text-gray-500"}`}>
                    {LABELS[i]}
                  </span>
                  <span className={`flex-1 font-medium text-sm leading-snug transition-colors
                    ${isSelected ? "text-sky-900" : "text-gray-600"}`}>
                    {opt.text}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Warning */}
          {showWarning && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4">
              <p className="text-amber-700 font-bold text-sm">
                ⚠️ {totalQuestions - answeredCount} question{totalQuestions - answeredCount > 1 ? "s" : ""} still unanswered.
              </p>
              <p className="text-amber-600 text-xs mt-1">
                Click <strong>Finish Attempt</strong> again to submit anyway, or answer them first.
              </p>
            </div>
          )}

          {/* ── Prev / Next navigation ── */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => goTo(currentIndex - 1)}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-slate-200 text-gray-500 font-bold text-sm hover:border-sky-300 hover:text-sky-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              ← Previous
            </button>

            <span className="text-sm">
              {selected !== null
                ? <span className="text-green-600 font-semibold">✓ Answer selected</span>
                : <span className="text-amber-500">Select an answer</span>}
            </span>

            {!isLast ? (
              <button
                onClick={() => goTo(currentIndex + 1)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md shadow-sky-200 transition-all active:scale-95"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md shadow-sky-200 disabled:opacity-50 transition-all active:scale-95"
              >
                {submitting ? "Submitting…" : "Finish Attempt →"}
              </button>
            )}
          </div>
        </div>

        {/* ── Right: Navigation panel ── */}
        <div className="w-56 flex-shrink-0 flex flex-col gap-4">

          {/* Quiz navigation */}
          <div className="bg-white rounded-2xl shadow-sm border border-sky-100 overflow-hidden">
            <div className="bg-sky-600 px-4 py-3">
              <p className="text-white font-extrabold text-sm">Quiz navigation</p>
            </div>
            <div className="p-4 flex flex-wrap gap-2">
              {Array.from({ length: totalQuestions }, (_, i) => {
                const q       = questionsCache[i];
                const done    = q ? selectedMap[q._id] !== undefined : false;
                const current = i === currentIndex;
                return (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    title={`Question ${i + 1}${done ? " (answered)" : ""}`}
                    className={`w-9 h-9 rounded-lg text-sm font-extrabold transition-all border-2
                      ${current  ? "bg-sky-600 text-white border-sky-600 shadow-md"
                      : done     ? "bg-sky-100 text-sky-700 border-sky-300"
                      :            "bg-slate-100 text-slate-400 border-slate-200 hover:border-sky-400 hover:text-sky-600"
                      }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <div className="px-4 pb-4 flex flex-col gap-2">
              <div className="h-px bg-slate-100 mb-1" />
              {[
                { color: "bg-sky-600",                            label: "Current"      },
                { color: "bg-sky-100 border border-sky-300",     label: "Answered"     },
                { color: "bg-slate-100 border border-slate-200", label: "Not answered" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded flex-shrink-0 ${l.color}`} />
                  <span className="text-gray-500 text-xs">{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Finish button */}
          <button
            onClick={handleFinish}
            disabled={submitting}
            className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-sky-200 disabled:opacity-50 transition-all active:scale-95"
          >
            {submitting ? "Submitting…" : "Finish Attempt →"}
          </button>

          {/* Progress mini bar */}
          <div className="bg-white rounded-2xl shadow-sm border border-sky-100 p-4 text-center">
            <p className="text-gray-400 text-xs mb-2">Progress</p>
            <div className="flex items-center gap-1 mb-2">
              {Array.from({ length: totalQuestions }, (_, i) => {
                const q    = questionsCache[i];
                const done = q ? selectedMap[q._id] !== undefined : false;
                return <div key={i} className={`flex-1 h-2 rounded-full transition-all ${done ? "bg-sky-500" : "bg-slate-200"}`} />;
              })}
            </div>
            <p className="text-sky-700 font-extrabold text-sm">
              {answeredCount} of {totalQuestions} answered
            </p>
          </div>
        </div>
      </div>

      {/* ── Floating timer (bottom-right) ── */}
      {timeLeft !== null && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl shadow-xl border transition-all duration-500
          ${timeLeft <= 30
            ? "bg-red-500 border-red-400 animate-pulse"
            : timeLeft <= 60
            ? "bg-amber-400 border-amber-300"
            : "bg-[#0C4A6E] border-sky-700"}`}>
          {/* Mini ring */}
          <div className="relative w-8 h-8 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="12" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
              <circle
                cx="16" cy="16" r="12" fill="none"
                stroke="white" strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 12}
                strokeDashoffset={2 * Math.PI * 12 * (1 - timePct / 100)}
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-xs">⏱</span>
            </div>
          </div>
          {/* Time text */}
          <div>
            <p className="text-white/70 text-xs leading-none mb-0.5">Time left</p>
            <p className="text-white font-extrabold text-base tabular-nums leading-none">
              {formatTime(timeLeft)}
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default QuizPage;
