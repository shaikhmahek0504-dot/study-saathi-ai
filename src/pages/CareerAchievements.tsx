import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, Medal, Star, Flame, Target, Award, 
  Briefcase, Code2, BookOpen, FileSignature, 
  Building2, GraduationCap, CheckCircle2, ChevronRight, Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CareerAchievements() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'badges'>('overview');

  const stats = [
    { label: 'Study Streak', value: '14 Days', icon: <Flame className="w-6 h-6 text-orange-500" />, bg: 'bg-orange-50', color: 'text-orange-700' },
    { label: 'Coding Streak', value: '5 Days', icon: <Code2 className="w-6 h-6 text-indigo-500" />, bg: 'bg-indigo-50', color: 'text-indigo-700' },
    { label: 'Projects Completed', value: '12', icon: <Target className="w-6 h-6 text-emerald-500" />, bg: 'bg-emerald-50', color: 'text-emerald-700' },
    { label: 'Resume Score', value: '85/100', icon: <FileSignature className="w-6 h-6 text-blue-500" />, bg: 'bg-blue-50', color: 'text-blue-700' },
    { label: 'Mock Interviews', value: '3', icon: <Briefcase className="w-6 h-6 text-amber-500" />, bg: 'bg-amber-50', color: 'text-amber-700' },
    { label: 'Internship Apps', value: '24', icon: <Building2 className="w-6 h-6 text-rose-500" />, bg: 'bg-rose-50', color: 'text-rose-700' },
    { label: 'Certificates', value: '4', icon: <GraduationCap className="w-6 h-6 text-violet-500" />, bg: 'bg-violet-50', color: 'text-violet-700' },
  ];

  const badges = [
    { id: 1, title: 'Code Warrior', description: 'Maintain a 5-day coding streak', icon: <Code2 className="w-8 h-8 text-white" />, color: 'from-indigo-500 to-blue-600', unlocked: true, date: 'Oct 12, 2026' },
    { id: 2, title: 'Resume Master', description: 'Achieve an 80+ resume score', icon: <FileSignature className="w-8 h-8 text-white" />, color: 'from-emerald-400 to-emerald-600', unlocked: true, date: 'Oct 10, 2026' },
    { id: 3, title: 'Interview Ace', description: 'Complete 3 mock interviews', icon: <Briefcase className="w-8 h-8 text-white" />, color: 'from-amber-400 to-orange-500', unlocked: true, date: 'Oct 05, 2026' },
    { id: 4, title: 'Early Bird', description: 'Apply to 20+ internships', icon: <Building2 className="w-8 h-8 text-white" />, color: 'from-rose-400 to-rose-600', unlocked: true, date: 'Sep 28, 2026' },
    { id: 5, title: 'Project Builder', description: 'Complete 15 projects', icon: <Target className="w-8 h-8 text-white" />, color: 'from-slate-400 to-slate-600', unlocked: false, progress: 12, max: 15 },
    { id: 6, title: 'Certified Pro', description: 'Earn 5 certificates', icon: <GraduationCap className="w-8 h-8 text-white" />, color: 'from-slate-400 to-slate-600', unlocked: false, progress: 4, max: 5 },
    { id: 7, title: 'Marathoner', description: 'Maintain a 30-day study streak', icon: <Flame className="w-8 h-8 text-white" />, color: 'from-slate-400 to-slate-600', unlocked: false, progress: 14, max: 30 },
    { id: 8, title: 'Perfectionist', description: 'Achieve a 100 resume score', icon: <Star className="w-8 h-8 text-white" />, color: 'from-slate-400 to-slate-600', unlocked: false, progress: 85, max: 100 },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-500" />
            Career Achievements
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Track your professional growth, milestones, and streaks.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl w-fit">
        {['overview', 'badges'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm capitalize transition-all ${
              activeTab === tab 
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-8"
          >
            {/* Hero Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 md:p-10 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
              <div className="absolute left-0 bottom-0 w-48 h-48 bg-indigo-400/30 rounded-full blur-2xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 justify-between">
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-semibold backdrop-blur-md mb-4 border border-white/10">
                    <Zap className="w-4 h-4" />
                    Level 12 Professional
                  </div>
                  <h2 className="text-3xl font-black mb-2">You're unstoppable, {user?.displayName?.split(' ')[0] || 'Achiever'}!</h2>
                  <p className="text-indigo-100 mb-6 text-sm max-w-lg">You have unlocked 4 career badges this month. Keep up the momentum to reach the top 10% of candidates.</p>
                </div>
                <div className="shrink-0 flex items-center justify-center">
                   <div className="relative w-40 h-40 group">
                      <div className="absolute inset-0 bg-amber-400 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity animate-pulse"></div>
                      <div className="w-full h-full relative z-10 bg-gradient-to-br from-amber-300 to-orange-500 rounded-full p-1 shadow-2xl">
                        <div className="w-full h-full bg-slate-900 rounded-full flex flex-col items-center justify-center border-4 border-amber-400">
                           <Trophy className="w-12 h-12 text-amber-400 mb-1" />
                           <span className="text-white font-black text-2xl">4/8</span>
                           <span className="text-amber-400 text-[10px] uppercase font-bold tracking-wider">Badges</span>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center group hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${stat.bg} ${stat.color} dark:bg-slate-800`}>
                    {stat.icon}
                  </div>
                  <h4 className="text-2xl font-black text-slate-800 dark:text-white mb-1">{stat.value}</h4>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
                </motion.div>
              ))}
            </div>

          </motion.div>
        )}

        {activeTab === 'badges' && (
          <motion.div
            key="badges"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {badges.map((badge, i) => (
                <motion.div 
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group ${!badge.unlocked ? 'opacity-70 grayscale hover:grayscale-0 transition-all' : ''}`}
                >
                  {badge.unlocked && (
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-white/0 to-white/20 dark:from-white/0 dark:to-white/5 rounded-full blur-2xl pointer-events-none"></div>
                  )}
                  
                  <div className={`w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br ${badge.color} flex items-center justify-center shadow-lg mb-6 transform transition-transform group-hover:scale-110 group-hover:rotate-3 relative`}>
                    {badge.icon}
                    {badge.unlocked && (
                      <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2">{badge.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4 min-h-[40px]">{badge.description}</p>
                    
                    {badge.unlocked ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        <Award className="w-3 h-3" />
                        Earned {badge.date}
                      </span>
                    ) : (
                      <div className="w-full">
                        <div className="flex justify-between items-center mb-1.5 px-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Progress</span>
                          <span className="text-[10px] font-bold text-slate-500">{badge.progress} / {badge.max}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-slate-300 dark:bg-slate-600 rounded-full"
                            style={{ width: `${(badge.progress! / badge.max!) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
