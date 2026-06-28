import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, BookOpen, Briefcase, Bell, BarChart3, 
  Settings, Shield, Plus, MoreVertical, Trash2, 
  Edit, CheckCircle2, ChevronDown, Search, Filter
} from 'lucide-react';
import { db } from '../firebase/config';
import { collection, onSnapshot, query, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'assignments' | 'internships' | 'announcements'>('overview');
  
  // Data States
  const [studentsCount, setStudentsCount] = useState(0);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [internships, setInternships] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  // Modals
  const [showAddAnnouncement, setShowAddAnnouncement] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '', type: 'info' });

  useEffect(() => {
    // Listen to Users (Students)
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setStudentsCount(snapshot.size);
    });

    // Listen to Assignments
    const unsubAssignments = onSnapshot(collection(db, 'assignments'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAssignments(data);
    });

    // Listen to Internships
    const unsubInternships = onSnapshot(collection(db, 'internships'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInternships(data);
    });

    // Listen to Announcements
    const qAnnouncements = query(collection(db, 'announcements'));
    const unsubAnnouncements = onSnapshot(qAnnouncements, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // sort by createdAt locally since we didn't add index for orderBy
      data.sort((a: any, b: any) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setAnnouncements(data);
    });

    return () => {
      unsubUsers();
      unsubAssignments();
      unsubInternships();
      unsubAnnouncements();
    };
  }, []);

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.message) return;
    
    try {
      await addDoc(collection(db, 'announcements'), {
        ...newAnnouncement,
        createdAt: serverTimestamp()
      });
      setShowAddAnnouncement(false);
      setNewAnnouncement({ title: '', message: '', type: 'info' });
    } catch (error) {
      console.error('Error adding announcement:', error);
    }
  };

  const deleteAnnouncement = async (id: string) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      await deleteDoc(doc(db, 'announcements', id));
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'students', label: 'Students', icon: <Users className="w-5 h-5" /> },
    { id: 'assignments', label: 'Assignments', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'internships', label: 'Internships', icon: <Briefcase className="w-5 h-5" /> },
    { id: 'announcements', label: 'Announcements', icon: <Bell className="w-5 h-5" /> },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-8 max-w-7xl mx-auto px-4 md:px-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 pt-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
            <Shield className="w-8 h-8 text-indigo-500" />
            Admin Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage platform content, users, and track analytics.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 mb-8 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl w-fit hide-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 md:px-6 py-2.5 rounded-xl font-bold text-sm capitalize transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === tab.id 
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab.icon}
            <span className="hidden md:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="w-full">
        {activeTab === 'overview' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Total Students</p>
                  <h3 className="text-3xl font-black text-slate-800 dark:text-white">{studentsCount}</h3>
                </div>
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Assignments</p>
                  <h3 className="text-3xl font-black text-slate-800 dark:text-white">{assignments.length}</h3>
                </div>
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Internships</p>
                  <h3 className="text-3xl font-black text-slate-800 dark:text-white">{internships.length}</h3>
                </div>
                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Announcements</p>
                  <h3 className="text-3xl font-black text-slate-800 dark:text-white">{announcements.length}</h3>
                </div>
                <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center">
                  <Bell className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                 <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Quick Actions</h3>
                 <div className="grid grid-cols-2 gap-4">
                   <button onClick={() => { setActiveTab('announcements'); setShowAddAnnouncement(true); }} className="p-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-2xl hover:bg-indigo-100 transition-colors flex flex-col items-center justify-center gap-2 font-bold text-sm">
                     <Plus className="w-6 h-6" /> New Announcement
                   </button>
                   <button onClick={() => setActiveTab('internships')} className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-2xl hover:bg-emerald-100 transition-colors flex flex-col items-center justify-center gap-2 font-bold text-sm">
                     <Briefcase className="w-6 h-6" /> Manage Internships
                   </button>
                 </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                 <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Recent Announcements</h3>
                 <div className="space-y-3">
                   {announcements.slice(0, 3).map((a, i) => (
                     <div key={a.id || i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                       <div className={`w-2 h-2 rounded-full ${a.type === 'alert' ? 'bg-red-500' : a.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                       <div className="flex-1 truncate text-sm font-medium text-slate-800 dark:text-slate-200">{a.title}</div>
                       <div className="text-[10px] text-slate-500 dark:text-slate-400">{a.createdAt ? new Date(a.createdAt.toMillis()).toLocaleDateString() : 'Just now'}</div>
                     </div>
                   ))}
                   {announcements.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No recent announcements.</p>}
                 </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Announcements Manager</h2>
              <button 
                onClick={() => setShowAddAnnouncement(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> New
              </button>
            </div>

            {showAddAnnouncement && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Create Announcement</h3>
                <form onSubmit={handleAddAnnouncement} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Title</label>
                    <input 
                      required
                      type="text" 
                      value={newAnnouncement.title}
                      onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Message</label>
                    <textarea 
                      required
                      value={newAnnouncement.message}
                      onChange={e => setNewAnnouncement({...newAnnouncement, message: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Type</label>
                    <select 
                      value={newAnnouncement.type}
                      onChange={e => setNewAnnouncement({...newAnnouncement, type: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="info">Info (Blue)</option>
                      <option value="success">Success (Green)</option>
                      <option value="alert">Alert (Red)</option>
                    </select>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700">Post Announcement</button>
                    <button type="button" onClick={() => setShowAddAnnouncement(false)} className="px-6 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200">Cancel</button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              {announcements.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {announcements.map((a) => (
                    <div key={a.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${
                          a.type === 'alert' ? 'bg-red-100 text-red-600' :
                          a.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          <Bell className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-white text-base">{a.title}</h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{a.message}</p>
                          <div className="text-[10px] text-slate-400 mt-2 font-medium uppercase tracking-wider">
                            {a.createdAt ? new Date(a.createdAt.toMillis()).toLocaleString() : 'Just now'}
                          </div>
                        </div>
                      </div>
                      <button onClick={() => deleteAnnouncement(a.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                  No announcements yet. Create one to inform your students.
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Placeholder for other tabs */}
        {['students', 'assignments', 'internships'].includes(activeTab) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 text-center"
          >
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2 capitalize">{activeTab} Management</h2>
            <p className="text-slate-500 dark:text-slate-400">This module is connected to Firebase but currently waiting for advanced data population logic.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
