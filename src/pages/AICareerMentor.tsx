import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Image as ImageIcon, FileText, Mic, Bot, User as UserIcon, Sparkles, X, Plus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  fileData?: string;
  mimeType?: string;
}

const suggestedQuestions = [
  "Review my resume",
  "Help me prepare for an interview",
  "Suggest coding projects",
  "Create a learning roadmap",
  "Give me internship advice",
  "Provide scholarship advice"
];

export default function AICareerMentor() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Speech Recognition Setup
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  if (recognition) {
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + (prev ? ' ' : '') + transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  }

  const toggleListening = () => {
    if (!recognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  useEffect(() => {
    if (user) {
      const docRef = doc(db, 'users', user.uid, 'aiCareerMentor', 'history');
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.messages) {
            setMessages(data.messages);
          }
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveHistory = async (newMessages: Message[]) => {
    if (!user) return;
    try {
      const cleanMessages = newMessages.map(msg => {
        const cleanMsg = { ...msg };
        if (cleanMsg.fileData === undefined) delete cleanMsg.fileData;
        if (cleanMsg.mimeType === undefined) delete cleanMsg.mimeType;
        return cleanMsg;
      });
      await setDoc(doc(db, 'users', user.uid, 'aiCareerMentor', 'history'), {
        messages: cleanMessages
      }, { merge: true });
    } catch (err) {
      console.error("Failed to save chat history", err);
    }
  };

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
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  const handleSend = async (text: string = input) => {
    if ((!text.trim() && !selectedFile) || isLoading) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    if (filePreview) {
      newMessage.fileData = filePreview;
    }
    if (selectedFile?.type) {
      newMessage.mimeType = selectedFile.type;
    }

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInput('');
    setSelectedFile(null);
    setFilePreview(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: messages.map(m => ({ role: m.role, content: m.content })),
          message: text,
          fileData: newMessage.fileData,
          mimeType: newMessage.mimeType,
          stream: true
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch response');
      if (!response.body) throw new Error('No response body');
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';
      
      const assistantMessageId = (Date.now() + 1).toString();
      
      setMessages([...updatedMessages, {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString()
      }]);
      setIsLoading(false); // Stop loading animation since we start receiving

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        assistantText += decoder.decode(value, { stream: true });
        
        setMessages(prev => {
          const newMsg = [...prev];
          const lastMsg = newMsg[newMsg.length - 1];
          if (lastMsg && lastMsg.id === assistantMessageId) {
            lastMsg.content = assistantText;
          }
          return newMsg;
        });
      }

      // Final save to history after stream is done
      const finalMessages = [...updatedMessages, {
        id: assistantMessageId,
        role: 'assistant' as const,
        content: assistantText,
        timestamp: new Date().toISOString()
      }];
      saveHistory(finalMessages);
    } catch (error) {
      console.error(error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: 'Sorry, I encountered an error while processing your request.',
        timestamp: new Date().toISOString()
      };
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      saveHistory(finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">AI Career Mentor</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Ask questions, upload your resume, and get career guidance with AI.</p>
        </div>
        <button 
          onClick={() => { setMessages([]); saveHistory([]); }}
          className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden relative">
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6">
                <Bot className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">How can I help your career today?</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8">I can provide career guidance, review resumes, suggest projects, and help you land internships.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q)}
                    className="p-3 text-left border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400'}`}>
                    {msg.role === 'user' ? <UserIcon className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  <div className={`max-w-[80%] md:max-w-[70%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-200 dark:shadow-indigo-900/20' : 'bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-tl-none text-slate-800 dark:text-slate-200'}`}>
                    {msg.fileData && (
                       <div className="mb-3">
                         {msg.mimeType?.startsWith('image/') ? (
                           <img src={msg.fileData} alt="Uploaded file" className="max-h-48 rounded-lg object-contain bg-black/10 dark:bg-white/10" />
                         ) : (
                           <div className="flex items-center gap-2 p-2 bg-black/10 dark:bg-white/10 rounded-lg">
                             <FileText className="w-5 h-5" />
                             <span className="text-sm font-medium">Document attached</span>
                           </div>
                         )}
                       </div>
                    )}
                    <div className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert' : 'dark:prose-invert'}`}>
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <AnimatePresence>
            {filePreview && (
              <motion.div 
                initial={{ opacity: 0, y: 10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: 10, height: 0 }}
                className="mb-4 relative inline-block"
              >
                <div className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center gap-3 pr-10">
                  {selectedFile?.type.startsWith('image/') ? (
                    <img src={filePreview} alt="Preview" className="h-12 w-12 object-cover rounded-lg" />
                  ) : (
                    <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[150px]">{selectedFile?.name}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{(selectedFile?.size || 0) / 1000} KB</span>
                  </div>
                </div>
                <button 
                  onClick={removeFile}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-900/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex items-end gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 focus-within:border-indigo-300 dark:focus-within:border-indigo-700 focus-within:ring-4 focus-within:ring-indigo-50 dark:focus-within:ring-indigo-900/20 transition-all">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*,application/pdf"
              onChange={handleFileSelect}
            />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-colors shrink-0"
              title="Upload Image or PDF"
            >
              <Plus className="w-5 h-5" />
            </button>
            
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask anything..."
              className="w-full max-h-32 min-h-[44px] bg-transparent border-none outline-none resize-none py-3 px-2 text-sm text-slate-900 dark:text-white"
              rows={1}
            />
            
            <button 
              onClick={toggleListening}
              className={`p-3 rounded-xl transition-colors shrink-0 ${isListening ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 animate-pulse' : 'text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'}`}
              title={isListening ? "Stop listening" : "Voice Input"}
            >
              <Mic className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => handleSend()}
              disabled={(!input.trim() && !selectedFile) || isLoading}
              className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:hover:bg-indigo-600 shrink-0 shadow-sm shadow-indigo-500/20"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
