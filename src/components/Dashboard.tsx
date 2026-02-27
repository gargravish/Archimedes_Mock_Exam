import React, { useEffect, useState } from "react";
import { 
  Trophy, 
  BookOpen, 
  ArrowRight, 
  Target, 
  Zap,
  CheckCircle2,
  Clock,
  BrainCircuit
} from "lucide-react";
import { TestResult } from "../types";

export default function Dashboard({ onStartTest, onLearn }: { onStartTest: () => void, onLearn: () => void }) {
  const [recentResults, setRecentResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/progress")
      .then(res => res.json())
      .then(data => {
        setRecentResults(data.slice(-3).reverse());
        setLoading(false);
      });
  }, []);

  const stats = [
    { label: "Tests Completed", value: recentResults.length, icon: <Trophy className="text-amber-500" />, bg: "bg-amber-50" },
    { label: "Avg. Score", value: recentResults.length > 0 ? `${Math.round(recentResults.reduce((acc, r) => acc + r.score, 0) / recentResults.length)}%` : "N/A", icon: <Target className="text-emerald-500" />, bg: "bg-emerald-50" },
    { label: "Days Streak", value: "1", icon: <Zap className="text-blue-500" />, bg: "bg-blue-50" },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-stone-900">Welcome back, Scholar!</h2>
        <p className="text-stone-500 mt-1">You have 23 days left until the Archimedes Final Stage.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card p-6 flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.bg)}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold text-stone-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Daily Task Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-emerald-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-emerald-200/50">
            <div className="relative z-10">
              <span className="bg-emerald-500/20 text-emerald-200 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-500/30">
                Daily Mission
              </span>
              <h3 className="text-2xl font-bold mt-4">Mock Test #1: Diagnostic</h3>
              <p className="text-emerald-100/80 mt-2 max-w-md">
                Start your journey with a full-length diagnostic test to identify your strengths and weaknesses.
              </p>
              <button 
                onClick={onStartTest}
                className="mt-6 bg-white text-emerald-900 px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-50 transition-all active:scale-95"
              >
                Start Test Now
                <ArrowRight size={18} />
              </button>
            </div>
            {/* Abstract Background Shapes */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-800 rounded-full blur-3xl opacity-50" />
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-emerald-700 rounded-full blur-3xl opacity-30" />
          </div>

          {/* Recent Activity */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-stone-900">Recent Activity</h4>
              <button className="text-xs font-bold text-emerald-600 hover:underline">View All</button>
            </div>
            <div className="space-y-3">
              {loading ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2].map(i => <div key={i} className="h-20 bg-stone-200 rounded-2xl" />)}
                </div>
              ) : recentResults.length > 0 ? (
                recentResults.map((result, i) => (
                  <div key={i} className="glass-card p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center text-stone-500">
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-stone-900">{result.title}</p>
                        <p className="text-xs text-stone-500">{new Date(result.completed_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-600">{result.score}%</p>
                      <p className="text-[10px] text-stone-400 font-bold uppercase">Score</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 glass-card">
                  <p className="text-stone-400 text-sm">No tests completed yet. Start your first one!</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Learning Sidebar */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h4 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
              <BrainCircuit className="text-emerald-600" size={20} />
              Recommended Topics
            </h4>
            <div className="space-y-4">
              <TopicLink title="Number Theory" progress={65} onClick={onLearn} />
              <TopicLink title="Spatial Reasoning" progress={40} onClick={onLearn} />
              <TopicLink title="Algebraic Synthesis" progress={20} onClick={onLearn} />
            </div>
            <button 
              onClick={onLearn}
              className="w-full mt-6 py-3 border border-stone-200 rounded-xl text-sm font-bold text-stone-600 hover:bg-stone-50 transition-all"
            >
              Browse All Topics
            </button>
          </div>

          <div className="bg-stone-900 rounded-3xl p-6 text-white">
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <Clock size={18} className="text-emerald-400" />
              Exam Countdown
            </h4>
            <div className="grid grid-cols-3 gap-2 mt-4">
              <TimeBox value="23" label="Days" />
              <TimeBox value="14" label="Hrs" />
              <TimeBox value="45" label="Mins" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TopicLink({ title, progress, onClick }: { title: string, progress: number, onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full text-left group">
      <div className="flex justify-between items-end mb-1">
        <span className="text-sm font-bold text-stone-700 group-hover:text-emerald-600 transition-colors">{title}</span>
        <span className="text-[10px] font-bold text-stone-400">{progress}%</span>
      </div>
      <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progress}%` }} />
      </div>
    </button>
  );
}

function TimeBox({ value, label }: { value: string, label: string }) {
  return (
    <div className="bg-white/10 rounded-xl p-2 text-center">
      <p className="text-xl font-bold leading-none">{value}</p>
      <p className="text-[8px] uppercase font-bold text-white/50 tracking-widest mt-1">{label}</p>
    </div>
  );
}

import { cn } from "@/src/lib/utils";
