import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-12">
          <FileQuestion className="w-12 h-12 transform -rotate-12" />
        </div>
        <h1 className="text-5xl font-black text-slate-800 dark:text-slate-100 mb-4 tracking-tight">404</h1>
        <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-2">Page not found</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
          The page you're looking for doesn't exist or has been moved to another location.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-indigo-600/20"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>
      </motion.div>
    </div>
  );
}
