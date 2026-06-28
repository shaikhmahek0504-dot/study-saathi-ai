import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Bot, ClipboardList, TrendingUp, User as UserIcon, Settings, Sparkles, LogOut, FileText, BrainCircuit, Target, BarChart2, Bell, CheckCircle2, Gift, Briefcase, FileSignature, Map, Crosshair, Building2, Mic, Linkedin, Lightbulb, Trophy, Shield, Rocket } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, messaging } from '../firebase/config';
import { collection, query, onSnapshot, updateDoc, doc, orderBy } from 'firebase/firestore';
import { onMessage } from 'firebase/messaging';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt: number;
}

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    
    // Listen to Firestore notifications
    const q = query(collection(db, 'users', user.uid, 'notifications'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs: Notification[] = [];
      snapshot.forEach(doc => {
        notifs.push({ id: doc.id, ...doc.data() } as Notification);
      });
      setNotifications(notifs);
    });

    // Request Notification permission and listen for FCM foreground messages if supported
    if (messaging) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          console.log('Notification permission granted.');
        }
      }).catch(console.error);

      onMessage(messaging, (payload) => {
        console.log('FCM Message received in foreground:', payload);
      });
    }

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'notifications', id), { read: true });
  };

  const markAllAsRead = async () => {
    if (!user) return;
    const unread = notifications.filter(n => !n.read);
    const promises = unread.map(n => updateDoc(doc(db, 'users', user.uid, 'notifications', n.id), { read: true }));
    await Promise.all(promises);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const getNavLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    return isActive
      ? "flex items-center gap-3 px-4 py-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-xl font-medium transition-colors"
      : "flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors";
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="h-screen w-full bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans flex overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 transition-transform duration-300 lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <Link to="/" className="font-bold text-xl tracking-tight text-slate-800 dark:text-white" onClick={() => setIsSidebarOpen(false)}>
            StudySaathi AI
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <Link to="/dashboard" className={getNavLinkClass('/dashboard')}>
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <Link to="/planner" className={getNavLinkClass('/planner')}>
            <Calendar className="w-5 h-5" />
            Planner
          </Link>
          <Link to="/career-copilot" className={getNavLinkClass('/career-copilot')}>
            <Rocket className="w-5 h-5" />
            Career Copilot
          </Link>
          <Link to="/mentor" className={getNavLinkClass('/mentor')}>
            <Bot className="w-5 h-5" />
            AI Career Mentor
          </Link>
          <Link to="/quiz" className={getNavLinkClass('/quiz')}>
            <BrainCircuit className="w-5 h-5" />
            Quiz Generator
          </Link>
          <Link to="/exam-assistant" className={getNavLinkClass('/exam-assistant')}>
            <Target className="w-5 h-5" />
            Exam Assistant
          </Link>
          <Link to="/summarizer" className={getNavLinkClass('/summarizer')}>
            <FileText className="w-5 h-5" />
            Summarizer
          </Link>
          <Link to="/assignments" className={getNavLinkClass('/assignments')}>
            <ClipboardList className="w-5 h-5" />
            Assignments
          </Link>
          <Link to="/progress" className={getNavLinkClass('/progress')}>
            <TrendingUp className="w-5 h-5" />
            Progress
          </Link>
          <Link to="/analytics" className={getNavLinkClass('/analytics')}>
            <BarChart2 className="w-5 h-5" />
            Analytics
          </Link>
          <Link to="/rewards" className={getNavLinkClass('/rewards')}>
            <Gift className="w-5 h-5" />
            Rewards
          </Link>
          <Link to="/achievements" className={getNavLinkClass('/achievements')}>
            <Trophy className="w-5 h-5" />
            Achievements
          </Link>
          <Link to="/career" className={getNavLinkClass('/career')}>
            <Briefcase className="w-5 h-5" />
            Career
          </Link>
          <Link to="/roadmap" className={getNavLinkClass('/roadmap')}>
            <Map className="w-5 h-5" />
            Career Roadmap
          </Link>
          <Link to="/skills-gap" className={getNavLinkClass('/skills-gap')}>
            <Crosshair className="w-5 h-5" />
            Skill Gap Analyzer
          </Link>
          <Link to="/internships" className={getNavLinkClass('/internships')}>
            <Building2 className="w-5 h-5" />
            Internship Match
          </Link>
          <Link to="/interview" className={getNavLinkClass('/interview')}>
            <Mic className="w-5 h-5" />
            Interview Coach
          </Link>
          <Link to="/linkedin" className={getNavLinkClass('/linkedin')}>
            <Linkedin className="w-5 h-5" />
            LinkedIn Optimizer
          </Link>
          <Link to="/project-generator" className={getNavLinkClass('/project-generator')}>
            <Lightbulb className="w-5 h-5" />
            Project Generator
          </Link>
          <Link to="/resume" className={getNavLinkClass('/resume')}>
            <FileSignature className="w-5 h-5" />
            Resume Builder
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-200 space-y-1">
          <Link to="/admin" className={getNavLinkClass('/admin')}>
            <Shield className="w-5 h-5" />
            Admin Dashboard
          </Link>
          <Link to="/profile" className={getNavLinkClass('/profile')}>
            <UserIcon className="w-5 h-5" />
            Profile
          </Link>
          <Link to="/settings" className={getNavLinkClass('/settings')}>
            <Settings className="w-5 h-5" />
            Settings
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-left"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
        <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 flex items-center justify-between shrink-0 relative z-40">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">Namaste{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : '!'}</h1>
              <p className="hidden md:block text-sm text-slate-500 dark:text-slate-400">It's a great day to learn something new.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            {/* Notification Bell */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                aria-label="Notifications"
                aria-expanded={showNotifications}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                    <h3 className="font-bold text-slate-800 dark:text-white">Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          onClick={() => markAsRead(notif.id)}
                          className={`p-4 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors ${!notif.read ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h4 className={`text-sm font-bold ${!notif.read ? 'text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{notif.title}</h4>
                            {!notif.read && <span className="w-2 h-2 bg-indigo-500 rounded-full shrink-0 mt-1.5"></span>}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">{notif.body}</p>
                          <span className="text-[10px] font-bold text-slate-400">
                            {formatDistanceToNow(notif.createdAt, { addSuffix: true })}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                        <Bell className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                        <p className="text-sm font-medium">No notifications yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border-2 border-white dark:border-slate-800 overflow-hidden shadow-sm flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span>{getInitials(user?.displayName || user?.email)}</span>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 dark:bg-slate-950">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
