import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Lightbulb, Code2, Layers, GitMerge, Rocket, 
  FileText, Download, Loader2, Sparkles, 
  FolderTree, Target, BrainCircuit, AlignLeft, Calendar
} from 'lucide-react';

interface ProjectData {
  projectName: string;
  projectIdea: string;
  architecture: string;
  techStack: string[];
  timeline: Array<{
    week: string;
    tasks: string[];
  }>;
  githubStructure: string[];
  deploymentGuide: string;
  resumeDescription: string[];
  portfolioDescription: string;
}

export default function ProjectGenerator() {
  const [technology, setTechnology] = useState('React, Node.js, PostgreSQL');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [domain, setDomain] = useState('EdTech');
  const [careerGoal, setCareerGoal] = useState('Full Stack Developer');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [data, setData] = useState<ProjectData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  const handleGenerate = async () => {
    if (!technology || !domain || !careerGoal) {
      setError('Please fill in all fields.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch('/api/projects/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ technology, difficulty, domain, careerGoal })
      });

      if (!response.ok) {
        throw new Error('Failed to generate project');
      }

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'An error occurred during generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  const exportAsJSON = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.projectName.replace(/\s+/g, '-').toLowerCase()}-project.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const exportAsMarkdown = () => {
    if (!data) return;
    const md = `# ${data.projectName}
    
## Idea
${data.projectIdea}

## Tech Stack
${data.techStack.map(t => `- ${t}`).join('\n')}

## Architecture
${data.architecture}

## Timeline
${data.timeline.map(t => `### ${t.week}\n${t.tasks.map(task => `- ${task}`).join('\n')}`).join('\n')}

## GitHub Structure
\`\`\`
${data.githubStructure.join('\n')}
\`\`\`

## Deployment
${data.deploymentGuide}

## Resume Description
${data.resumeDescription.map(d => `- ${d}`).join('\n')}

## Portfolio Description
${data.portfolioDescription}
`;
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.projectName.replace(/\s+/g, '-').toLowerCase()}-project.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <Lightbulb className="w-8 h-8 text-amber-500" />
            AI Project Generator
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Generate comprehensive project ideas to boost your portfolio.</p>
        </div>
        {data && (
          <div className="flex gap-3">
            <button
              onClick={exportAsJSON}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> JSON
            </button>
            <button
              onClick={exportAsMarkdown}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Markdown
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-indigo-500" /> Project Criteria
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Technology Stack</label>
                <input 
                  type="text" 
                  value={technology} 
                  onChange={e => setTechnology(e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" 
                  placeholder="e.g. React, Python, AWS" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Difficulty</label>
                <div className="grid grid-cols-3 gap-2">
                  {difficulties.map(diff => (
                    <button
                      key={diff}
                      onClick={() => setDifficulty(diff)}
                      className={`px-3 py-2 text-xs font-bold rounded-lg border transition-colors ${
                        difficulty === diff
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Domain / Industry</label>
                <input 
                  type="text" 
                  value={domain} 
                  onChange={e => setDomain(e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" 
                  placeholder="e.g. FinTech, Healthcare, Web3" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Career Goal</label>
                <input 
                  type="text" 
                  value={careerGoal} 
                  onChange={e => setCareerGoal(e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" 
                  placeholder="e.g. Full Stack Developer, Data Engineer" 
                />
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-colors shadow-sm flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
              >
                {isGenerating ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Generating Idea...</>
                ) : (
                  <><Lightbulb className="w-5 h-5" /> Generate Project</>
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
          {!data && !isGenerating ? (
             <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed p-8 text-center">
               <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mb-6">
                 <Lightbulb className="w-10 h-10 text-amber-500" />
               </div>
               <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Spark Your Next Big Idea</h3>
               <p className="text-slate-500 dark:text-slate-400 max-w-md">Provide your preferred tech stack and goals, and AI will generate a complete project blueprint.</p>
             </div>
          ) : isGenerating ? (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-center">
               <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-6" />
               <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Designing Architecture...</h3>
               <p className="text-slate-500 dark:text-slate-400">Crafting a portfolio-worthy project specification.</p>
             </div>
          ) : data ? (
            <div className="space-y-6">
              
              {/* Header Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-[100px] -mr-8 -mt-8 pointer-events-none"></div>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-4 pr-10">{data.projectName}</h2>
                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">{data.projectIdea}</p>
                
                <div className="flex flex-wrap gap-2">
                  {data.techStack.map((tech, i) => (
                    <span key={i} className="text-xs font-bold px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                      <Code2 className="w-3 h-3" /> {tech}
                    </span>
                  ))}
                </div>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Architecture & Deployment */}
                <div className="space-y-6">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"
                  >
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                      <Layers className="w-5 h-5 text-indigo-500" /> Architecture
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{data.architecture}</p>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"
                  >
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                      <Rocket className="w-5 h-5 text-rose-500" /> Deployment Guide
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{data.deploymentGuide}</p>
                  </motion.div>
                </div>

                {/* Timeline & Repo */}
                <div className="space-y-6">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"
                  >
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-emerald-500" /> Dev Timeline
                    </h3>
                    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent">
                      {data.timeline.map((phase, i) => (
                        <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                          <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 bg-emerald-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10" />
                          <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                            <h4 className="text-xs font-bold text-slate-800 dark:text-white mb-2">{phase.week}</h4>
                            <ul className="space-y-1">
                              {phase.tasks.map((task, j) => (
                                <li key={j} className="text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-1">
                                  <span className="text-emerald-500 mt-0.5">•</span> {task}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm text-slate-300"
                  >
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <FolderTree className="w-5 h-5 text-amber-400" /> GitHub Structure
                    </h3>
                    <pre className="text-xs font-mono leading-relaxed overflow-x-auto custom-scrollbar">
                      {data.githubStructure.join('\n')}
                    </pre>
                  </motion.div>
                </div>
              </div>

              {/* Resume & Portfolio */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"
              >
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" /> Marketing Materials
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <AlignLeft className="w-4 h-4" /> Resume Bullets
                    </h4>
                    <ul className="space-y-3">
                      {data.resumeDescription.map((bullet, i) => (
                        <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                          <span className="text-blue-500 font-bold">•</span> {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> Portfolio Description
                    </h4>
                    <div className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 whitespace-pre-wrap leading-relaxed">
                      {data.portfolioDescription}
                    </div>
                  </div>
                </div>
              </motion.div>

            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
