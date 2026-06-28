import { motion } from 'motion/react';
import { 
  Briefcase, GraduationCap, Award, FileText, 
  TrendingUp, Star, CheckCircle2, Clock, 
  ChevronRight, ExternalLink, Flame
} from 'lucide-react';
import { 
  ResponsiveContainer, RadialBarChart, RadialBar, 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell
} from 'recharts';

const skillsData = [
  { name: 'JavaScript', value: 85, fill: '#8b5cf6' },
  { name: 'React', value: 75, fill: '#6366f1' },
  { name: 'Node.js', value: 65, fill: '#3b82f6' },
  { name: 'Python', value: 50, fill: '#10b981' },
  { name: 'SQL', value: 70, fill: '#f59e0b' }
];

const learningProgressData = [
  { day: 'Mon', hours: 2 },
  { day: 'Tue', hours: 3.5 },
  { day: 'Wed', hours: 4 },
  { day: 'Thu', hours: 2.5 },
  { day: 'Fri', hours: 5 },
  { day: 'Sat', hours: 6 },
  { day: 'Sun', hours: 4.5 }
];

const mockJobs = [
  { title: 'Frontend Developer Intern', company: 'Google', match: 92, location: 'Remote', logo: 'G' },
  { title: 'Software Engineer I', company: 'Microsoft', match: 85, location: 'Seattle, WA', logo: 'M' },
  { title: 'React UI Developer', company: 'Netflix', match: 78, location: 'Remote', logo: 'N' }
];

const mockCertifications = [
  { title: 'AWS Cloud Practitioner', provider: 'Amazon Web Services', duration: '20 hours', popular: true },
  { title: 'Advanced React Patterns', provider: 'Frontend Masters', duration: '8 hours', popular: false },
  { title: 'Google Data Analytics', provider: 'Coursera', duration: '40 hours', popular: true }
];

export default function CareerDashboard() {
  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Career Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Track your readiness and prepare for your next big opportunity</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">
          <Briefcase className="w-4 h-4" />
          Update Profile
        </button>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 relative"
        >
          <div className="w-20 h-20 -ml-2 -my-2 relative shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart 
                cx="50%" cy="50%" 
                innerRadius="70%" outerRadius="100%" 
                barSize={6} 
                data={[{ name: 'Score', value: 85, fill: '#8b5cf6' }, { name: 'Max', value: 100, fill: '#f1f5f9' }]}
                startAngle={90} endAngle={-270}
              >
                <RadialBar dataKey="value" cornerRadius={10} background />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-black text-slate-800">85%</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Career Readiness</p>
            <h3 className="text-lg font-bold text-slate-800 leading-tight">Excellent</h3>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4"
        >
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <FileText className="w-7 h-7 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Resume Strength</p>
            <h3 className="text-2xl font-black text-slate-800">Strong</h3>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4"
        >
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <Briefcase className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Internship Matches</p>
            <h3 className="text-2xl font-black text-slate-800">12<span className="text-sm text-emerald-500 font-bold ml-2">New</span></h3>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 relative"
        >
          <div className="w-20 h-20 -ml-2 -my-2 relative shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart 
                cx="50%" cy="50%" 
                innerRadius="70%" outerRadius="100%" 
                barSize={6} 
                data={[{ name: 'Score', value: 72, fill: '#10b981' }, { name: 'Max', value: 100, fill: '#f1f5f9' }]}
                startAngle={90} endAngle={-270}
              >
                <RadialBar dataKey="value" cornerRadius={10} background />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-black text-slate-800">72%</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Job Readiness</p>
            <h3 className="text-lg font-bold text-slate-800 leading-tight">Improving</h3>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Skills Progress */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"
        >
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-500" />
            Skills Progress
          </h2>
          <div className="space-y-5">
            {skillsData.map((skill, i) => (
              <div key={i}>
                <div className="flex justify-between items-end mb-2">
                  <span className="font-bold text-slate-700">{skill.name}</span>
                  <span className="text-sm font-medium text-slate-500">{skill.value}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div className="h-2.5 rounded-full" style={{ width: `${skill.value}%`, backgroundColor: skill.fill }}></div>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-6 w-full py-2.5 bg-slate-50 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition-colors text-sm">
            Add New Skill
          </button>
        </motion.div>

        {/* Learning Progress Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="col-span-1 lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              Learning Progress
            </h2>
            <select className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
              <option>This Week</option>
              <option>Last Week</option>
            </select>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={learningProgressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
                  {
                    learningProgressData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 5 ? '#8b5cf6' : '#c4b5fd'} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Job Matches */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              Top Internship Matches
            </h2>
            <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700">View All</button>
          </div>
          
          <div className="space-y-4">
            {mockJobs.map((job, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-colors cursor-pointer group">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center font-black text-xl text-slate-700 group-hover:bg-white group-hover:text-indigo-600 transition-colors">
                  {job.logo}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800">{job.title}</h3>
                  <p className="text-sm text-slate-500">{job.company} • {job.location}</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md mb-1">{job.match}% Match</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recommended Certifications */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Award className="w-5 h-5 text-rose-500" />
              Recommended Certifications
            </h2>
          </div>
          
          <div className="space-y-4">
            {mockCertifications.map((cert, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all cursor-pointer">
                <div className="mt-1">
                  <CheckCircle2 className="w-5 h-5 text-slate-300" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-slate-800 leading-tight mb-1">{cert.title}</h3>
                    {cert.popular && (
                      <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">Popular</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mb-2">{cert.provider}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {cert.duration}</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 self-center" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Deadlines */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              Upcoming Deadlines
            </h2>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
              <h3 className="font-bold text-slate-800 mb-1">Google APM Application</h3>
              <p className="text-sm text-slate-600 mb-2">Submit resume and essay</p>
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-amber-600">In 2 days</span>
                <span className="text-slate-400">Oct 15</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-100 bg-white hover:border-slate-300 transition-colors relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
              <h3 className="font-bold text-slate-800 mb-1">Career Fair Registration</h3>
              <p className="text-sm text-slate-500 mb-2">Virtual Tech Meetup</p>
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-indigo-600">In 5 days</span>
                <span className="text-slate-400">Oct 18</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-100 bg-white hover:border-slate-300 transition-colors relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-slate-300"></div>
              <h3 className="font-bold text-slate-800 mb-1">Portfolio Update</h3>
              <p className="text-sm text-slate-500 mb-2">Add recent React projects</p>
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-500">Next week</span>
                <span className="text-slate-400">Oct 22</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
