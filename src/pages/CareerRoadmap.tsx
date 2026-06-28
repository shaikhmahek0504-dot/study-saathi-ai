import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Map as MapIcon, Target, Award, Code, Briefcase, 
  ChevronRight, Sparkles, Loader2, BookOpen, Clock, 
  CheckCircle2, Compass
} from 'lucide-react';

interface RoadmapData {
  roadmap: Array<{
    phaseName: string;
    focusArea: string;
    goals: string[];
    resources: string[];
  }>;
  requiredSkills: string[];
  recommendedProjects: Array<{
    name: string;
    description: string;
    skillsToUse: string[];
  }>;
  certifications: string[];
  interviewPrep: string[];
}

export default function CareerRoadmap() {
  const [currentSemester, setCurrentSemester] = useState('Junior Year (Semester 5)');
  const [currentSkills, setCurrentSkills] = useState('HTML, CSS, Basic JavaScript');
  const [dreamCareer, setDreamCareer] = useState('Full Stack Developer');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const careerExamples = [
    'Full Stack Developer',
    'Data Scientist',
    'AI Engineer',
    'Cloud Engineer',
    'Cyber Security Engineer',
    'Product Manager'
  ];

  const handleGenerate = async () => {
    if (!currentSemester || !currentSkills || !dreamCareer) {
      setError('Please fill in all fields to generate your roadmap.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setRoadmapData(null);

    try {
      const response = await fetch('/api/roadmap/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentSemester, currentSkills, dreamCareer })
      });

      if (!response.ok) {
        throw new Error('Failed to generate roadmap');
      }

      const data = await response.json();
      setRoadmapData(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating your roadmap.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <Compass className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            AI Career Roadmap
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Get a personalized, step-by-step path to your dream job.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Your Starting Point</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Current Semester / Status</label>
                <input 
                  type="text" 
                  value={currentSemester} 
                  onChange={e => setCurrentSemester(e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" 
                  placeholder="e.g. Sophomore, Year 2" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Current Skills</label>
                <textarea 
                  value={currentSkills} 
                  onChange={e => setCurrentSkills(e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" 
                  placeholder="e.g. Python basics, HTML/CSS..." 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Dream Career</label>
                <input 
                  type="text" 
                  value={dreamCareer} 
                  onChange={e => setDreamCareer(e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 mb-2" 
                  placeholder="e.g. Data Scientist" 
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {careerExamples.map(career => (
                    <button 
                      key={career} 
                      onClick={() => setDreamCareer(career)}
                      className="text-[10px] font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      {career}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2 mt-4"
              >
                {isGenerating ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Generating Path...</>
                ) : (
                  <><Sparkles className="w-5 h-5" /> Generate My Roadmap</>
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

        {/* Roadmap Display Section */}
        <div className="lg:col-span-8">
          {!roadmapData && !isGenerating ? (
             <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed p-8 text-center">
               <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-6">
                 <Compass className="w-10 h-10 text-indigo-500 dark:text-indigo-400" />
               </div>
               <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Ready to plot your course?</h3>
               <p className="text-slate-500 dark:text-slate-400 max-w-md">Enter your current status and dream career, and AI will generate a tailored learning roadmap with projects, certifications, and timeline.</p>
             </div>
          ) : isGenerating ? (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-center">
               <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin mb-6" />
               <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Mapping your future...</h3>
               <p className="text-slate-500 dark:text-slate-400">Analyzing skills and industry requirements.</p>
             </div>
          ) : roadmapData ? (
            <div className="space-y-6">
              
              {/* Header Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-2">
                    <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Phases</div>
                  <div className="text-xl font-black text-slate-800 dark:text-white">{roadmapData.roadmap.length}</div>
                </div>
                
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-2">
                    <Code className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Projects</div>
                  <div className="text-xl font-black text-slate-800 dark:text-white">{roadmapData.recommendedProjects.length}</div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-2">
                    <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Certs</div>
                  <div className="text-xl font-black text-slate-800 dark:text-white">{roadmapData.certifications.length}</div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-2">
                    <Briefcase className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Skills</div>
                  <div className="text-xl font-black text-slate-800 dark:text-white">{roadmapData.requiredSkills.length}</div>
                </div>
              </div>

              {/* The Roadmap Timeline */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Learning Path</h3>
                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent">
                  {roadmapData.roadmap.map((phase, index) => (
                    <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 bg-indigo-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        {index + 1}
                      </div>

                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{phase.phaseName}</span>
                        </div>
                        <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-3">{phase.focusArea}</h4>
                        
                        <div className="space-y-3">
                          <div>
                            <h5 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Goals</h5>
                            <ul className="space-y-1">
                              {phase.goals.map((goal, i) => (
                                <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                                  <ChevronRight className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" /> {goal}
                                </li>
                              ))}
                            </ul>
                          </div>
                          {phase.resources && phase.resources.length > 0 && (
                            <div>
                              <h5 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Resources</h5>
                              <div className="flex flex-wrap gap-2">
                                {phase.resources.map((res, i) => (
                                  <span key={i} className="text-[10px] px-2 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md text-slate-600 dark:text-slate-300">
                                    {res}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projects & Certs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Projects */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                    <Code className="w-5 h-5 text-emerald-500" />
                    Recommended Projects
                  </h3>
                  <div className="space-y-4">
                    {roadmapData.recommendedProjects.map((proj, i) => (
                      <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                        <h4 className="font-bold text-slate-800 dark:text-white mb-1">{proj.name}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">{proj.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {proj.skillsToUse.map((skill, j) => (
                            <span key={j} className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prep & Certs */}
                <div className="space-y-6">
                  {/* Skills */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                      <Target className="w-5 h-5 text-blue-500" />
                      Required Skills to Master
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {roadmapData.requiredSkills.map((skill, i) => (
                        <span key={i} className="text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Certs */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                      <Award className="w-5 h-5 text-amber-500" />
                      Recommended Certifications
                    </h3>
                    <ul className="space-y-2">
                      {roadmapData.certifications.map((cert, i) => (
                        <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
                           <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                           {cert}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

              </div>

              {/* Interview Prep */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                  <Briefcase className="w-5 h-5 text-violet-500" />
                  Interview Preparation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roadmapData.interviewPrep.map((prep, i) => (
                    <div key={i} className="flex items-start gap-3 p-3">
                      <div className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                        {i + 1}
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{prep}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
