import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutDashboard, 
  BookOpen, 
  Trophy, 
  LineChart, 
  ChevronRight, 
  Timer, 
  CheckCircle2, 
  XCircle,
  BrainCircuit,
  GraduationCap
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import Dashboard from "./components/Dashboard";
import LearningCenter from "./components/LearningCenter";
import MockTests from "./components/MockTests";
import ProgressReport from "./components/ProgressReport";
import TestInterface from "./components/TestInterface";
import { User, MockTest } from "./types";

type View = "dashboard" | "learning" | "tests" | "progress" | "taking-test";

export default function App() {
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [user, setUser] = useState<User | null>(null);
  const [activeTest, setActiveTest] = useState<MockTest | null>(null);

  useEffect(() => {
    fetch("/api/user")
      .then(res => res.json())
      .then(data => setUser(data));
  }, []);

  const startTest = (test: MockTest) => {
    setActiveTest(test);
    setCurrentView("taking-test");
  };

  const finishTest = () => {
    setActiveTest(null);
    setCurrentView("progress");
  };

  return (
    <div className="min-h-screen flex bg-stone-50">
      {/* Sidebar */}
      <nav className="w-64 bg-white border-r border-stone-200 flex flex-col fixed h-full z-10">
        <div className="p-6 flex items-center gap-3 border-bottom border-stone-100">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <GraduationCap size={24} />
          </div>
          <div>
            <h1 className="font-bold text-stone-900 leading-none">Archimedes</h1>
            <span className="text-xs text-stone-500 font-medium uppercase tracking-wider">Mastery Prep</span>
          </div>
        </div>

        <div className="flex-1 px-4 py-6 space-y-2">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            active={currentView === "dashboard"} 
            onClick={() => setCurrentView("dashboard")} 
          />
          <NavItem 
            icon={<BookOpen size={20} />} 
            label="Learning Center" 
            active={currentView === "learning"} 
            onClick={() => setCurrentView("learning")} 
          />
          <NavItem 
            icon={<Trophy size={20} />} 
            label="Mock Tests" 
            active={currentView === "tests" || currentView === "taking-test"} 
            onClick={() => setCurrentView("tests")} 
          />
          <NavItem 
            icon={<LineChart size={20} />} 
            label="Progress Report" 
            active={currentView === "progress"} 
            onClick={() => setCurrentView("progress")} 
          />
        </div>

        <div className="p-4 border-t border-stone-100">
          <div className="bg-stone-50 rounded-xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-stone-200 rounded-full flex items-center justify-center text-stone-600 font-bold text-xs">
              {user?.name?.[0] || "S"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-stone-900 truncate">{user?.name || "Student"}</p>
              <p className="text-[10px] text-stone-500 uppercase font-bold tracking-tighter">Year 7 Scholar</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="max-w-5xl mx-auto"
          >
            {currentView === "dashboard" && <Dashboard onStartTest={() => setCurrentView("tests")} onLearn={() => setCurrentView("learning")} />}
            {currentView === "learning" && <LearningCenter />}
            {currentView === "tests" && <MockTests onStartTest={startTest} />}
            {currentView === "progress" && <ProgressReport />}
            {currentView === "taking-test" && activeTest && (
              <TestInterface test={activeTest} onFinish={finishTest} user={user!} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
        active 
          ? "bg-emerald-50 text-emerald-700 shadow-sm" 
          : "text-stone-500 hover:bg-stone-50 hover:text-stone-700"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
