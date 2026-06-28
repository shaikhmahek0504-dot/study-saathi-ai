import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Crosshair, Target, Zap, AlertTriangle, 
  ChevronRight, Loader2, BarChart3, Clock, 
  CheckCircle2, BrainCircuit
} from 'lucide-react';
import { 
  ResponsiveContainer, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip as RechartsTooltip
} from 'recharts';

interface SkillGapData {
  skillGapPercentage: number;
  requiredSkills: string[];
  missingSkills: string[];
  radarData: Array<{
    subject: string;
    current: number;
    required: number;
  }>;
  recommendations: Array<{
    skill: string;
    priority: 'High' | 'Medium' | 'Low';
    estimatedTime: string;
    reason: string;
  }>;
}

export default function SkillGapAnalyzer() {
  const [targetJob, setTargetJob] = useState('Frontend Developer');
  const [currentSkills, setCurrentSkills] = useState('HTML, CSS, JavaScript (basics)');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [data, setData] = useState<SkillGapData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const jobExamples = [
    'Frontend Developer',
    'Backend Developer',
    'Data Scientist',
    'Product Manager',
    'UX Designer'
  ];

  const handleAnalyze = async () => {
    if (!targetJob || !currentSkills) {
      setError('Please fill in both fields.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch('/api/skills/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetJob, currentSkills })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze skill gap');
      }

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      case 'medium': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'low': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <Crosshair className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            AI Skill Gap Analyzer
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Discover what you need to learn to land your target job.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-500" />
              Target Analysis
            </h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Target Job Role</label>
                <input 
                  type="text" 
                  value={targetJob} 
                  onChange={e => setTargetJob(e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 mb-2" 
                  placeholder="e.g. Frontend Developer" 
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {jobExamples.map(job => (
                    <button 
                      key={job} 
                      onClick={() => setTargetJob(job)}
                      className="text-[10px] font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      {job}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Your Current Skills</label>
                <textarea 
                  value={currentSkills} 
                  onChange={e => setCurrentSkills(e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm h-32 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" 
                  placeholder="List your technical and soft skills (e.g. JavaScript, React basics, Communication)..." 
                />
              </div>

              <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2 mt-4"
              >
                {isAnalyzing ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing Gap...</>
                ) : (
                  <><BrainCircuit className="w-5 h-5" /> Analyze Skills</>
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
          {!data && !isAnalyzing ? (
             <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed p-8 text-center">
               <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-6">
                 <BarChart3 className="w-10 h-10 text-indigo-500 dark:text-indigo-400" />
               </div>
               <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Identify Your Blind Spots</h3>
               <p className="text-slate-500 dark:text-slate-400 max-w-md">Enter your target role and current skills to receive a detailed AI analysis of what you need to learn next.</p>
             </div>
          ) : isAnalyzing ? (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-center">
               <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin mb-6" />
               <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Analyzing Profile...</h3>
               <p className="text-slate-500 dark:text-slate-400">Comparing your skills against industry standards.</p>
             </div>
          ) : data ? (
            <div className="space-y-6">
              
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Gap Score */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 w-full h-1 ${data.skillGapPercentage > 60 ? 'bg-rose-500' : data.skillGapPercentage > 30 ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                  <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Skill Gap</h3>
                  <div className="text-6xl font-black text-slate-800 dark:text-white mb-2">
                    {data.skillGapPercentage}%
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {data.skillGapPercentage > 60 ? 'Significant upskilling required.' : 
                     data.skillGapPercentage > 30 ? 'You are on the right track, keep learning.' : 
                     'You are highly aligned with the role!'}
                  </p>
                </motion.div>

                {/* Radar Chart */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                  <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 text-center">Competency Radar</h3>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.radarData}>
                        <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                        <Radar name="Current" dataKey="current" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
                        <Radar name="Required" dataKey="required" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                        <RechartsTooltip contentStyle={{ borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </div>

              {/* Skills Lists */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {data.requiredSkills.map((skill, i) => (
                      <span key={i} className="text-[11px] font-bold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md border border-slate-200 dark:border-slate-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                    Missing Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {data.missingSkills.length > 0 ? data.missingSkills.map((skill, i) => (
                      <span key={i} className="text-[11px] font-bold px-2.5 py-1 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 rounded-md border border-rose-100 dark:border-rose-900/50">
                        {skill}
                      </span>
                    )) : (
                      <span className="text-sm text-slate-500">None! You have all the core skills.</span>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Action Plan */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"
              >
                <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-6">
                  <Zap className="w-5 h-5 text-indigo-500" />
                  Recommended Action Plan
                </h3>
                
                <div className="space-y-4">
                  {data.recommendations.map((rec, i) => (
                    <div key={i} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col md:flex-row md:items-start gap-4">
                      <div className="flex flex-col gap-2 min-w-[120px]">
                        <span className={`inline-flex w-max text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${getPriorityColor(rec.priority)}`}>
                          {rec.priority} Priority
                        </span>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {rec.estimatedTime}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-800 dark:text-white mb-1">{rec.skill}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{rec.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
