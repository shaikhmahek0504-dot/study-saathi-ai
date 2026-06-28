import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, MicOff, Send, User as UserIcon, Bot, 
  Settings, Loader2, PlayCircle, StopCircle, 
  CheckCircle2, AlertTriangle, TrendingUp, Sparkles,
  Volume2, VolumeX, Code2, Users, Briefcase
} from 'lucide-react';

interface Evaluation {
  communicationScore: number;
  confidenceScore: number;
  grammarScore: number;
  improvementTips: string[];
  overallFeedback: string;
}

interface Message {
  id: string;
  role: 'ai' | 'user';
  content: string;
  evaluation?: Evaluation;
}

export default function InterviewCoach() {
  const [isStarted, setIsStarted] = useState(false);
  const [jobRole, setJobRole] = useState('Frontend Developer');
  const [interviewType, setInterviewType] = useState('Technical');
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Speech Recognition Setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setCurrentInput(prev => prev + ' ' + finalTranscript.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setCurrentInput('');
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const speakText = (text: string) => {
    if (!isVoiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // Stop any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    // Optional: pick a specific voice here
    window.speechSynthesis.speak(utterance);
  };

  const startInterview = async () => {
    if (!jobRole) return;
    setIsStarted(true);
    setIsProcessing(true);
    setMessages([]);

    try {
      const res = await fetch('/api/interview/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: jobRole, type: interviewType, isStart: true })
      });

      if (!res.ok) throw new Error('Failed to start interview');
      const data = await res.json();
      
      const newMsg: Message = {
        id: Date.now().toString(),
        role: 'ai',
        content: data.nextQuestion
      };
      
      setMessages([newMsg]);
      speakText(data.nextQuestion);
    } catch (err) {
      console.error(err);
      setIsStarted(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const submitAnswer = async () => {
    if (!currentInput.trim() || isProcessing) return;
    
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }

    window.speechSynthesis.cancel();

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: currentInput.trim()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setCurrentInput('');
    setIsProcessing(true);

    try {
      // Find the last AI question
      const lastAiMsg = [...messages].reverse().find(m => m.role === 'ai');
      
      const res = await fetch('/api/interview/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          role: jobRole, 
          type: interviewType, 
          currentQuestion: lastAiMsg?.content || '',
          currentAnswer: userMsg.content,
          isStart: false 
        })
      });

      if (!res.ok) throw new Error('Failed to submit answer');
      const data = await res.json();
      
      // Update user message with evaluation
      setMessages(prev => prev.map(msg => 
        msg.id === userMsg.id ? { ...msg, evaluation: data.evaluation } : msg
      ));

      // Add next AI question
      const nextAiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: data.nextQuestion
      };
      
      setMessages(prev => [...prev, nextAiMsg]);
      speakText(data.nextQuestion);
      
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitAnswer();
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-rose-500';
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 flex flex-col h-[calc(100vh-100px)]">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <Mic className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            AI Interview Coach
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Practice mock interviews and get real-time feedback.</p>
        </div>
        
        {isStarted && (
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
              className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              title={isVoiceEnabled ? "Mute AI Voice" : "Enable AI Voice"}
            >
              {isVoiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => {
                setIsStarted(false);
                setMessages([]);
                window.speechSynthesis.cancel();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl text-sm font-bold hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
            >
              <StopCircle className="w-4 h-4" /> End Interview
            </button>
          </div>
        )}
      </div>

      {!isStarted ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-indigo-500/5 max-w-lg w-full">
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <Bot className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-white mb-2">Setup Mock Interview</h2>
            <p className="text-center text-slate-500 dark:text-slate-400 mb-8 text-sm">Select your target role and interview type to begin.</p>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Target Job Role</label>
                <input 
                  type="text" 
                  value={jobRole} 
                  onChange={e => setJobRole(e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" 
                  placeholder="e.g. Frontend Developer" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Interview Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {['Behavioral', 'Technical', 'Coding'].map(type => (
                    <button
                      key={type}
                      onClick={() => setInterviewType(type)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                        interviewType === type 
                          ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' 
                          : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-200 dark:hover:border-slate-700'
                      }`}
                    >
                      {type === 'Behavioral' ? <Users className="w-5 h-5 mb-1" /> :
                       type === 'Technical' ? <Briefcase className="w-5 h-5 mb-1" /> :
                       <Code2 className="w-5 h-5 mb-1" />}
                      <span className="text-xs font-bold">{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={startInterview}
                disabled={isProcessing}
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Preparing...</>
                ) : (
                  <><PlayCircle className="w-5 h-5" /> Start Interview</>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-0">
          
          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            {messages.map((msg, index) => (
              <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                  msg.role === 'ai' 
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}>
                  {msg.role === 'ai' ? <Bot className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
                </div>

                {/* Message Content & Evaluation */}
                <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[80%]`}>
                  <div className={`p-4 rounded-2xl ${
                    msg.role === 'ai'
                      ? 'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-slate-800 dark:text-slate-200 rounded-tl-sm'
                      : 'bg-indigo-600 text-white rounded-tr-sm shadow-md'
                  }`}>
                    <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">{msg.content}</p>
                  </div>

                  {/* Feedback Card (only for user messages that have been evaluated) */}
                  {msg.evaluation && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-lg shadow-slate-200/20 dark:shadow-none"
                    >
                      <h4 className="flex items-center gap-2 font-bold text-slate-800 dark:text-white mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <Sparkles className="w-5 h-5 text-indigo-500" /> AI Feedback
                      </h4>
                      
                      <div className="grid grid-cols-3 gap-4 mb-5">
                        <div className="text-center p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                           <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Communication</div>
                           <div className={`text-xl font-black ${getScoreColor(msg.evaluation.communicationScore)}`}>
                             {msg.evaluation.communicationScore}<span className="text-sm font-medium text-slate-400">/100</span>
                           </div>
                        </div>
                        <div className="text-center p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                           <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Confidence</div>
                           <div className={`text-xl font-black ${getScoreColor(msg.evaluation.confidenceScore)}`}>
                             {msg.evaluation.confidenceScore}<span className="text-sm font-medium text-slate-400">/100</span>
                           </div>
                        </div>
                        <div className="text-center p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                           <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Grammar</div>
                           <div className={`text-xl font-black ${getScoreColor(msg.evaluation.grammarScore)}`}>
                             {msg.evaluation.grammarScore}<span className="text-sm font-medium text-slate-400">/100</span>
                           </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Overall Assessment</div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-indigo-50/50 dark:bg-indigo-900/10 p-3 rounded-xl border border-indigo-100/50 dark:border-indigo-900/30">
                          {msg.evaluation.overallFeedback}
                        </p>
                      </div>

                      <div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Areas for Improvement</div>
                        <ul className="space-y-2">
                          {msg.evaluation.improvementTips.map((tip, i) => (
                            <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                              <TrendingUp className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </div>

              </div>
            ))}
            
            {isProcessing && (
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-4 rounded-tl-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0">
            <div className="max-w-4xl mx-auto relative flex items-end gap-3">
              <button 
                onClick={toggleRecording}
                className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all shrink-0 ${
                  isRecording 
                    ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800 animate-pulse' 
                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              
              <textarea
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isRecording ? "Listening..." : "Type your answer or use the microphone..."}
                className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl px-4 py-3 min-h-[50px] max-h-[150px] resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm custom-scrollbar"
                disabled={isProcessing}
                rows={Math.min(4, currentInput.split('\n').length || 1)}
              />
              
              <button
                onClick={submitAnswer}
                disabled={!currentInput.trim() || isProcessing}
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
