import { useState } from 'react';
import { Rocket, Target, BrainCircuit, Compass, Award, Code, Mic, Briefcase, Calendar, ChevronRight, Activity, Zap, CheckCircle2, AlertCircle, Loader2, Play, Sparkles, Map as MapIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CopilotData {
  currentSkillsAnalysis: string[];
  missingSkills: string[];
  learningRoadmap: { phase: number; title: string; duration: string; description: string }[];
  certifications: { name: string; provider: string; relevance: string }[];
  projects: { title: string; description: string; techStack: string[] }[];
  interviewQuestions: { question: string; type: string; hint: string }[];
  internships: { title: string; type: string; focus: string }[];
  weeklySchedule: { day: string; focus: string; hours: number }[];
  readinessScore: number;
}

export default function CareerCopilot() {
  const [targetRole, setTargetRole] = useState('');
  const [currentSkills, setCurrentSkills] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Beginner');
  
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<CopilotData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState('overview');

  const generatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRole) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/career-copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRole, currentSkills, experienceLevel })
      });
      
      if (!res.ok) throw new Error('Failed to generate career plan');
      
      const result = await res.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating the plan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Rocket className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Career Copilot
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Your AI-powered flagship career navigator</p>
        </div>
      </div>

      {!data && !isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 lg:col-start-3">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 border border-slate-200 dark:border-slate-800 shadow-xl shadow-indigo-500/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 text-center mb-10">
                <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-6 shadow-sm border border-indigo-100 dark:border-indigo-800">
                  <Compass className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">Map Your Dream Career</h2>
                <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
                  Tell AI Copilot what you want to become. It will analyze your skills, build a roadmap, suggest projects, and prep you for interviews.
                </p>
              </div>
              
              <form onSubmit={generatePlan} className="relative z-10 space-y-6 max-w-2xl mx-auto">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">I want to become a...</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={targetRole}
                      onChange={e => setTargetRole(e.target.value)}
                      placeholder="e.g. Google Software Engineer, Data Scientist"
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl pl-12 pr-4 py-4 text-lg focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors placeholder:text-slate-400"
                      required
                    />
                    <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Current Skills (Optional)</label>
                    <input 
                      type="text" 
                      value={currentSkills}
                      onChange={e => setCurrentSkills(e.target.value)}
                      placeholder="e.g. Python, basic HTML"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Experience Level</label>
                    <select 
                      value={experienceLevel}
                      onChange={e => setExperienceLevel(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none"
                    >
                      <option>Absolute Beginner</option>
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                  </div>
                </div>
                
                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/30 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}
                
                <button 
                  type="submit"
                  disabled={!targetRole}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl py-4 font-bold text-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                >
                  <Sparkles className="w-5 h-5" />
                  Generate Career Roadmap
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <div className="w-24 h-24 relative mb-8">
            <div className="absolute inset-0 border-4 border-indigo-100 dark:border-indigo-900/30 rounded-full" />
            <div className="absolute inset-0 border-4 border-indigo-600 dark:border-indigo-500 rounded-full border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <BrainCircuit className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Copilot is analyzing...</h2>
          <p className="text-slate-500 dark:text-slate-400 animate-pulse">Building your personalized roadmap to {targetRole || 'success'}</p>
        </div>
      )}

      {data && !isLoading && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
          {/* Header Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-6 col-span-1 md:col-span-2">
              <div className="w-24 h-24 shrink-0 rounded-full bg-indigo-50 dark:bg-indigo-900/20 border-8 border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center relative">
                {/* Simulated circular progress */}
                <svg className="absolute inset-0 w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle className="text-transparent" strokeWidth="8" stroke="currentColor" fill="transparent" r="46" cx="50" cy="50"/>
                  <circle className="text-indigo-600 dark:text-indigo-500 transition-all duration-1000 ease-out" strokeWidth="8" strokeDasharray="289" strokeDashoffset={289 - (289 * data.readinessScore) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" r="46" cx="50" cy="50"/>
                </svg>
                <span className="text-2xl font-black text-indigo-700 dark:text-indigo-400">{data.readinessScore}%</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Target: {targetRole}</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-3">Estimated Readiness Score based on your current profile</p>
                <div className="flex flex-wrap gap-2">
                  {data.currentSkillsAnalysis.slice(0, 3).map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-bold border border-emerald-100 dark:border-emerald-800/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center">
              <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Missing Core Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.missingSkills.map((skill, i) => (
                  <span key={i} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
            {[
              { id: 'overview', icon: MapIcon, label: 'Roadmap' },
              { id: 'schedule', icon: Calendar, label: 'Weekly Schedule' },
              { id: 'projects', icon: Code, label: 'Projects & Certs' },
              { id: 'interviews', icon: Mic, label: 'Interview Prep' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-md' 
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
            
            <div className="flex-1" />
            <button 
              onClick={() => { setData(null); setTargetRole(''); }}
              className="px-5 py-3 rounded-xl font-bold text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              Start Over
            </button>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-8">Your Learning Roadmap</h3>
                    
                    <div className="relative border-l-2 border-indigo-100 dark:border-indigo-900/30 ml-4 md:ml-6 space-y-8 pb-4">
                      {data.learningRoadmap.map((phase, i) => (
                        <div key={i} className="relative pl-8 md:pl-10">
                          <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-500" />
                          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/50">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                              <h4 className="font-bold text-lg text-slate-800 dark:text-white">Phase {phase.phase}: {phase.title}</h4>
                              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg self-start md:self-auto">
                                {phase.duration}
                              </span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{phase.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'schedule' && (
                <motion.div key="schedule" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Weekly Learning Schedule</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {data.weeklySchedule.map((day, i) => (
                        <div key={i} className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/50 flex flex-col h-full">
                          <h4 className="font-bold text-slate-800 dark:text-white mb-1">{day.day}</h4>
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-4">{day.hours} hours</span>
                          <p className="text-sm text-slate-600 dark:text-slate-400 flex-1">{day.focus}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'projects' && (
                <motion.div key="projects" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                      <Code className="w-5 h-5 text-indigo-500" /> Suggested Projects
                    </h3>
                    <div className="space-y-4">
                      {data.projects.map((proj, i) => (
                        <div key={i} className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50">
                          <h4 className="font-bold text-slate-800 dark:text-white mb-2">{proj.title}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{proj.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {proj.techStack.map((tech, j) => (
                              <span key={j} className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm h-fit">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-500" /> Recommended Certifications
                    </h3>
                    <div className="space-y-4">
                      {data.certifications.map((cert, i) => (
                        <div key={i} className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-slate-800 dark:text-white">{cert.name}</h4>
                            <span className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg">{cert.provider}</span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{cert.relevance}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'interviews' && (
                <motion.div key="interviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                      <Mic className="w-5 h-5 text-indigo-500" /> Mock Interview Questions
                    </h3>
                    <div className="space-y-4">
                      {data.interviewQuestions.map((q, i) => (
                        <div key={i} className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 group">
                          <div className="flex items-center gap-2 mb-3">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${q.type.toLowerCase().includes('technical') ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'}`}>
                              {q.type}
                            </span>
                          </div>
                          <p className="font-medium text-slate-800 dark:text-white mb-4">{q.question}</p>
                          <div className="text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 relative overflow-hidden">
                            <div className="font-bold text-xs text-slate-400 mb-1">PRO HINT</div>
                            {q.hint}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm h-fit">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-emerald-500" /> Target Internships
                    </h3>
                    <div className="space-y-4">
                      {data.internships.map((intern, i) => (
                        <div key={i} className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl">
                          <h4 className="font-bold text-slate-800 dark:text-white mb-1">{intern.title}</h4>
                          <p className="text-xs font-bold text-slate-500 mb-2">{intern.type}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{intern.focus}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </div>
  );
}
