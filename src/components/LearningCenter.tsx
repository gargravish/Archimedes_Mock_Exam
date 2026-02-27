import React, { useState, useEffect } from "react";
import { 
  Book, 
  ChevronRight, 
  Zap, 
  Lightbulb, 
  Calculator,
  Search,
  Loader2
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { getTopicExplanation } from "../services/geminiService";

const topics = [
  { id: "number-sense", title: "Number Sense & Systems", icon: <Calculator size={20} />, color: "bg-blue-50 text-blue-600" },
  { id: "arithmetic", title: "Arithmetic Operations", icon: <Zap size={20} />, color: "bg-amber-50 text-amber-600" },
  { id: "rates", title: "Rates, Ratios & Proportions", icon: <Zap size={20} />, color: "bg-emerald-50 text-emerald-600" },
  { id: "data", title: "Data, Stats & Probability", icon: <Zap size={20} />, color: "bg-purple-50 text-purple-600" },
  { id: "logic", title: "Logic & Combinatorics", icon: <Lightbulb size={20} />, color: "bg-rose-50 text-rose-600" },
  { id: "geometry", title: "Geometry & Spatial Reasoning", icon: <Zap size={20} />, color: "bg-indigo-50 text-indigo-600" },
];

export default function LearningCenter() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedTopic) {
      setLoading(true);
      const topicTitle = topics.find(t => t.id === selectedTopic)?.title || selectedTopic;
      getTopicExplanation(topicTitle).then(data => {
        setExplanation(data);
        setLoading(false);
      });
    }
  }, [selectedTopic]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-stone-900">Learning Center</h2>
          <p className="text-stone-500 mt-1">Master the syllabus with Olympiad-level strategies.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input 
            type="text" 
            placeholder="Search topics..." 
            className="pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all w-full md:w-64"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Topics */}
        <div className="lg:col-span-1 space-y-2">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic.id)}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-2xl transition-all text-left",
                selectedTopic === topic.id 
                  ? "bg-white shadow-md border-emerald-500/50 border scale-[1.02]" 
                  : "bg-white/50 border border-transparent hover:bg-white hover:shadow-sm"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", topic.color)}>
                  {topic.icon}
                </div>
                <span className={cn("text-sm font-bold", selectedTopic === topic.id ? "text-stone-900" : "text-stone-600")}>
                  {topic.title}
                </span>
              </div>
              <ChevronRight size={16} className={cn("transition-transform", selectedTopic === topic.id ? "text-emerald-500 rotate-90" : "text-stone-300")} />
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {selectedTopic ? (
            <div className="glass-card p-8 min-h-[600px] relative">
              {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm rounded-2xl z-10">
                  <Loader2 className="text-emerald-600 animate-spin mb-4" size={40} />
                  <p className="text-stone-500 font-medium animate-pulse">Consulting Archimedes...</p>
                </div>
              ) : (
                <div className="prose prose-stone max-w-none prose-headings:text-stone-900 prose-p:text-stone-600 prose-strong:text-emerald-700 prose-code:text-emerald-600 prose-code:bg-emerald-50 prose-code:px-1 prose-code:rounded">
                  <ReactMarkdown>{explanation || ""}</ReactMarkdown>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card p-12 flex flex-col items-center justify-center text-center min-h-[600px] border-dashed border-2">
              <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center text-stone-400 mb-6">
                <Book size={40} />
              </div>
              <h3 className="text-xl font-bold text-stone-900">Select a Topic to Begin</h3>
              <p className="text-stone-500 mt-2 max-w-xs">
                Choose a category from the left to dive into core concepts, formulae, and competitive tricks.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { cn } from "@/src/lib/utils";
