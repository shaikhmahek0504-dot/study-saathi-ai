import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { 
  User as UserIcon, Camera, GraduationCap, MapPin, Building2, Coins, 
  Trophy, Medal, Shield, Settings, Moon, Globe, LogOut, ChevronRight, Edit2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    semester: '',
    college: '',
    branch: '',
  });

  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  const toggleDarkMode = () => {
    const isDark = !darkMode;
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };
  const [language, setLanguage] = useState('English');

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileData(data);
          setFormData({
            displayName: data.displayName || '',
            semester: data.semester || '6th Semester',
            college: data.college || 'Stanford University',
            branch: data.branch || 'Computer Science',
          });
        }
      };
      fetchProfile();
    }
  }, [user]);

  const handleSave = async () => {
    if (user) {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, formData);
      setProfileData({ ...profileData, ...formData });
      setIsEditing(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Mock data for badges and achievements
  const achievements = [
    { title: '7 Day Streak', icon: <Trophy className="w-5 h-5 text-amber-500" /> },
    { title: '10 Quizzes Mastered', icon: <Medal className="w-5 h-5 text-indigo-500" /> },
    { title: 'Top 5% Learner', icon: <Shield className="w-5 h-5 text-emerald-500" /> },
  ];

  if (!profileData) return <div className="p-8 flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">My Profile</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your account and preferences</p>
        </div>
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-xl font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button 
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm text-center relative">
            <div className="relative inline-block mb-4 group">
              <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-lg overflow-hidden mx-auto flex items-center justify-center">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                )}
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 hover:bg-indigo-700 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>

            {isEditing ? (
              <input 
                type="text" 
                value={formData.displayName} 
                onChange={e => setFormData({...formData, displayName: e.target.value})}
                className="w-full text-center font-bold text-xl text-slate-800 dark:text-white border-b-2 border-indigo-500 focus:outline-none bg-transparent mb-2"
                placeholder="Your Name"
              />
            ) : (
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-1">{profileData.displayName || 'Student User'}</h2>
            )}
            
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{user?.email}</p>

            <div className="flex justify-center gap-4 mb-6">
               <div className="bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-xl flex items-center gap-2 border border-amber-100 dark:border-amber-900/30">
                 <Coins className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                 <span className="font-bold text-amber-700 dark:text-amber-300">1,250 Coins</span>
               </div>
            </div>

            <div className="space-y-4 text-left">
               <div className="flex items-center gap-3 text-sm">
                 <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                   <Building2 className="w-4 h-4" />
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">College</p>
                   {isEditing ? (
                     <input type="text" value={formData.college} onChange={e => setFormData({...formData, college: e.target.value})} className="w-full font-medium text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none bg-transparent" />
                   ) : (
                     <p className="font-medium text-slate-700 dark:text-slate-300 truncate">{profileData.college || 'Not set'}</p>
                   )}
                 </div>
               </div>

               <div className="flex items-center gap-3 text-sm">
                 <div className="w-8 h-8 rounded-full bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                   <MapPin className="w-4 h-4" />
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Branch</p>
                   {isEditing ? (
                     <input type="text" value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} className="w-full font-medium text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none bg-transparent" />
                   ) : (
                     <p className="font-medium text-slate-700 dark:text-slate-300 truncate">{profileData.branch || 'Not set'}</p>
                   )}
                 </div>
               </div>

               <div className="flex items-center gap-3 text-sm">
                 <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                   <GraduationCap className="w-4 h-4" />
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Semester</p>
                   {isEditing ? (
                     <input type="text" value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} className="w-full font-medium text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none bg-transparent" />
                   ) : (
                     <p className="font-medium text-slate-700 dark:text-slate-300 truncate">{profileData.semester || 'Not set'}</p>
                   )}
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Right Column: Content */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Achievements & Badges */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
             <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
               <Trophy className="w-5 h-5 text-amber-500" />
               Achievements & Badges
             </h3>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {achievements.map((ach, idx) => (
                 <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 text-center hover:shadow-md transition-shadow">
                   <div className="w-12 h-12 mx-auto bg-white dark:bg-slate-700 rounded-full shadow-sm flex items-center justify-center mb-3">
                     {ach.icon}
                   </div>
                   <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">{ach.title}</h4>
                   <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Unlocked</p>
                 </div>
               ))}
             </div>
          </div>

          {/* Preferences */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
             <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
               <Settings className="w-5 h-5 text-slate-500 dark:text-slate-400" />
               Preferences
             </h3>

             <div className="space-y-2">
                <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                      <Moon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white">Dark Mode</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Toggle dark appearance</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={darkMode} onChange={toggleDarkMode} />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white">Language</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Select application language</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400">
                    <select 
                      value={language}
                      onChange={e => setLanguage(e.target.value)}
                      className="bg-transparent outline-none cursor-pointer text-right dark:text-white dark:bg-slate-800"
                    >
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>Hindi</option>
                    </select>
                  </div>
                </div>
             </div>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full py-4 mt-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 font-bold rounded-2xl border border-rose-100 dark:border-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>

      </div>
    </div>
  );
}
