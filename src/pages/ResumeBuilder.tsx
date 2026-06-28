import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileSignature, Download, Sparkles, Plus, Trash2, 
  ChevronRight, CheckCircle2, FileText, Eye, Edit3, 
  Save, LayoutTemplate, Briefcase, GraduationCap, 
  Code, Award, User as UserIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { doc, setDoc, getDoc, collection, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { GoogleGenAI } from '@google/genai';

// Initialize Gemini (assuming we proxy or use API key directly if needed)
// For security, normally this is server-side, but we'll use the API key from env if available for client-side demo
// For now, we will mock the AI or use a fetch to a backend if we have one. Since we don't have a backend set up for this specifically, 
// and the environment guidelines say "Always use process.env.GEMINI_API_KEY for the Gemini API in server-side code only. This key must never be exposed to the browser.",
// we should create an API route for it.
// Let's create an API route for the resume enhancement.

interface ResumeData {
  id?: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  links: string;
  summary: string;
  experience: Array<{ id: string; role: string; company: string; date: string; description: string }>;
  education: Array<{ id: string; degree: string; school: string; date: string; details: string }>;
  projects: Array<{ id: string; name: string; tech: string; date: string; description: string }>;
  skills: string;
  certifications: Array<{ id: string; name: string; date: string; details: string }>;
  achievements: string;
  lastUpdated?: number;
}

const emptyResume: ResumeData = {
  name: '',
  title: '',
  email: '',
  phone: '',
  location: '',
  links: '',
  summary: '',
  experience: [],
  education: [],
  projects: [],
  skills: '',
  certifications: [],
  achievements: ''
};

export default function ResumeBuilder() {
  const { user } = useAuth();
  const [data, setData] = useState<ResumeData>(emptyResume);
  const [isEditing, setIsEditing] = useState(true);
  const [template, setTemplate] = useState<'modern' | 'classic' | 'minimal'>('modern');
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadResume();
    }
  }, [user]);

  const loadResume = async () => {
    if (!user) return;
    try {
      const resumesRef = collection(db, 'users', user.uid, 'resumes');
      const q = query(resumesRef, orderBy('lastUpdated', 'desc'));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        setData({ ...docSnap.data(), id: docSnap.id } as ResumeData);
      }
    } catch (err) {
      console.error('Error loading resume:', err);
    }
  };

  const saveResume = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const resumeId = data.id || Date.now().toString();
      const resumeRef = doc(db, 'users', user.uid, 'resumes', resumeId);
      
      const saveData = {
        ...data,
        lastUpdated: Date.now()
      };
      
      await setDoc(resumeRef, saveData);
      setData({ ...saveData, id: resumeId });
    } catch (err) {
      console.error('Error saving resume:', err);
      setError('Failed to save resume.');
    } finally {
      setIsSaving(false);
    }
  };

  const enhanceWithAI = async (field: keyof ResumeData, id?: string) => {
    setIsGenerating(true);
    setError(null);
    try {
      // We will call the backend API to enhance the resume content
      const response = await fetch('/api/resume/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, data, id })
      });

      if (!response.ok) {
        throw new Error('Failed to enhance content');
      }

      const result = await response.json();
      
      if (id && Array.isArray(data[field])) {
         const list = data[field] as any[];
         const updatedList = list.map(item => item.id === id ? { ...item, description: result.enhancedText } : item);
         setData({ ...data, [field]: updatedList });
      } else {
         setData({ ...data, [field]: result.enhancedText });
      }
    } catch (err: any) {
      setError(err.message || 'AI Enhancement failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper functions to manage lists
  const addItem = (field: 'experience' | 'education' | 'projects' | 'certifications') => {
    const newItem = field === 'experience' ? { id: Date.now().toString(), role: '', company: '', date: '', description: '' }
      : field === 'education' ? { id: Date.now().toString(), degree: '', school: '', date: '', details: '' }
      : field === 'projects' ? { id: Date.now().toString(), name: '', tech: '', date: '', description: '' }
      : { id: Date.now().toString(), name: '', date: '', details: '' };
    
    setData({ ...data, [field]: [...data[field], newItem] as any });
  };

  const updateItem = (field: 'experience' | 'education' | 'projects' | 'certifications', id: string, key: string, value: string) => {
    const list = data[field] as any[];
    const updatedList = list.map(item => item.id === id ? { ...item, [key]: value } : item);
    setData({ ...data, [field]: updatedList });
  };

  const removeItem = (field: 'experience' | 'education' | 'projects' | 'certifications', id: string) => {
    const list = data[field] as any[];
    setData({ ...data, [field]: list.filter(item => item.id !== id) });
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 print:p-0">
      <div className="flex justify-between items-center mb-8 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <FileSignature className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            AI Resume Builder
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Create an ATS-friendly, professional resume with AI.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            {isEditing ? <><Eye className="w-4 h-4" /> Preview</> : <><Edit3 className="w-4 h-4" /> Edit</>}
          </button>
          <button 
            onClick={saveResume}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            {isSaving ? <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span> : <Save className="w-4 h-4" />}
            Save
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/30 flex justify-between items-center print:hidden">
          {error}
          <button onClick={() => setError(null)} className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-bold">&times;</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Editor Side */}
        {isEditing && (
          <div className="lg:col-span-5 space-y-6 print:hidden h-[calc(100vh-200px)] overflow-y-auto pr-2 pb-20 custom-scrollbar">
            
            {/* Personal Info */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                <UserIcon className="w-5 h-5 text-indigo-500" /> Personal Info
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
                  <input type="text" value={data.name} onChange={e => setData({...data, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" placeholder="John Doe" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Professional Title</label>
                  <input type="text" value={data.title} onChange={e => setData({...data, title: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" placeholder="Software Engineer" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Email</label>
                  <input type="email" value={data.email} onChange={e => setData({...data, email: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Phone</label>
                  <input type="tel" value={data.phone} onChange={e => setData({...data, phone: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" placeholder="+1 234 567 890" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Location</label>
                  <input type="text" value={data.location} onChange={e => setData({...data, location: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" placeholder="New York, NY" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Links (LinkedIn/GitHub)</label>
                  <input type="text" value={data.links} onChange={e => setData({...data, links: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" placeholder="github.com/johndoe" />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-500" /> Professional Summary
                </h2>
                <button onClick={() => enhanceWithAI('summary')} disabled={isGenerating || !data.summary} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                  <Sparkles className="w-3 h-3" /> AI Polish
                </button>
              </div>
              <textarea 
                value={data.summary} 
                onChange={e => setData({...data, summary: e.target.value})} 
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 h-24 resize-none" 
                placeholder="Briefly describe your background, key skills, and career goals..."
              />
            </div>

            {/* Experience */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-indigo-500" /> Experience
                </h2>
                <button onClick={() => addItem('experience')} className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
              
              <div className="space-y-6">
                {data.experience.map((exp, index) => (
                  <div key={exp.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl relative group">
                    <button onClick={() => removeItem('experience', exp.id)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <input type="text" value={exp.role} onChange={e => updateItem('experience', exp.id, 'role', e.target.value)} className="col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Job Title" />
                      <input type="text" value={exp.company} onChange={e => updateItem('experience', exp.id, 'company', e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Company" />
                      <input type="text" value={exp.date} onChange={e => updateItem('experience', exp.id, 'date', e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Date (e.g. 2020 - Present)" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Achievements / Responsibilities</label>
                        <button onClick={() => enhanceWithAI('experience', exp.id)} disabled={isGenerating || !exp.description} className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 px-2 py-1 rounded flex items-center gap-1 transition-colors">
                          <Sparkles className="w-3 h-3" /> ATS Enhance
                        </button>
                      </div>
                      <textarea value={exp.description} onChange={e => updateItem('experience', exp.id, 'description', e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm h-20 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="- Developed feature X resulting in Y% increase..." />
                    </div>
                  </div>
                ))}
                {data.experience.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No experience added yet.</p>}
              </div>
            </div>

            {/* Education */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-500" /> Education
                </h2>
                <button onClick={() => addItem('education')} className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
              <div className="space-y-4">
                {data.education.map((edu) => (
                  <div key={edu.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl relative group">
                    <button onClick={() => removeItem('education', edu.id)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-2 gap-3 mb-2">
                      <input type="text" value={edu.degree} onChange={e => updateItem('education', edu.id, 'degree', e.target.value)} className="col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Degree (e.g. B.S. Computer Science)" />
                      <input type="text" value={edu.school} onChange={e => updateItem('education', edu.id, 'school', e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="University Name" />
                      <input type="text" value={edu.date} onChange={e => updateItem('education', edu.id, 'date', e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Date (e.g. May 2024)" />
                    </div>
                    <input type="text" value={edu.details} onChange={e => updateItem('education', edu.id, 'details', e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="GPA, Honors, Relevant Coursework" />
                  </div>
                ))}
              </div>
            </div>

            {/* Projects */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Code className="w-5 h-5 text-indigo-500" /> Projects
                </h2>
                <button onClick={() => addItem('projects')} className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
              
              <div className="space-y-6">
                {data.projects.map((proj) => (
                  <div key={proj.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl relative group">
                    <button onClick={() => removeItem('projects', proj.id)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <input type="text" value={proj.name} onChange={e => updateItem('projects', proj.id, 'name', e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Project Name" />
                      <input type="text" value={proj.date} onChange={e => updateItem('projects', proj.id, 'date', e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Date" />
                      <input type="text" value={proj.tech} onChange={e => updateItem('projects', proj.id, 'tech', e.target.value)} className="col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Tech Stack (e.g. React, Node.js, Firebase)" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Description</label>
                        <button onClick={() => enhanceWithAI('projects', proj.id)} disabled={isGenerating || !proj.description} className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 px-2 py-1 rounded flex items-center gap-1 transition-colors">
                          <Sparkles className="w-3 h-3" /> ATS Enhance
                        </button>
                      </div>
                      <textarea value={proj.description} onChange={e => updateItem('projects', proj.id, 'description', e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm h-16 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="What did you build and why?" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills & Others */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-indigo-500" /> Skills
                </h2>
                <textarea value={data.skills} onChange={e => setData({...data, skills: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm h-16 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="JavaScript, Python, React, Data Analysis (Comma separated)" />
              </div>
              
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-indigo-500" /> Achievements & Awards
                </h2>
                <textarea value={data.achievements} onChange={e => setData({...data, achievements: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm h-16 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Dean's List 2023, 1st Place Hackathon..." />
              </div>
            </div>
          </div>
        )}

        {/* Preview Side */}
        <div className={`${isEditing ? 'lg:col-span-7' : 'lg:col-span-12'} transition-all duration-300`}>
          
          {/* Template Selector (Only show if editing) */}
          {isEditing && (
            <div className="mb-4 flex items-center gap-2 print:hidden overflow-x-auto pb-2">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider mr-2 whitespace-nowrap">Template:</span>
              {(['modern', 'classic', 'minimal'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTemplate(t)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold capitalize transition-colors whitespace-nowrap ${template === t ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          {/* Resume Paper Preview */}
          <div className="bg-white shadow-xl mx-auto rounded-sm overflow-hidden resume-preview-container print:shadow-none print:m-0" 
               style={{ 
                 width: '100%', 
                 maxWidth: isEditing ? '100%' : '800px',
                 minHeight: '1056px', // Standard US Letter 8.5x11 aspect ratio approx
               }}>
            
            <div className={`p-8 md:p-12 ${
              template === 'modern' ? 'font-sans' : 
              template === 'classic' ? 'font-serif' : 
              'font-mono tracking-tight'
            }`}>
              {/* Header */}
              <div className={`mb-8 ${template === 'modern' ? 'text-center border-b-2 border-slate-200 pb-6' : template === 'classic' ? 'text-center border-b border-black pb-4' : 'text-left mb-10'}`}>
                <h1 className={`font-black text-slate-900 ${template === 'modern' ? 'text-4xl mb-2' : template === 'classic' ? 'text-4xl mb-1' : 'text-3xl mb-2 uppercase'}`}>
                  {data.name || 'Your Name'}
                </h1>
                {data.title && <h2 className={`text-xl text-slate-600 ${template === 'minimal' ? 'mb-4' : 'mb-3'}`}>{data.title}</h2>}
                <div className={`flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 ${template !== 'minimal' ? 'justify-center' : ''}`}>
                  {data.email && <span>{data.email}</span>}
                  {data.phone && <span>{data.phone}</span>}
                  {data.location && <span>{data.location}</span>}
                  {data.links && <span>{data.links}</span>}
                </div>
              </div>

              {/* Summary */}
              {data.summary && (
                <div className="mb-6">
                  <h3 className={`text-lg font-bold text-slate-800 uppercase tracking-wider mb-2 ${template === 'modern' ? 'text-indigo-600' : template === 'classic' ? 'border-b border-slate-300 pb-1' : 'bg-slate-100 p-1'}`}>Summary</h3>
                  <p className="text-slate-700 text-sm leading-relaxed">{data.summary}</p>
                </div>
              )}

              {/* Experience */}
              {data.experience.length > 0 && (
                <div className="mb-6">
                  <h3 className={`text-lg font-bold text-slate-800 uppercase tracking-wider mb-3 ${template === 'modern' ? 'text-indigo-600' : template === 'classic' ? 'border-b border-slate-300 pb-1' : 'bg-slate-100 p-1'}`}>Experience</h3>
                  <div className="space-y-4">
                    {data.experience.map(exp => (
                      <div key={exp.id}>
                        <div className="flex justify-between items-baseline mb-1">
                          <h4 className="font-bold text-slate-800">{exp.role}</h4>
                          <span className="text-sm text-slate-500 font-medium">{exp.date}</span>
                        </div>
                        <div className="text-sm font-medium text-slate-600 mb-1">{exp.company}</div>
                        {exp.description && (
                          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line pl-4 border-l-2 border-slate-200">
                            {exp.description}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {data.education.length > 0 && (
                <div className="mb-6">
                  <h3 className={`text-lg font-bold text-slate-800 uppercase tracking-wider mb-3 ${template === 'modern' ? 'text-indigo-600' : template === 'classic' ? 'border-b border-slate-300 pb-1' : 'bg-slate-100 p-1'}`}>Education</h3>
                  <div className="space-y-3">
                    {data.education.map(edu => (
                      <div key={edu.id}>
                        <div className="flex justify-between items-baseline mb-0.5">
                          <h4 className="font-bold text-slate-800">{edu.degree}</h4>
                          <span className="text-sm text-slate-500 font-medium">{edu.date}</span>
                        </div>
                        <div className="text-sm text-slate-700">{edu.school}</div>
                        {edu.details && <div className="text-sm text-slate-500 mt-0.5">{edu.details}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {data.projects.length > 0 && (
                <div className="mb-6">
                  <h3 className={`text-lg font-bold text-slate-800 uppercase tracking-wider mb-3 ${template === 'modern' ? 'text-indigo-600' : template === 'classic' ? 'border-b border-slate-300 pb-1' : 'bg-slate-100 p-1'}`}>Projects</h3>
                  <div className="space-y-4">
                    {data.projects.map(proj => (
                      <div key={proj.id}>
                        <div className="flex justify-between items-baseline mb-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-800">{proj.name}</h4>
                            {proj.tech && <span className="text-xs text-slate-500">| {proj.tech}</span>}
                          </div>
                          <span className="text-sm text-slate-500 font-medium">{proj.date}</span>
                        </div>
                        {proj.description && (
                          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                            {proj.description}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {data.skills && (
                <div className="mb-6">
                  <h3 className={`text-lg font-bold text-slate-800 uppercase tracking-wider mb-2 ${template === 'modern' ? 'text-indigo-600' : template === 'classic' ? 'border-b border-slate-300 pb-1' : 'bg-slate-100 p-1'}`}>Skills</h3>
                  <p className="text-slate-700 text-sm leading-relaxed">{data.skills}</p>
                </div>
              )}

              {/* Achievements */}
              {data.achievements && (
                <div className="mb-6">
                  <h3 className={`text-lg font-bold text-slate-800 uppercase tracking-wider mb-2 ${template === 'modern' ? 'text-indigo-600' : template === 'classic' ? 'border-b border-slate-300 pb-1' : 'bg-slate-100 p-1'}`}>Achievements</h3>
                  <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{data.achievements}</p>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .resume-preview-container, .resume-preview-container * {
            visibility: visible;
          }
          .resume-preview-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: 100% !important;
            box-shadow: none !important;
            margin: 0;
            padding: 0;
          }
        }
      `}} />
    </div>
  );
}
