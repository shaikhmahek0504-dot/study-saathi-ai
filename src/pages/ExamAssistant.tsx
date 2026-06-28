import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, BookOpen, Target, Brain, ArrowRight, Loader2, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { differenceInDays, parseISO, isAfter } from 'date-fns';

interface ExamPlan {
  highWeightageTopics: string[];
  dailyGoals: { day: number; task: string }[];
  mockTestTopics: string[];
  confidenceScore: number;
}

export default function ExamAssistant() {
  const [subject, setSubject] = useState('');
  const [examDate, setExamDate] = useState('');
  const [syllabus, setSyllabus] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [plan, setPlan] = useState<ExamPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (examDate) {
      const remaining = differenceInDays(parseISO(examDate), new Date());
      setDaysRemaining(remaining > 0 ? remaining : 0);
    } else {
      setDaysRemaining(null);
    }
  }, [examDate]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !examDate || !syllabus) return;

    setIsGenerating(true);
    setError(null);
    setPlan(null);

    try {
      const response = await fetch('/api/exam-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, date: examDate, syllabus })
      });

      if (!response.ok) {
        throw new Error('Failed to generate exam plan');
      }

      const data = await response.json();
      setPlan(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Exam Assistant</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">AI-powered preparation plans and revision strategies</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Setup Form */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Exam Details
            </h2>
            
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                <input 
                  type="text" required
                  value={subject} onChange={e => setSubject(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 outline-none"
                  placeholder="e.g. Physics, History"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Exam Date</label>
                <input 
                  type="date" required
                  value={examDate} onChange={e => setExamDate(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Syllabus / Topics</label>
                <textarea 
                  required
                  value={syllabus} onChange={e => setSyllabus(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 outline-none resize-none min-h-[120px]"
                  placeholder="Paste your syllabus or list of topics to cover..."
                />
              </div>

              <button
                type="submit"
                disabled={isGenerating || !subject || !examDate || !syllabus}
                className="w-full py-4 mt-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-indigo-500/40 transition-all disabled:opacity-50"
              >
                {isGenerating ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</>
                ) : (
                  <><Brain className="w-5 h-5" /> Generate Plan</>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/30 flex gap-3 items-center">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {!plan && !isGenerating && !error && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 border border-slate-200 dark:border-slate-800 shadow-sm text-center h-full flex flex-col items-center justify-center">
               <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6">
                 <Calendar className="w-10 h-10 text-indigo-400" />
               </div>
               <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Ready to plan your success?</h3>
               <p className="text-slate-500 dark:text-slate-400 max-w-sm">Enter your exam details on the left, and our AI will build a personalized revision strategy just for you.</p>
            </div>
          )}

          {plan && (
            <AnimatePresence>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Top Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Countdown */}
                  <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-lg shadow-indigo-500/20 flex flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 text-indigo-100 mb-1">
                        <Clock className="w-4 h-4" /> Exam Countdown
                      </div>
                      <h3 className="text-xl font-bold mb-4">{subject}</h3>
                      
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black">{daysRemaining !== null ? daysRemaining : '-'}</span>
                        <span className="text-indigo-200 font-bold uppercase tracking-wider">Days Left</span>
                      </div>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-10">
                      <Calendar className="w-32 h-32" />
                    </div>
                  </div>

                  {/* Confidence Score */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center gap-2 text-slate-500 font-bold mb-2 uppercase tracking-wider text-xs">
                      <Brain className="w-4 h-4 text-emerald-500" /> Estimated Readiness
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                       <div className="flex items-end gap-2 mb-2">
                         <span className="text-4xl font-black text-slate-800">{plan.confidenceScore}%</span>
                       </div>
                       <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                         <div 
                           className="bg-emerald-500 h-full rounded-full"
                           style={{ width: `${plan.confidenceScore}%` }}
                         />
                       </div>
                       <p className="text-xs text-slate-400 mt-3">Based on syllabus volume and time remaining.</p>
                    </div>
                  </div>
                </div>

                {/* High Weightage */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                    <Target className="w-5 h-5 text-rose-500" /> High Weightage Topics
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {plan.highWeightageTopics.map((topic, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-100 rounded-lg text-sm font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {topic}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Daily Goals */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                      <BookOpen className="w-5 h-5 text-indigo-500" /> Revision Plan
                    </h3>
                    <div className="space-y-4">
                      {plan.dailyGoals.map((goal, idx) => (
                        <div key={idx} className="flex gap-3">
                          <div className="w-10 h-10 shrink-0 bg-indigo-50 rounded-xl flex flex-col items-center justify-center text-indigo-700">
                            <span className="text-[10px] font-bold uppercase">Day</span>
                            <span className="text-sm font-black leading-none">{goal.day}</span>
                          </div>
                          <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-medium text-slate-700">
                            {goal.task}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mock Tests */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                      <Target className="w-5 h-5 text-amber-500" /> Recommended Mock Tests
                    </h3>
                    <ul className="space-y-3">
                      {plan.mockTestTopics.map((topic, idx) => (
                        <li key={idx} className="flex gap-3 items-start p-3 rounded-xl bg-amber-50/50 border border-amber-100/50 text-sm font-medium text-amber-900">
                          <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

              </motion.div>
            </AnimatePresence>
          )}

        </div>

      </div>
    </div>
  );
}
