import React, { useState, useEffect } from "react";
import { 
  Trophy, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  Lock,
  Sparkles,
  Loader2
} from "lucide-react";
import { MockTest } from "../types";
import { generateMockTest } from "../services/geminiService";

export default function MockTests({ onStartTest }: { onStartTest: (test: MockTest) => void }) {
  const [tests, setTests] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = () => {
    setLoading(true);
    fetch("/api/tests")
      .then(res => res.json())
      .then(data => {
        setTests(data);
        setLoading(false);
      });
  };

  const handleGenerateNext = async () => {
    setGenerating(true);
    const nextDay = tests.length + 1;
    const newQuestions = await generateMockTest(nextDay);
    
    if (newQuestions) {
      // In a real app, we'd save this to the DB via API
      // For this demo, we'll just simulate the API call
      const response = await fetch("/api/tests", {
        method: "POST", // Note: I need to add this route to server.ts
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          day_number: nextDay,
          title: `Mock Test #${nextDay}`,
          questions: newQuestions
        })
      });
      
      if (response.ok) {
        fetchTests();
      }
    }
    setGenerating(false);
  };

  const startTest = (id: number) => {
    fetch(`/api/tests/${id}`)
      .then(res => res.json())
      .then(data => onStartTest(data));
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-stone-900">Mock Exam Series</h2>
          <p className="text-stone-500 mt-1">25 days of intensive conditioning for the Final Stage.</p>
        </div>
        <button 
          onClick={handleGenerateNext}
          disabled={generating}
          className="bg-stone-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-stone-800 transition-all disabled:opacity-50"
        >
          {generating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} className="text-amber-400" />}
          Generate Next Test
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-64 bg-stone-200 animate-pulse rounded-3xl" />)
        ) : (
          tests.map((test, i) => (
            <div key={test.id} className="glass-card p-6 flex flex-col group hover:shadow-lg transition-all border-emerald-500/0 hover:border-emerald-500/20">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold">
                  #{test.day_number}
                </div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">60 Minutes</span>
              </div>
              
              <h3 className="text-xl font-bold text-stone-900 mb-2">{test.title}</h3>
              <p className="text-sm text-stone-500 flex-1">
                Full 25-question simulation covering all Year 7 competitive topics.
              </p>

              <div className="mt-6 pt-6 border-t border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                  <CheckCircle2 size={14} />
                  Available
                </div>
                <button 
                  onClick={() => startTest(test.id)}
                  className="w-10 h-10 bg-stone-900 text-white rounded-full flex items-center justify-center hover:bg-emerald-600 transition-all active:scale-90"
                >
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          ))
        )}

        {/* Locked Tests */}
        {Array.from({ length: Math.max(0, 25 - tests.length) }).map((_, i) => (
          <div key={`locked-${i}`} className="glass-card p-6 opacity-50 bg-stone-100/50 border-dashed">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-stone-200 text-stone-400 rounded-2xl flex items-center justify-center font-bold">
                #{tests.length + i + 1}
              </div>
              <Lock size={16} className="text-stone-400" />
            </div>
            <h3 className="text-xl font-bold text-stone-400 mb-2">Locked</h3>
            <p className="text-sm text-stone-400">Complete previous tests to unlock the next day's challenge.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
