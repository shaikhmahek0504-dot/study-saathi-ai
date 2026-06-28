import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'motion/react';
import { Sparkles, Brain, Target, Zap, Clock, Shield, CheckCircle2, ChevronRight, Menu, X, ArrowRight, Play, Star, Users, Award, BookOpen, Quote } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-200 selection:text-indigo-900 dark:selection:bg-indigo-900 dark:selection:text-indigo-200 overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 py-2' : 'bg-transparent py-4'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-2xl tracking-tight text-slate-800 dark:text-white">
                StudySaathi AI
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('features')} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Features</button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">How it Works</button>
              <button onClick={() => scrollToSection('testimonials')} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Testimonials</button>
              <button onClick={() => scrollToSection('faq')} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">FAQ</button>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link to="/login" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Log in</Link>
              <Link to="/signup" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-xl hover:shadow-indigo-500/30 active:scale-95 transform">
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-6 space-y-4 shadow-xl"
          >
            <button onClick={() => scrollToSection('features')} className="block w-full text-left text-base font-medium text-slate-700 dark:text-slate-200">Features</button>
            <button onClick={() => scrollToSection('how-it-works')} className="block w-full text-left text-base font-medium text-slate-700 dark:text-slate-200">How it Works</button>
            <button onClick={() => scrollToSection('testimonials')} className="block w-full text-left text-base font-medium text-slate-700 dark:text-slate-200">Testimonials</button>
            <button onClick={() => scrollToSection('faq')} className="block w-full text-left text-base font-medium text-slate-700 dark:text-slate-200">FAQ</button>
            <div className="pt-4 flex flex-col gap-3">
              <Link to="/login" className="w-full px-5 py-3 text-center border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Log in</Link>
              <Link to="/signup" className="w-full px-5 py-3 text-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-indigo-600/20" onClick={() => setIsMobileMenuOpen(false)}>Get Started</Link>
            </div>
          </motion.div>
        )}
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
          {/* Background Gradients */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 pointer-events-none">
            <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-indigo-400/20 dark:bg-indigo-600/20 rounded-full blur-[120px]"></div>
            <div className="absolute top-40 right-10 w-[400px] h-[400px] bg-violet-400/20 dark:bg-violet-600/20 rounded-full blur-[120px]"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-sm font-semibold mb-8 backdrop-blur-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>Gemini 2.5 Flash Integration Now Live</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-[1.1]"
              >
                Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">AI-Powered</span><br /> Learning & Career Companion
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed font-light"
              >
                Learn Smarter. Build Skills. Launch Your Career. StudySaathi AI organizes your academic life, accelerates skill building, and provides instant guidance when you need it.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Link to="/signup" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-lg font-bold transition-all shadow-lg hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2">
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-lg font-bold hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2">
                  <Play className="w-5 h-5 text-indigo-600 dark:text-indigo-400 fill-indigo-600 dark:fill-indigo-400" />
                  Try AI Tutor
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-12 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { icon: Users, label: "Active Learners", value: "50k+" },
                { icon: Brain, label: "Skills Mastered", value: "1.2M+" },
                { icon: Award, label: "Career Goals Hit", value: "84%" },
                { icon: Clock, label: "Learning Hours Saved", value: "300k+" },
              ].map((stat, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="text-center flex flex-col items-center"
                >
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-indigo-100 dark:border-indigo-800/50">
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">{stat.value}</div>
                  <div className="text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-[#F8FAFC] dark:bg-slate-950 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-indigo-600 dark:text-indigo-400 font-bold tracking-wider uppercase mb-3 text-sm">Core Features</h2>
              <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6">Everything you need to excel</h3>
              <p className="text-lg text-slate-600 dark:text-slate-400 font-light">StudySaathi AI combines powerful organization tools with intelligent tutoring to give you an unfair advantage in your academics and career.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: Brain, title: "Gemini AI Tutor & Coach", desc: "Get instant, step-by-step explanations for complex academic problems and career skill building.", color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-100 dark:bg-violet-500/10", border: "group-hover:border-violet-500" },
                { icon: Target, title: "Smart Planner", desc: "Automatically schedule your study sessions and career development tasks based on deadlines.", color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-100 dark:bg-indigo-500/10", border: "group-hover:border-indigo-500" },
                { icon: Zap, title: "Performance & Skill Tracking", desc: "Visualize your progress with detailed analytics and identify areas to upskill.", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-500/10", border: "group-hover:border-blue-500" },
                { icon: Clock, title: "Focus Mode", desc: "Block distractions and track your deep work sessions with the built-in Pomodoro timer.", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-500/10", border: "group-hover:border-emerald-500" },
                { icon: Shield, title: "Cloud Sync", desc: "Your notes, plans, and career portfolio are securely synced across all your devices in real-time.", color: "text-slate-600 dark:text-slate-300", bg: "bg-slate-200 dark:bg-slate-700/50", border: "group-hover:border-slate-500" },
                { icon: BookOpen, title: "Notes & Resume Summarizer", desc: "Instantly generate concise summaries, flashcards, or professional resume bullets from your materials.", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-500/10", border: "group-hover:border-amber-500" },
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`group bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 hover:shadow-2xl hover:shadow-indigo-500/5 dark:hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-300 ${feature.border}`}
                >
                  <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300 shadow-sm`}>
                    <feature.icon className={`w-7 h-7 ${feature.color}`} />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h4>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-light">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 bg-white dark:bg-slate-900 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-50/50 dark:bg-indigo-900/10 transform skew-x-12 translate-x-32 hidden lg:block rounded-l-3xl"></div>
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-indigo-600 dark:text-indigo-400 font-bold tracking-wider uppercase mb-3 text-sm">How it works</h2>
              <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 leading-[1.2]">Learn faster with visual step-by-step guidance</h3>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-12 font-light max-w-2xl mx-auto">
                Stuck on a tricky problem or need career advice? Just snap a photo or type it in. Our Gemini-powered AI breaks it down into understandable, bite-sized steps so you actually learn the concept, build the skill, and advance.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-8 text-left">
                {[
                  "Upload a photo or enter your prompt",
                  "AI analyzes and breaks down the concept",
                  "Get step-by-step conversational guidance",
                  "Save insights to your notes for review"
                ].map((step, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 + 0.3 }}
                    className="flex items-start gap-4 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50"
                  >
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800">
                      {i + 1}
                    </div>
                    <span className="text-slate-800 dark:text-slate-200 font-medium text-lg pt-1.5">{step}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-24 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-indigo-600 dark:text-indigo-400 font-bold tracking-wider uppercase mb-3 text-sm">Testimonials</h2>
              <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">Loved by learners & professionals worldwide</h3>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { quote: "The AI Tutor is like having a professor and a career coach on call 24/7. It helped me pass Calc II and prep for interviews.", author: "Sarah Jenkins", role: "Engineering Student", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
                { quote: "I've tried so many planners, but StudySaathi actually works because it adapts to my chaotic schedule and helps me track my tech skills.", author: "Michael Chen", role: "Computer Science Major", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael" },
                { quote: "The way it breaks down complex career roadmaps into simple steps completely changed how I approach my future.", author: "Priya Sharma", role: "Recent Graduate", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya" }
              ].map((testimonial, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none relative hover:-translate-y-2 transition-transform duration-300"
                >
                  <Quote className="w-10 h-10 text-indigo-100 dark:text-indigo-900/30 absolute top-6 right-6" />
                  <div className="flex gap-1 mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 relative z-10 font-medium mb-8 text-lg leading-relaxed">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-4">
                    <img src={testimonial.avatar} alt={testimonial.author} className="w-12 h-12 rounded-full border-2 border-indigo-100 dark:border-indigo-900" loading="lazy" />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{testimonial.author}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">{testimonial.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-24 bg-white dark:bg-slate-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-indigo-600 dark:text-indigo-400 font-bold tracking-wider uppercase mb-3 text-sm text-center">Support</h2>
            <h3 className="text-3xl md:text-5xl font-extrabold text-center text-slate-900 dark:text-white mb-16">Frequently Asked Questions</h3>
            <div className="space-y-6">
              {[
                { q: "Is StudySaathi AI free to use?", a: "Yes, we offer a generous free tier that includes the smart planner, basic analytics, and limited AI tutor queries every month. For heavy users, we offer a Pro plan." },
                { q: "What subjects can the AI Tutor help with?", a: "The AI is powered by Gemini 2.5 Flash and can help with Mathematics, Sciences (Physics, Chemistry, Biology), History, Literature, Computer Science, and many more." },
                { q: "Can I use it on my mobile device?", a: "Absolutely! StudySaathi is fully responsive as a Progressive Web App (PWA) and works perfectly on mobile browsers, making it easy to snap photos of homework on the go." },
                { q: "Is my data secure?", a: "Yes. Your data is encrypted in transit and at rest using industry-standard security protocols backed by Google Cloud." },
              ].map((faq, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="bg-[#F8FAFC] dark:bg-slate-800/50 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-700/50"
                >
                  <h4 className="font-bold text-xl text-slate-900 dark:text-white mb-3 flex items-start gap-3">
                    <span className="text-indigo-600 dark:text-indigo-400 shrink-0">Q.</span> {faq.q}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 font-light leading-relaxed ml-7">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-slate-900 dark:bg-black relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-violet-700/20 pointer-events-none"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"></div>
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">Ready to ace your next exam and land your dream job?</h2>
            <p className="text-indigo-200 text-xl md:text-2xl mb-10 font-light max-w-2xl mx-auto">Join thousands of users who are learning smarter, building skills, and launching their careers.</p>
            <Link to="/signup" className="inline-flex px-10 py-5 bg-white text-indigo-700 rounded-2xl text-xl font-bold hover:bg-indigo-50 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] hover:-translate-y-1 active:scale-95">
              Start Learning for Free
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-2xl text-white tracking-tight">StudySaathi AI</span>
              </div>
              <p className="text-slate-400 text-base max-w-sm mb-6 leading-relaxed">
                Your intelligent companion for a better academic life and career journey. Built with modern AI to help you achieve your goals.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 text-lg tracking-wide">Product</h4>
              <ul className="space-y-4">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-indigo-400 transition-colors">Features</button></li>
                <li><button onClick={() => scrollToSection('how-it-works')} className="hover:text-indigo-400 transition-colors">How it Works</button></li>
                <li><Link to="/login" className="hover:text-indigo-400 transition-colors">AI Tutor</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 text-lg tracking-wide">Company</h4>
              <ul className="space-y-4">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">© {new Date().getFullYear()} StudySaathi AI. Built with Google Gemini.</p>
            <div className="flex gap-4">
               <a href="#" aria-label="Twitter" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
               </a>
               <a href="#" aria-label="GitHub" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
               </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
