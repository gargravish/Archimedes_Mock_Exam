import React, { useState, useEffect } from "react";
import { 
  LineChart as ReLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from "recharts";
import { 
  TrendingUp, 
  Target, 
  AlertCircle, 
  CheckCircle2,
  ChevronRight,
  Brain
} from "lucide-react";
import { TestResult } from "../types";
import { cn } from "@/src/lib/utils";

export default function ProgressReport() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/progress")
      .then(res => res.json())
      .then(data => {
        setResults(data);
        setLoading(false);
      });
  }, []);

  const chartData = results.map(r => ({
    name: `Test ${r.day_number}`,
    score: r.score
  }));

  const topicData = [
    { subject: 'Number Sense', A: 85, fullMark: 100 },
    { subject: 'Arithmetic', A: 90, fullMark: 100 },
    { subject: 'Rates/Ratios', A: 65, fullMark: 100 },
    { subject: 'Data/Prob', A: 70, fullMark: 100 },
    { subject: 'Logic', A: 50, fullMark: 100 },
    { subject: 'Geometry', A: 60, fullMark: 100 },
  ];

  if (loading) return <div className="animate-pulse space-y-8">
    <div className="h-64 bg-stone-200 rounded-3xl" />
    <div className="grid grid-cols-2 gap-8">
      <div className="h-64 bg-stone-200 rounded-3xl" />
      <div className="h-64 bg-stone-200 rounded-3xl" />
    </div>
  </div>;

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-stone-900">Progress Report</h2>
        <p className="text-stone-500 mt-1">Detailed analysis of your journey to Distinction.</p>
      </header>

      {/* Score Trend */}
      <div className="glass-card p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-stone-900">Score Trend</h3>
            <p className="text-sm text-stone-500">Your performance across the mock exam series.</p>
          </div>
          <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold">
            <TrendingUp size={14} />
            +12% Improvement
          </div>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Topic Mastery Radar */}
        <div className="glass-card p-8">
          <h3 className="text-xl font-bold text-stone-900 mb-2">Topic Mastery</h3>
          <p className="text-sm text-stone-500 mb-8">Strengths and areas for focus.</p>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={topicData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} />
                <Radar name="Mastery" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Focus Areas */}
        <div className="glass-card p-8">
          <h3 className="text-xl font-bold text-stone-900 mb-2">Focus Areas</h3>
          <p className="text-sm text-stone-500 mb-6">Topics requiring immediate attention.</p>
          
          <div className="space-y-4">
            <FocusItem 
              topic="Logic & Combinatorics" 
              reason="Consistent errors in 'selections' questions." 
              action="Review Section 3.5 of Syllabus"
              priority="high"
            />
            <FocusItem 
              topic="Geometry" 
              reason="Struggling with interior angle formulae." 
              action="Practice Angle Chasing"
              priority="medium"
            />
            <FocusItem 
              topic="Rates & Ratios" 
              reason="Time management issues on multi-stage problems." 
              action="Drill Speed/Distance/Time"
              priority="low"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FocusItem({ topic, reason, action, priority }: { topic: string, reason: string, action: string, priority: 'high' | 'medium' | 'low' }) {
  const colors = {
    high: "bg-rose-50 text-rose-600 border-rose-100",
    medium: "bg-amber-50 text-amber-600 border-amber-100",
    low: "bg-blue-50 text-blue-600 border-blue-100",
  };

  return (
    <div className="p-4 border border-stone-100 rounded-2xl hover:shadow-sm transition-all">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-stone-900">{topic}</span>
        <span className={cn("text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border", colors[priority])}>
          {priority} Priority
        </span>
      </div>
      <p className="text-xs text-stone-500 mb-3">{reason}</p>
      <button className="text-xs font-bold text-emerald-600 flex items-center gap-1 hover:underline">
        {action}
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
