import { useState } from 'react';
import { motion } from 'motion/react';
import { Linkedin, Loader2, Sparkles, User, FileText, CheckCircle2, Copy, Trophy, Target, Award, Briefcase, Zap } from 'lucide-react';

interface OptimizedData {
  profileScore: number;
  analysis: {
    headline: string;
    summary: string;
    experience: string;
    skills: string;
  };
  improvements: string[];
  optimizedProfile: {
    headline: string;
    summary: string;
    experienceText: string;
  };
}

export default function LinkedinOptimizer() {
  const [profileText, setProfileText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [data, setData] = useState<OptimizedData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOptimize = async () => {
    if (!profileText.trim()) {
      setError('Please provide your profile details.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch('/api/linkedin/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileText })
      });

      if (!response.ok) {
        throw new Error('Failed to optimize profile');
      }

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'An error occurred during optimization.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800';
    if (score >= 60) return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800';
    return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <Linkedin className="w-8 h-8 text-[#0A66C2]" />
            LinkedIn Profile Optimizer
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Get AI-driven feedback and optimized content to make your profile stand out.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-500" /> Current Profile Details
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Paste your current headline, summary, experience, and skills below.
            </p>

            <textarea
              value={profileText}
              onChange={(e) => setProfileText(e.target.value)}
              placeholder="e.g. Frontend Developer at Tech Corp...\nExperienced in React and Node.js..."
              className="flex-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 min-h-[300px]"
            />

            <button
              onClick={handleOptimize}
              disabled={isProcessing || !profileText.trim()}
              className="w-full mt-6 py-4 bg-[#0A66C2] text-white rounded-xl font-bold hover:bg-[#004182] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing Profile...</>
              ) : (
                <><Sparkles className="w-5 h-5" /> Optimize Profile</>
              )}
            </button>
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900 text-red-600 dark:text-red-400 text-sm rounded-xl">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-7">
          {!data && !isProcessing ? (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed p-8 text-center">
              <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-6">
                <Linkedin className="w-10 h-10 text-[#0A66C2] opacity-50" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Ready to Optimize</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md">Provide your current details, and AI will generate an optimized, recruiter-friendly profile.</p>
            </div>
          ) : isProcessing ? (
             <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-center">
               <Loader2 className="w-12 h-12 text-[#0A66C2] animate-spin mb-6" />
               <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Analyzing Profile...</h3>
               <p className="text-slate-500 dark:text-slate-400">Evaluating your skills, experience, and keywords.</p>
             </div>
          ) : data ? (
            <div className="space-y-6">
              
              {/* Score Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between"
              >
                <div>
                  <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Overall Profile Score</h3>
                  <div className="flex items-center gap-3">
                    <span className={`text-5xl font-black ${getScoreColor(data.profileScore)}`}>
                      {data.profileScore}
                    </span>
                    <span className="text-slate-400 font-medium">/ 100</span>
                  </div>
                </div>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${getScoreColor(data.profileScore).replace('text-', 'border-').replace('500', '100')} dark:border-slate-800`}>
                  <Trophy className={`w-8 h-8 ${getScoreColor(data.profileScore)}`} />
                </div>
              </motion.div>

              {/* Improvements */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"
              >
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-500" /> Areas for Improvement
                </h3>
                <ul className="space-y-3">
                  {data.improvements.map((imp, i) => (
                    <li key={i} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                      <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{imp}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Optimized Content */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-[#0A66C2]" /> Optimized Content
                </h3>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Award className="w-4 h-4" /> Headline
                    </h4>
                    <button onClick={() => copyToClipboard(data.optimizedProfile.headline)} className="text-slate-400 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 font-medium text-lg">{data.optimizedProfile.headline}</p>
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Analysis</span>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{data.analysis.headline}</p>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Summary (About)
                    </h4>
                    <button onClick={() => copyToClipboard(data.optimizedProfile.summary)} className="text-slate-400 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed text-sm">{data.optimizedProfile.summary}</p>
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Analysis</span>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{data.analysis.summary}</p>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Briefcase className="w-4 h-4" /> Experience & Projects
                    </h4>
                    <button onClick={() => copyToClipboard(data.optimizedProfile.experienceText)} className="text-slate-400 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed text-sm">{data.optimizedProfile.experienceText}</p>
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Experience Analysis</span>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{data.analysis.experience}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Skills Analysis</span>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{data.analysis.skills}</p>
                    </div>
                  </div>
                </motion.div>
                
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
