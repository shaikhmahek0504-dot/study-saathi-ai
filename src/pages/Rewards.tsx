import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, Medal, Star, Flame, Target, Zap, Crown, Award, 
  ChevronRight, Gift, Coins, TrendingUp, Sparkles, CheckCircle2,
  Brain, Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function Rewards() {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'leaderboard' | 'challenges'>('overview');
  const [level, setLevel] = useState(12);
  const [xp, setXp] = useState(4500);
  const [xpToNext, setXpToNext] = useState(5000);
  const [coins, setCoins] = useState(1250);
  const [streak, setStreak] = useState(14);

  const achievements = [
    { id: 1, title: 'Early Bird', description: 'Study before 8 AM for 3 days', progress: 100, max: 100, completed: true, icon: <Zap className="w-6 h-6 text-amber-500" /> },
    { id: 2, title: 'Marathon', description: 'Complete a 4-hour learning session', progress: 100, max: 100, completed: true, icon: <Flame className="w-6 h-6 text-rose-500" /> },
    { id: 3, title: 'Quiz Master', description: 'Score 100% on 5 quizzes', progress: 3, max: 5, completed: false, icon: <Brain className="w-6 h-6 text-indigo-500" /> },
    { id: 4, title: 'Consistency', description: 'Maintain a 30-day streak', progress: 14, max: 30, completed: false, icon: <Calendar className="w-6 h-6 text-emerald-500" /> },
  ];

  const badges = [
    { name: 'Pioneer', unlocked: true, image: 'https://api.dicebear.com/7.x/shapes/svg?seed=Pioneer&backgroundColor=3b82f6' },
    { name: 'Scholar', unlocked: true, image: 'https://api.dicebear.com/7.x/shapes/svg?seed=Scholar&backgroundColor=8b5cf6' },
    { name: 'Night Owl', unlocked: true, image: 'https://api.dicebear.com/7.x/shapes/svg?seed=Night&backgroundColor=f59e0b' },
    { name: 'Champion', unlocked: false, image: 'https://api.dicebear.com/7.x/shapes/svg?seed=Champ&backgroundColor=94a3b8' },
    { name: 'Genius', unlocked: false, image: 'https://api.dicebear.com/7.x/shapes/svg?seed=Genius&backgroundColor=94a3b8' },
  ];

  const leaderboard = [
    { rank: 1, name: 'Alex Johnson', level: 24, score: 12450, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
    { rank: 2, name: 'Sarah Miller', level: 22, score: 11200, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
    { rank: 3, name: 'You', level: 12, score: 4500, avatar: user?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.displayName || 'Y'}` },
    { rank: 4, name: 'Michael Chen', level: 11, score: 4100, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike' },
    { rank: 5, name: 'Emma Davis', level: 9, score: 3800, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma' },
  ];

  const weeklyChallenges = [
    { id: 1, title: 'Complete 5 Study Sessions', reward: 150, progress: 3, target: 5, type: 'coins' },
    { id: 2, title: 'Ace 3 Practice Quizzes', reward: 100, progress: 3, target: 3, type: 'coins', claimed: false },
    { id: 3, title: 'Study for 10 Hours', reward: 300, progress: 7, target: 10, type: 'xp' },
  ];

  const handleClaim = (id: number) => {
    // In a real app, update DB here
    setCoins(prev => prev + 100);
    alert('Reward claimed!');
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Rewards & Achievements</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Track your progress and earn rewards</p>
        </div>
        
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-xl border border-amber-100 dark:border-amber-900/50">
            <Coins className="w-5 h-5 text-amber-500" />
            <span className="font-bold text-amber-700 dark:text-amber-400">{coins}</span>
          </div>
          <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-900/20 px-4 py-2 rounded-xl border border-rose-100 dark:border-rose-900/50">
            <Flame className="w-5 h-5 text-rose-500" />
            <span className="font-bold text-rose-700 dark:text-rose-400">{streak} Days</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl w-fit">
        {['overview', 'leaderboard', 'challenges'].map((tab) => (
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
            className="flex flex-col gap-8"
          >
            {/* Level Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="w-32 h-32 relative shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="10" />
                    <circle 
                      cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="10" 
                      strokeDasharray="283" 
                      strokeDashoffset={283 - (283 * (xp / xpToNext))}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-sm font-bold text-indigo-200">LEVEL</span>
                    <span className="text-4xl font-black">{level}</span>
                  </div>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold mb-2">You're doing great, {user?.displayName?.split(' ')[0] || 'Scholar'}!</h2>
                  <p className="text-indigo-100 mb-6">Earn {xpToNext - xp} more XP to reach Level {level + 1}. Keep learning to level up!</p>
                  
                  <div className="flex flex-wrap justify-center md:justify-start gap-4">
                    <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 border border-white/10">
                      <Star className="w-4 h-4 text-amber-300" />
                      <span className="font-bold text-sm">{xp} / {xpToNext} XP</span>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 border border-white/10">
                      <Target className="w-4 h-4 text-emerald-300" />
                      <span className="font-bold text-sm">Top 15%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Badges */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-slate-800 dark:text-white text-lg flex items-center gap-2">
                    <Medal className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                    My Badges
                  </h3>
                  <span className="text-sm font-bold text-slate-400 dark:text-slate-500">3/15 Unlocked</span>
                </div>
                
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                  {badges.map((badge, idx) => (
                    <div key={idx} className={`flex flex-col items-center gap-2 ${!badge.unlocked ? 'opacity-40 grayscale' : ''}`}>
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
                        <img src={badge.image} alt={badge.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400 text-center">{badge.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Achievements */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="font-bold text-slate-800 dark:text-white text-lg flex items-center gap-2 mb-6">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Achievements
                </h3>

                <div className="space-y-4">
                  {achievements.map((ach) => {
                    // @ts-ignore
                    const BrainCircuit = Trophy; // fallback
                    // @ts-ignore
                    const CalendarDays = Trophy; // fallback
                    return (
                    <div key={ach.id} className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${ach.completed ? 'bg-white dark:bg-slate-700' : 'bg-slate-200 dark:bg-slate-700/50 opacity-50'}`}>
                        {ach.completed ? ach.icon : <Trophy className="w-6 h-6 text-slate-400 dark:text-slate-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-slate-800 dark:text-white text-sm truncate">{ach.title}</h4>
                          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 shrink-0">{ach.progress}/{ach.max}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{ach.description}</p>
                        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${ach.completed ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-indigo-500 dark:bg-indigo-400'}`}
                            style={{ width: `${(ach.progress / ach.max) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )})}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'leaderboard' && (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto w-full"
          >
            <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="p-6 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 border-b border-indigo-100 dark:border-indigo-900/50 flex justify-between items-center">
                <h3 className="font-bold text-indigo-900 dark:text-indigo-100 text-lg flex items-center gap-2">
                  <Crown className="w-6 h-6 text-amber-500" />
                  Global Leaderboard
                </h3>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 px-3 py-1 rounded-lg shadow-sm border border-indigo-50 dark:border-indigo-900/50">Season 4</span>
              </div>
              
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {leaderboard.map((user) => (
                  <div key={user.rank} className={`flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${user.name === 'You' ? 'bg-indigo-50/50 dark:bg-indigo-900/20 hover:bg-indigo-50 dark:hover:bg-indigo-900/30' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0
                      ${user.rank === 1 ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400' : 
                        user.rank === 2 ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300' : 
                        user.rank === 3 ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}
                    >
                      {user.rank}
                    </div>
                    <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-800 shadow-sm shrink-0 bg-slate-100 dark:bg-slate-800" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm">{user.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Level {user.level}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-indigo-600 dark:text-indigo-400 block">{user.score.toLocaleString()}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">XP</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'challenges' && (
          <motion.div
            key="challenges"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {weeklyChallenges.map((challenge) => (
              <div key={challenge.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white mb-2">{challenge.title}</h3>
                
                <div className="flex items-center gap-1.5 mb-6">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Reward:</span>
                  <span className={`font-bold text-sm flex items-center gap-1 ${challenge.type === 'coins' ? 'text-amber-600 dark:text-amber-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                    {challenge.type === 'coins' ? <Coins className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                    {challenge.reward} {challenge.type.toUpperCase()}
                  </span>
                </div>

                <div className="mt-auto">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Progress</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{challenge.progress} / {challenge.target}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
                    <div 
                      className="h-full bg-indigo-500 dark:bg-indigo-400 rounded-full transition-all"
                      style={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                    />
                  </div>
                  
                  {challenge.progress >= challenge.target ? (
                    <button 
                      onClick={() => handleClaim(challenge.id)}
                      disabled={challenge.claimed}
                      className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                        challenge.claimed 
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                          : 'bg-emerald-500 dark:bg-emerald-600 text-white hover:bg-emerald-600 dark:hover:bg-emerald-700 shadow-md shadow-emerald-500/20'
                      }`}
                    >
                      {challenge.claimed ? (
                        <><CheckCircle2 className="w-5 h-5" /> Claimed</>
                      ) : (
                        <><Gift className="w-5 h-5" /> Claim Reward</>
                      )}
                    </button>
                  ) : (
                    <button disabled className="w-full py-3 bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 font-bold rounded-xl flex items-center justify-center gap-2 border border-slate-100 dark:border-slate-700">
                      In Progress
                    </button>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
