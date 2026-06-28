import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, Sparkles, BookOpen, Clock, Target, AlertCircle, Save, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { doc, setDoc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';

interface StudyPlan {
  dailySchedule: { time: string; task: string; type: string; duration: string }[];
  weeklyGoals: string[];
  revisionPlan: string;
  pomodoro: string;
}

export default function Planner() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'create' | 'calendar'>('create');
  
  // Form State
  const [subjects, setSubjects] = useState('');
  const [examDates, setExamDates] = useState('');
  const [studyHours, setStudyHours] = useState('4');
  const [difficulty, setDifficulty] = useState('Medium');
  const [priority, setPriority] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<StudyPlan | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [savedPlans, setSavedPlans] = useState<StudyPlan[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (user) {
      loadLatestPlan();
    }
  }, [user]);

  const loadLatestPlan = async () => {
    if (!user) return;
    try {
      const planRef = doc(db, 'users', user.uid, 'studyPlans', 'latest');
      const docSnap = await getDoc(planRef);
      if (docSnap.exists()) {
        setGeneratedPlan(docSnap.data() as StudyPlan);
        setActiveTab('calendar');
      }
    } catch (err) {
      console.error("Failed to load plan", err);
    }
  };

  const generatePlan = async (e: FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjects, examDates, studyHours, difficulty, priority }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate plan');
      }
      
      const plan = await response.json();
      setGeneratedPlan(plan);
      setActiveTab('calendar');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const savePlan = async () => {
    if (!user || !generatedPlan) return;
    try {
      await setDoc(doc(db, 'users', user.uid, 'studyPlans', 'latest'), {
        ...generatedPlan,
        createdAt: new Date().toISOString()
      });
      setSuccess('Study plan saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save plan.');
    }
  };

  // Calendar render helpers
  const startDate = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

  return (
    <div className="flex flex-col gap-6 h-full pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Study Planner</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Plan your studies with AI assistance</p>
        </div>
        
        <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'create' ? 'bg-white dark:bg-slate-900 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            Create Plan
          </button>
          <button 
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'calendar' ? 'bg-white dark:bg-slate-900 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            My Schedule
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/30 flex gap-3 items-center">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-900/30 flex gap-3 items-center">
          <CheckCircle2 className="w-5 h-5" />
          <p className="text-sm font-medium">{success}</p>
        </div>
      )}

      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <Target className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Your Goals & Context</h2>
            </div>
            
            <form onSubmit={generatePlan} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Subjects to Study</label>
                <input
                  type="text"
                  required
                  value={subjects}
                  onChange={(e) => setSubjects(e.target.value)}
                  placeholder="e.g. Calculus, Physics, Literature"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all text-sm text-slate-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Upcoming Exam Dates / Deadlines</label>
                <input
                  type="text"
                  required
                  value={examDates}
                  onChange={(e) => setExamDates(e.target.value)}
                  placeholder="e.g. Physics on 15 Oct, Math on 20 Oct"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Study Hours / Day</label>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    required
                    value={studyHours}
                    onChange={(e) => setStudyHours(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Overall Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all text-sm text-slate-900 dark:text-white"
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                    <option>Intense</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Top Priority</label>
                <input
                  type="text"
                  required
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  placeholder="e.g. Need to pass Physics, just passing Math is fine"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all text-sm text-slate-900 dark:text-white"
                />
              </div>
              
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-indigo-500/40 transition-all disabled:opacity-70"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating Plan...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate AI Study Plan
                  </>
                )}
              </button>
            </form>
          </motion.div>

          <div className="hidden lg:flex flex-col items-center justify-center p-8 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-3xl border border-indigo-100 dark:border-indigo-900/30 text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-200 dark:bg-indigo-900 rounded-full blur-3xl opacity-50 dark:opacity-20 -mr-20 -mt-20"></div>
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-200 dark:bg-violet-900 rounded-full blur-3xl opacity-50 dark:opacity-20 -ml-20 -mb-20"></div>
             
             <div className="relative z-10 flex flex-col items-center">
               <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-xl shadow-indigo-200 dark:shadow-indigo-900/50 mb-6">
                 <Sparkles className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
               </div>
               <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">AI-Powered Planning</h3>
               <p className="text-slate-600 dark:text-slate-400 max-w-sm mb-6">
                 Our advanced AI analyzes your subjects, deadlines, and learning preferences to build an optimized daily schedule.
               </p>
               
               <div className="flex gap-4">
                 <div className="flex flex-col items-center">
                   <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-2">
                     <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                   </div>
                   <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Smart Timing</span>
                 </div>
                 <div className="flex flex-col items-center">
                   <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-2">
                     <Target className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                   </div>
                   <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Goal Focused</span>
                 </div>
                 <div className="flex flex-col items-center">
                   <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-2">
                     <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                   </div>
                   <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Balanced</span>
                 </div>
               </div>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          {!generatedPlan ? (
             <div className="col-span-12 flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
               <CalendarIcon className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
               <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-2">No Learning Plan Yet</h3>
               <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">Generate your first AI learning & career plan to see your schedule.</p>
               <button 
                onClick={() => setActiveTab('create')}
                className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
               >
                 Create Plan
               </button>
             </div>
          ) : (
            <>
              {/* Daily Schedule - Left Column */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex-1">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      Daily Schedule
                    </h3>
                    <button onClick={savePlan} className="flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg">
                      <Save className="w-4 h-4" />
                      Save Plan
                    </button>
                  </div>
                  
                  {/* Calendar Week View Header */}
                  <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                    <button onClick={() => setSelectedDate(addDays(selectedDate, -7))} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                      <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>
                    <div className="flex gap-2 md:gap-4 overflow-x-auto px-2">
                      {weekDays.map((day, i) => {
                        const isSelected = isSameDay(day, selectedDate);
                        const isToday = isSameDay(day, new Date());
                        return (
                          <div 
                            key={i}
                            onClick={() => setSelectedDate(day)}
                            className={`flex flex-col items-center justify-center w-12 h-14 md:w-14 md:h-16 rounded-2xl cursor-pointer transition-all shrink-0
                              ${isSelected ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                          >
                            <span className="text-xs font-medium mb-1">{format(day, 'EEE')}</span>
                            <span className={`text-sm md:text-base font-bold ${isToday && !isSelected ? 'text-indigo-600 dark:text-indigo-400' : ''}`}>{format(day, 'd')}</span>
                          </div>
                        );
                      })}
                    </div>
                    <button onClick={() => setSelectedDate(addDays(selectedDate, 7))} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                      <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>
                  </div>

                  {/* Tasks List */}
                  <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent">
                    {generatedPlan.dailySchedule.map((item, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={idx} 
                        className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                      >
                         {/* Timeline Marker */}
                         <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                           {item.type === 'break' ? <Clock className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                         </div>
                         
                         {/* Content Card */}
                         <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 shadow-sm hover:shadow-md transition-shadow">
                           <div className="flex justify-between items-start mb-2">
                             <span className={`text-xs font-bold px-2 py-1 rounded-md ${item.type === 'break' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'}`}>
                               {item.time}
                             </span>
                             <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{item.duration}</span>
                           </div>
                           <h4 className="font-bold text-slate-800 dark:text-white">{item.task}</h4>
                           {item.type === 'study' && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 capitalize">{item.type} Session</p>}
                         </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Weekly Goals & Strategy - Right Column */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                 {/* Weekly Goals */}
                 <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                   <div className="flex items-center gap-3 mb-4">
                     <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                       <Target className="w-5 h-5" />
                     </div>
                     <h3 className="font-bold text-lg text-slate-800 dark:text-white">Weekly Goals</h3>
                   </div>
                   <ul className="space-y-3">
                     {generatedPlan.weeklyGoals.map((goal, i) => (
                       <li key={i} className="flex gap-3">
                         <div className="mt-1">
                           <CheckCircle2 className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                         </div>
                         <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{goal}</span>
                       </li>
                     ))}
                   </ul>
                 </div>

                 {/* Revision Strategy */}
                 <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 shadow-md text-white">
                   <div className="flex items-center gap-3 mb-4">
                     <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                       <Sparkles className="w-5 h-5 text-white" />
                     </div>
                     <h3 className="font-bold text-lg">AI Strategy</h3>
                   </div>
                   <p className="text-indigo-50 text-sm leading-relaxed mb-4">
                     {generatedPlan.revisionPlan}
                   </p>
                   
                   <div className="p-4 bg-black/20 rounded-xl backdrop-blur-sm mt-4 border border-white/10">
                     <h4 className="text-xs font-bold text-indigo-200 uppercase tracking-wider mb-2">Pomodoro Technique</h4>
                     <p className="text-sm font-medium">{generatedPlan.pomodoro}</p>
                   </div>
                 </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
