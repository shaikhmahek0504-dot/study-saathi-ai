import { useState, useEffect } from 'react';
import { Sparkles, Plus, CheckCircle2, MoreHorizontal, Calendar, Bot, FileText, ClipboardList, HelpCircle, User, Clock, BookOpen, GraduationCap, Flame, ArrowRight, Code2, Briefcase, Trophy, Target, Star, Building2, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, query, getDocs, addDoc } from 'firebase/firestore';

const progressData = [
  { name: 'Completed', value: 75, color: '#4F46E5' },
  { name: 'Remaining', value: 25, color: '#E0E7FF' },
];

const weeklyData = [
  { name: 'Mon', hours: 2.5 },
  { name: 'Tue', hours: 3.8 },
  { name: 'Wed', hours: 4.2 },
  { name: 'Thu', hours: 1.5 },
  { name: 'Fri', hours: 5.0 },
  { name: 'Sat', hours: 6.5 },
  { name: 'Sun', hours: 2.0 },
];

export default function Dashboard() {
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const { user } = useAuth();

  useEffect(() => {
    // Generate mock notifications if none exist
    const checkNotifications = async () => {
      if (!user) return;
      const q = query(collection(db, 'users', user.uid, 'notifications'));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        const mockNotifications = [
          { title: "Weekly Report Ready", body: "Check out your progress for this week! You learned 12 hours more than last week.", type: 'report', read: false, createdAt: Date.now() },
          { title: "Exam Reminder", body: "Mid-Term: Data Structures is exactly 14 days away. Keep preparing!", type: 'exam', read: false, createdAt: Date.now() - 1000 * 60 * 60 },
          { title: "Daily Goal Met!", body: "Awesome! You completed your 4 hours learning goal today.", type: 'goal', read: true, createdAt: Date.now() - 1000 * 60 * 60 * 24 },
          { title: "Assignment Due", body: "Don't forget, Physics Lab Report is due tonight at 11:59 PM.", type: 'assignment', read: false, createdAt: Date.now() - 1000 * 60 * 60 * 2 },
          { title: "Attendance Warning", body: "You missed 3 classes in Advanced Calculus. 85% attendance required.", type: 'attendance', read: true, createdAt: Date.now() - 1000 * 60 * 60 * 48 },
          { title: "Pomodoro Completed", body: "Great focus! 4 Pomodoro sessions completed today.", type: 'pomodoro', read: true, createdAt: Date.now() - 1000 * 60 * 120 },
        ];
        
        for (const notif of mockNotifications) {
          await addDoc(collection(db, 'users', user.uid, 'notifications'), notif);
        }
      }
    };
    
    checkNotifications();
  }, [user]);

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Date & Quick Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-slate-500 font-medium">{currentDate}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { title: 'Planner', icon: Calendar, path: '/planner', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
          { title: 'Career Mentor', icon: Bot, path: '/mentor', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-100 dark:bg-violet-900/30' },
          { title: 'Summarizer', icon: FileText, path: '/summarizer', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
          { title: 'Tasks', icon: ClipboardList, path: '/assignments', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' },
          { title: 'Quiz', icon: HelpCircle, path: '/quiz', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-900/30' },
          { title: 'Profile', icon: User, path: '/profile', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-200 dark:bg-slate-800' },
        ].map((action, i) => (
          <Link key={i} to={action.path}>
            <motion.div 
              whileHover={{ y: -4 }}
              className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3 hover:shadow-lg dark:hover:shadow-indigo-900/20 transition-all cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-xl ${action.bg} flex items-center justify-center`}>
                <action.icon className={`w-6 h-6 ${action.color}`} />
              </div>
              <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{action.title}</span>
            </motion.div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* AI Suggestions Hero */}
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between shadow-sm">
            <div className="relative z-10 w-full md:w-2/3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-semibold backdrop-blur-md mb-4">
                <Sparkles className="w-4 h-4" />
                AI Suggestions
              </div>
              <h2 className="text-3xl font-bold mb-3">Optimize your LinkedIn profile today.</h2>
              <p className="text-indigo-100 mb-6 text-sm leading-relaxed">
                Based on your career goal, improving your LinkedIn summary can increase recruiter outreach by 40%.
              </p>
              <Link to="/linkedin" className="inline-flex px-6 py-3 bg-white text-indigo-700 rounded-xl font-bold items-center gap-2 transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-indigo-900/20">
                <Sparkles className="w-5 h-5" />
                Open LinkedIn Optimizer
              </Link>
            </div>
            
            {/* Decorative Graphics */}
            <div className="relative z-10 mt-6 md:mt-0 w-full md:w-1/3 flex justify-center">
               <div className="w-32 h-32 md:w-40 md:h-40 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 shadow-2xl">
                 <Bot className="w-16 h-16 text-white opacity-90" />
               </div>
            </div>

            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute left-10 top-5 w-32 h-32 bg-indigo-400/30 rounded-full blur-2xl pointer-events-none"></div>
          </div>

          {/* Career Goal & Today's Goal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Career Goal */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 dark:bg-blue-900/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                    <Target className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white">Career Goal</h3>
                </div>
                <h4 className="text-xl font-black text-slate-900 dark:text-white mb-1">Full Stack Developer</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Target: Top Tech Companies</p>
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                  <span>Progress to readiness</span>
                  <span className="text-blue-600 dark:text-blue-400">65%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
            </div>

            {/* Today's Learning Goal */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 dark:bg-amber-900/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
                    <Star className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white">Today's Goal</h3>
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Complete React Hooks Module</h4>
                <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mb-4">
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 2 Hours</span>
                  <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> 4 Lessons</span>
                </div>
                <button className="w-full py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-700 dark:hover:text-amber-400 border border-slate-200 dark:border-slate-700 hover:border-amber-200 dark:hover:border-amber-700 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Mark as Completed
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weekly Progress Chart */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">Learning Hours</h3>
                <span className="text-xs font-bold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md">
                  +12% vs last week
                </span>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="hours" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Overall Progress Ring */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2">Skill Progress</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Overall completion across all courses & skills</p>
              
              <div className="flex-1 flex items-center justify-center relative">
                <div className="h-40 w-40 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={progressData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                        stroke="none"
                      >
                        {progressData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 1 ? 'currentColor' : entry.color} className={index === 1 ? 'text-slate-100 dark:text-slate-800' : ''} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-extrabold text-slate-800 dark:text-white">75%</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-100 dark:bg-slate-800"></div>
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Remaining</span>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Schedule & Internships */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">Today's Schedule</h3>
                <Link to="/planner" className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold hover:text-indigo-700 dark:hover:text-indigo-300">View All</Link>
              </div>
              
              <div className="space-y-4 flex-1">
                {[
                  { time: '09:00 AM', title: 'Advanced Calculus', type: 'Lecture', duration: '1h 30m', color: 'border-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/10' },
                  { time: '11:30 AM', title: 'Physics Lab', type: 'Practical', duration: '2h 00m', color: 'border-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10' },
                  { time: '02:00 PM', title: 'AI Study Session', type: 'Self Study', duration: '1h 00m', color: 'border-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/10' },
                ].map((schedule, i) => (
                  <div key={i} className={`flex gap-3 p-3 rounded-2xl ${schedule.bg} border-l-4 ${schedule.color}`}>
                    <div className="w-16 shrink-0">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{schedule.time}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{schedule.title}</h4>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {schedule.type}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {schedule.duration}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Internship Applications */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-emerald-500" /> Internships
                </h3>
                <Link to="/internships" className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold hover:text-emerald-700 dark:hover:text-emerald-300">Explore</Link>
              </div>

              <div className="space-y-4 flex-1">
                {[
                  { company: 'Google', role: 'SWE Intern', status: 'Interviewing', logo: 'G', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
                  { company: 'Microsoft', role: 'Frontend Intern', status: 'Applied', logo: 'M', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
                  { company: 'Stripe', role: 'Full Stack Intern', status: 'Under Review', logo: 'S', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
                ].map((app, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${app.bg} ${app.color} flex items-center justify-center font-black text-lg`}>
                        {app.logo}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{app.company}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{app.role}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${
                      app.status === 'Interviewing' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                      app.status === 'Applied' ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300' :
                      'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          <div className="grid grid-cols-2 gap-4">
            {/* Study Streak */}
            <div className="bg-gradient-to-b from-orange-500 to-rose-500 rounded-3xl p-5 text-white text-center shadow-sm relative overflow-hidden flex flex-col items-center justify-center">
               <div className="absolute top-0 right-0 p-2 opacity-20">
                 <Flame className="w-16 h-16" />
               </div>
               <div className="relative z-10 flex flex-col items-center">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-white/20 rounded-full backdrop-blur-sm mb-2">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-bold text-lg mb-0.5">12 Days</h4>
                <p className="text-orange-100 text-[10px] uppercase tracking-wider font-bold">Study Streak</p>
              </div>
            </div>

            {/* Coding Streak */}
            <div className="bg-gradient-to-b from-indigo-500 to-blue-600 rounded-3xl p-5 text-white text-center shadow-sm relative overflow-hidden flex flex-col items-center justify-center">
               <div className="absolute top-0 right-0 p-2 opacity-20">
                 <Code2 className="w-16 h-16" />
               </div>
               <div className="relative z-10 flex flex-col items-center">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-white/20 rounded-full backdrop-blur-sm mb-2">
                  <Code2 className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-bold text-lg mb-0.5">5 Days</h4>
                <p className="text-indigo-100 text-[10px] uppercase tracking-wider font-bold">Coding Streak</p>
              </div>
            </div>
          </div>

          {/* Resume Score */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2 mb-1">
                <Trophy className="w-5 h-5 text-amber-500" /> Resume Score
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[150px]">Your resume is looking great. Keep optimizing!</p>
              <Link to="/resume" className="inline-block mt-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">Improve Score &rarr;</Link>
            </div>
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-slate-100 dark:text-slate-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-emerald-500" strokeDasharray="85, 100" strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-xl font-black text-slate-800 dark:text-white">85</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Exam Countdown */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <div className="w-10 h-10 mx-auto bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-3">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-xs mb-1">Mid-Term Exam</h4>
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 block mb-1">14</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Days Left</span>
            </div>

            {/* Interview Countdown */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <div className="w-10 h-10 mx-auto bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-3">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-xs mb-1">Google Interview</h4>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block mb-1">05</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Days Left</span>
            </div>
          </div>

          {/* Attendance */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800">
             <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">Attendance</h3>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Target: 85%</span>
            </div>
            <div className="flex items-center gap-4 mb-2">
              <div className="flex-1">
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">92%</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">You can safely miss 4 more classes.</p>
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col flex-1 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">Upcoming Deadlines</h3>
              <Link to="/assignments" className="text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"><ArrowRight className="w-5 h-5" /></Link>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-amber-700 dark:text-amber-500 mb-1">Today, 11:59 PM</div>
                  <h4 className="font-bold text-amber-900 dark:text-amber-400 text-sm">Physics Lab Report</h4>
                </div>
                <button className="w-8 h-8 rounded-full bg-amber-200 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500 flex items-center justify-center hover:bg-amber-300 dark:hover:bg-amber-900/50 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Tomorrow</div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Stripe Assessment</h4>
                </div>
                <button className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button className="mt-4 pt-4 border-t border-dashed border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 text-sm font-semibold hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors flex items-center justify-center gap-2 w-full">
              <Plus className="w-4 h-4" />
              Add New Deadline
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

