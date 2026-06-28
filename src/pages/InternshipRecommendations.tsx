import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, Search, Briefcase, Calendar, 
  Code, Star, ChevronRight, Loader2, Target, 
  MapPin, Clock, Zap, CheckCircle2, User as UserIcon
} from 'lucide-react';

interface InternshipData {
  recommendations: Array<{
    company: string;
    role: string;
    eligibility: string;
    requiredSkills: string[];
    applicationDeadline: string;
    difficulty: 'Low' | 'Medium' | 'High';
    matchPercentage: number;
    description: string;
  }>;
}

export default function InternshipRecommendations() {
  const [semester, setSemester] = useState('Junior Year (Semester 5)');
  const [skills, setSkills] = useState('React, TypeScript, Node.js');
  const [projects, setProjects] = useState('Built a task manager app using MERN stack');
  const [interests, setInterests] = useState('Frontend Engineering, Web3');
  
  const [isSearching, setIsSearching] = useState(false);
  const [data, setData] = useState<InternshipData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!semester || !skills || !interests) {
      setError('Please fill in semester, skills, and interests.');
      return;
    }

    setIsSearching(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch('/api/internships/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ semester, skills, projects, interests })
      });

      if (!response.ok) {
        throw new Error('Failed to find internships');
      }

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'An error occurred during the search.');
    } finally {
      setIsSearching(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'high': return 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-900/20';
      case 'medium': return 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20';
      case 'low': return 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20';
      default: return 'text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-800';
    }
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 85) return 'text-emerald-500';
    if (percentage >= 70) return 'text-amber-500';
    return 'text-rose-500';
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            Internship Match
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Discover tailored internship opportunities powered by AI.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Input Section */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <UserIcon /> Your Profile
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Current Semester</label>
                <input 
                  type="text" 
                  value={semester} 
                  onChange={e => setSemester(e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" 
                  placeholder="e.g. Junior (Semester 6)" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Technical Skills</label>
                <input 
                  type="text" 
                  value={skills} 
                  onChange={e => setSkills(e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" 
                  placeholder="e.g. Python, SQL, React" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Key Projects</label>
                <textarea 
                  value={projects} 
                  onChange={e => setProjects(e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm h-20 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" 
                  placeholder="e.g. Developed a sentiment analysis bot..." 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Interests / Dream Field</label>
                <input 
                  type="text" 
                  value={interests} 
                  onChange={e => setInterests(e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" 
                  placeholder="e.g. Machine Learning, FinTech" 
                />
              </div>

              <button 
                onClick={handleSearch}
                disabled={isSearching}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2 mt-2"
              >
                {isSearching ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Searching...</>
                ) : (
                  <><Search className="w-5 h-5" /> Find Matches</>
                )}
              </button>
              
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900 text-red-600 dark:text-red-400 text-sm rounded-xl">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-8">
          {!data && !isSearching ? (
             <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed p-8 text-center">
               <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-6">
                 <Briefcase className="w-10 h-10 text-indigo-500 dark:text-indigo-400" />
               </div>
               <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Find Your Next Big Opportunity</h3>
               <p className="text-slate-500 dark:text-slate-400 max-w-md">Describe your background and AI will scour the landscape for the best-fit internship roles for you.</p>
             </div>
          ) : isSearching ? (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-center">
               <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin mb-6" />
               <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Matching Profile...</h3>
               <p className="text-slate-500 dark:text-slate-400">Curating the best opportunities for your skills.</p>
             </div>
          ) : data ? (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Recommended Roles ({data.recommendations.length})</h3>
              <div className="grid grid-cols-1 gap-6">
                {data.recommendations.map((rec, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-shadow group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4">
                       <div className="flex flex-col items-end">
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Match Score</span>
                         <span className={`text-2xl font-black ${getMatchColor(rec.matchPercentage)}`}>
                           {rec.matchPercentage}%
                         </span>
                       </div>
                    </div>

                    <div className="pr-20">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                          <Building2 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">{rec.role}</h4>
                          <span className="text-indigo-600 dark:text-indigo-400 font-medium text-sm">{rec.company}</span>
                        </div>
                      </div>

                      <p className="text-slate-600 dark:text-slate-300 text-sm my-4 leading-relaxed line-clamp-2">
                        {rec.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-5">
                         {rec.requiredSkills.map((skill, j) => (
                           <span key={j} className="text-[11px] font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700">
                             {skill}
                           </span>
                         ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-y-3 gap-x-6 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                          <Calendar className="w-4 h-4" /> {rec.applicationDeadline}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                          <Target className="w-4 h-4" /> {rec.eligibility}
                        </div>
                        <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${getDifficultyColor(rec.difficulty)}`}>
                          {rec.difficulty} Difficulty
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
