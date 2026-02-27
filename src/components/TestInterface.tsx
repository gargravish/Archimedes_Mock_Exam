import React, { useState, useEffect } from "react";
import { 
  Timer, 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  CheckCircle2, 
  AlertCircle, 
  Brain, 
  ArrowRight, 
  XCircle, 
  Trophy 
} from "lucide-react";
import { MockTest, Question, User } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";

export default function TestInterface({ test, onFinish, user }: { test: MockTest, onFinish: () => void, user: User }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (timeLeft > 0 && !isFinished) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !isFinished) {
      handleSubmit();
    }
  }, [timeLeft, isFinished]);

  const handleAnswer = (answer: string) => {
    setAnswers(prev => ({ ...prev, [test.questions[currentQuestionIndex].id]: answer }));
  };

  const handleSubmit = async () => {
    let correctCount = 0;
    test.questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const finalScore = Math.round((correctCount / test.questions.length) * 100);
    setScore(finalScore);
    setIsFinished(true);

    await fetch("/api/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        test_id: test.id,
        score: finalScore,
        total_questions: test.questions.length,
        answers: answers
      })
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isFinished) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-12 text-center"
        >
          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy size={48} />
          </div>
          <h2 className="text-4xl font-bold text-stone-900">Test Completed!</h2>
          <p className="text-stone-500 mt-2">Great effort on {test.title}.</p>
          
          <div className="mt-12 grid grid-cols-2 gap-8 max-w-md mx-auto">
            <div className="p-6 bg-stone-50 rounded-2xl">
              <p className="text-4xl font-bold text-emerald-600">{score}%</p>
              <p className="text-xs font-bold text-stone-400 uppercase mt-1">Accuracy</p>
            </div>
            <div className="p-6 bg-stone-50 rounded-2xl">
              <p className="text-4xl font-bold text-stone-900">{Object.keys(answers).length}/25</p>
              <p className="text-xs font-bold text-stone-400 uppercase mt-1">Answered</p>
            </div>
          </div>

          <div className="mt-12 space-y-4">
            <h3 className="font-bold text-stone-900 text-lg">Detailed Feedback</h3>
            <div className="space-y-4 text-left">
              {test.questions.map((q, i) => (
                <div key={q.id} className="p-6 border border-stone-100 rounded-2xl bg-white shadow-sm">
                  <div className="flex items-start gap-3">
                    {answers[q.id] === q.correctAnswer ? (
                      <CheckCircle2 className="text-emerald-500 shrink-0 mt-1" size={20} />
                    ) : (
                      <XCircle className="text-rose-500 shrink-0 mt-1" size={20} />
                    )}
                    <div>
                      <p className="font-bold text-stone-900">Q{i+1}: {q.text}</p>
                      <div className="mt-2 flex gap-4 text-xs font-medium">
                        <span className="text-stone-500">Your Answer: <span className={answers[q.id] === q.correctAnswer ? "text-emerald-600" : "text-rose-600"}>{answers[q.id] || "None"}</span></span>
                        <span className="text-emerald-600">Correct: {q.correctAnswer}</span>
                      </div>
                      <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                        <p className="text-xs font-bold text-emerald-800 uppercase flex items-center gap-2 mb-2">
                          <Brain size={14} />
                          Olympiad Strategy
                        </p>
                        <p className="text-sm text-emerald-900 leading-relaxed">{q.explanation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={onFinish}
            className="mt-12 btn-primary w-full max-w-md"
          >
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between glass-card p-4 px-6 sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center font-bold text-stone-600">
            {currentQuestionIndex + 1}
          </div>
          <div>
            <h3 className="font-bold text-stone-900 leading-none">{test.title}</h3>
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">Question {currentQuestionIndex + 1} of {test.questions.length}</p>
          </div>
        </div>

        <div className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold transition-colors",
          timeLeft < 300 ? "bg-rose-50 text-rose-600 animate-pulse" : "bg-stone-100 text-stone-700"
        )}>
          <Timer size={18} />
          {formatTime(timeLeft)}
        </div>

        <button 
          onClick={handleSubmit}
          className="bg-stone-900 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-stone-800 transition-all"
        >
          Finish Test
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Question Area */}
        <div className="lg:col-span-3 space-y-6">
          <motion.div 
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-8 min-h-[400px]"
          >
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full mb-4 inline-block">
              {currentQuestion.topic}
            </span>
            <h4 className="text-xl font-bold text-stone-900 leading-relaxed mb-8">
              {currentQuestion.text}
            </h4>

            <div className="space-y-3">
              {currentQuestion.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(option)}
                  className={cn(
                    "w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-4 group",
                    answers[currentQuestion.id] === option 
                      ? "border-emerald-500 bg-emerald-50/50" 
                      : "border-stone-100 hover:border-stone-200 hover:bg-stone-50"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-colors",
                    answers[currentQuestion.id] === option 
                      ? "bg-emerald-500 text-white" 
                      : "bg-stone-100 text-stone-400 group-hover:bg-stone-200"
                  )}>
                    {String.fromCharCode(65 + i)}
                  </div>
                  <span className={cn(
                    "font-medium",
                    answers[currentQuestion.id] === option ? "text-emerald-900" : "text-stone-700"
                  )}>
                    {option}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>

          <div className="flex items-center justify-between">
            <button 
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
              className="btn-secondary flex items-center gap-2"
            >
              <ChevronLeft size={18} />
              Previous
            </button>
            <button 
              onClick={() => {
                if (currentQuestionIndex < test.questions.length - 1) {
                  setCurrentQuestionIndex(prev => prev + 1);
                } else {
                  handleSubmit();
                }
              }}
              className="btn-primary flex items-center gap-2"
            >
              {currentQuestionIndex === test.questions.length - 1 ? "Finish Test" : "Next Question"}
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Question Navigator */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 sticky top-24">
            <h5 className="font-bold text-stone-900 mb-4">Question Map</h5>
            <div className="grid grid-cols-5 gap-2">
              {test.questions.map((q, i) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(i)}
                  className={cn(
                    "aspect-square rounded-lg text-xs font-bold transition-all",
                    currentQuestionIndex === i 
                      ? "ring-2 ring-emerald-500 ring-offset-2" 
                      : "",
                    answers[q.id] 
                      ? "bg-emerald-600 text-white" 
                      : "bg-stone-100 text-stone-400 hover:bg-stone-200"
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-stone-100 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-wider">
                <AlertCircle size={14} />
                Test Strategy
              </div>
              <p className="text-xs text-stone-500 leading-relaxed italic">
                "Time-triage is essential: bank points on foundational arithmetic early to secure time for the synthesis-heavy final quadrant."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



