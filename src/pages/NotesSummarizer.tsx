import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Image as ImageIcon, UploadCloud, FileType, Zap, Loader2, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

type OutputType = 'Summary' | 'Flashcards' | 'Mind Map' | 'Important Questions' | 'Revision Notes';

export default function NotesSummarizer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [outputType, setOutputType] = useState<OutputType>('Summary');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile || !filePreview) return;
    
    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileData: filePreview,
          mimeType: selectedFile.type,
          type: outputType
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate output');
      }

      const data = await response.json();
      setResult(data.text);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  const outputTypes: OutputType[] = ['Summary', 'Flashcards', 'Mind Map', 'Important Questions', 'Revision Notes'];

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-8 print:bg-white print:p-0 print:overflow-visible">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Notes Summarizer</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Transform your notes into actionable learning and career material</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">
        {/* Left Column: Input (Hidden on Print) */}
        <div className="lg:col-span-5 flex flex-col gap-6 print:hidden">
          {/* Upload Box */}
          <div 
            className="bg-white dark:bg-slate-900 rounded-3xl p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*,application/pdf"
              onChange={handleFileSelect}
            />
            
            {!selectedFile ? (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Upload Notes</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[200px] mb-4">
                  Drag and drop your PDF, Word, PPT, Image, or handwritten notes here
                </p>
                <span className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-bold">
                  Browse Files
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">{selectedFile.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setFilePreview(null); }}
                  className="px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm font-bold hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                >
                  Remove File
                </button>
              </div>
            )}
          </div>

          {/* Options */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <FileType className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Generation Type
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {outputTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setOutputType(type)}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all text-left flex items-center justify-between ${
                    outputType === type 
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 shadow-sm' 
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {type}
                  {outputType === type && <CheckCircle2 className="w-4 h-4" />}
                </button>
              ))}
            </div>

            <button
              onClick={handleGenerate}
              disabled={!selectedFile || isGenerating}
              className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-indigo-500/40 transition-all disabled:opacity-50 disabled:hover:shadow-none"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Extracting & Generating...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Generate {outputType}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Output */}
        <div className="lg:col-span-7 flex flex-col h-full print:block">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex-1 flex flex-col min-h-[500px] print:border-none print:shadow-none">
            
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 rounded-t-3xl print:hidden">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Generated {outputType}
              </h3>
              <button
                onClick={handleExportPDF}
                disabled={!result}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <Download className="w-4 h-4" />
                Export PDF
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1 print:p-0">
              {error && (
                <div className="p-4 mb-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/30 flex gap-3 items-start print:hidden">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              {result ? (
                <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:text-slate-800 dark:prose-headings:text-white prose-a:text-indigo-600 dark:prose-a:text-indigo-400">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-60 print:hidden">
                  <FileText className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Your generated content will appear here</p>
                  <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 max-w-sm">Upload your notes and select an output type to get started.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
