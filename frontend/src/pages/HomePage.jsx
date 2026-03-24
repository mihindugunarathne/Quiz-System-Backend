import { useNavigate } from "react-router-dom";

const QUIZ_ID = import.meta.env.VITE_QUIZ_ID;

const HomePage = () => {
  const navigate = useNavigate();

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
            <p className="text-sky-300 text-xs mt-0.5">Interactive Learning Platform</p>
          </div>
        </div>
        <span className="bg-sky-400/20 text-sky-200 text-xs font-semibold px-3 py-1.5 rounded-full border border-sky-400/30">
          For Kids
        </span>
      </header>

      {/* ── Main ── */}
      <div className="flex-1 flex gap-6 p-6 max-w-6xl mx-auto w-full">

        {/* ── Left: Main content ── */}
        <div className="flex-1 flex flex-col gap-5">

          {/* Hero banner */}
          <div className="bg-gradient-to-br from-sky-700 to-cyan-600 rounded-2xl p-8 relative overflow-hidden shadow-lg shadow-sky-200">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-12 w-32 h-32 bg-cyan-400/30 rounded-full translate-y-1/2" />
            <div className="relative z-10">
              <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
                ⚡ Quiz Available Now
              </span>
              <h1 className="text-3xl font-extrabold text-white leading-tight mb-2">
                Ready to Test<br />
                <span className="text-yellow-300">Your Brain? 🧠</span>
              </h1>
              <p className="text-sky-200 text-sm leading-relaxed mb-6 max-w-sm">
                Answer fun general knowledge questions, track your progress, and see how well you do!
              </p>
              <button
                onClick={() => navigate(`/quiz/${QUIZ_ID}`)}
                className="bg-white text-sky-700 font-extrabold text-sm px-6 py-3 rounded-xl hover:bg-sky-50 transition-all active:scale-95 shadow-md"
              >
                Start Quiz →
              </button>
            </div>
          </div>

          {/* Quiz details card */}
          <div className="bg-white rounded-2xl shadow-sm border border-sky-100 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center text-2xl">
                📚
              </div>
              <div>
                <h2 className="text-gray-800 font-extrabold text-lg leading-tight">
                  General Knowledge for Kids
                </h2>
                <p className="text-gray-400 text-sm">A fun quiz to test what you know!</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { icon: "❓", label: "Questions",  value: "5"     },
                { icon: "🎯", label: "Difficulty", value: "Easy"  },
                { icon: "⏱️", label: "Duration",   value: "~3 min" },
              ].map((s) => (
                <div key={s.label} className="bg-sky-50 border border-sky-100 rounded-xl p-3 text-center">
                  <p className="text-xl mb-1">{s.icon}</p>
                  <p className="text-sky-700 font-extrabold text-sm">{s.value}</p>
                  <p className="text-sky-400 text-xs">{s.label}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate(`/quiz/${QUIZ_ID}`)}
              className="w-full py-4 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-base rounded-xl shadow-lg shadow-sky-200 transition-all active:scale-95"
            >
              Start Quiz 🚀
            </button>
          </div>
        </div>

        {/* ── Right: Info panel ── */}
        <div className="w-64 flex-shrink-0 flex flex-col gap-4">

          {/* How to play */}
          <div className="bg-white rounded-2xl shadow-sm border border-sky-100 overflow-hidden">
            <div className="bg-sky-600 px-4 py-3">
              <p className="text-white font-extrabold text-sm">How to Play</p>
            </div>
            <div className="p-4 flex flex-col gap-3">
              {[
                { n: "1", text: "Read each question carefully",        color: "bg-sky-600" },
                { n: "2", text: "Select the answer you think is right", color: "bg-purple-500" },
                { n: "3", text: "Use navigation to jump between questions", color: "bg-pink-500" },
                { n: "4", text: "Click Finish to submit all answers",  color: "bg-amber-500"  },
                { n: "5", text: "Review your results and correct answers", color: "bg-green-500" },
              ].map((s) => (
                <div key={s.n} className="flex items-start gap-3">
                  <span className={`w-5 h-5 ${s.color} text-white text-xs font-extrabold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    {s.n}
                  </span>
                  <p className="text-gray-500 text-xs leading-snug">{s.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tips card */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-amber-700 font-extrabold text-sm mb-2">💡 Good to know</p>
            <ul className="flex flex-col gap-1.5">
              {[
                "You can change answers before submitting",
                "Skipped questions count as wrong",
                "Results show the correct answers",
              ].map((t) => (
                <li key={t} className="text-amber-600 text-xs flex items-start gap-2">
                  <span className="mt-0.5 flex-shrink-0">•</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
