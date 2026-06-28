import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrainCircuit, UploadCloud, CheckCircle2, AlertCircle, Loader2, Target, Award, Trophy, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, addDoc, query, orderBy, getDocs, limit } from 'firebase/firestore';
import ReactMarkdown from 'react-markdown';

type QuestionType = 'mcq' | 'true_false' | 'fill_blank' | 'short_answer';

interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
  topic: string;
}

interface Quiz {
  questions: Question[];
}

export default function QuizGenerator() {
  const { user } = useAuth();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [difficulty, setDifficulty] = useState('Medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>(['mcq', 'true_false']);

  const [isGenerating, setIsGenerating] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Active Quiz State
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  
  // Results
  const [score, setScore] = useState(0);
  const [weakTopics, setWeakTopics] = useState<string[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const q = query(collection(db, 'leaderboard'), orderBy('score', 'desc'), limit(10));
      const querySnapshot = await getDocs(q);
      const data: any[] = [];
      querySnapshot.forEach((doc) => {
        data.push(doc.data());
      });
      setLeaderboard(data);
    } catch (err) {
      console.error("Failed to fetch leaderboard", err);
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
  };

  const toggleType = (type: QuestionType) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile || !filePreview || selectedTypes.length === 0) return;
    
    setIsGenerating(true);
    setError(null);
    setQuiz(null);
    setIsFinished(false);
    setCurrentQuestionIdx(0);
    setUserAnswers({});

    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileData: filePreview,
          mimeType: selectedFile.type,
          difficulty,
          questionTypes: selectedTypes,
          questionCount
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate quiz');
      }

      const data = await response.json();
      
      if (!data.questions || data.questions.length === 0) {
          throw new Error('No questions generated. Try uploading more detailed notes.');
      }
      
      setQuiz(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerChange = (qId: string, answer: string) => {
    setUserAnswers({ ...userAnswers, [qId]: answer });
  };

  const nextQuestion = () => {
    if (quiz && currentQuestionIdx < quiz.questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(currentQuestionIdx - 1);
    }
  };

  const finishQuiz = async () => {
    if (!quiz) return;
    
    let correctCount = 0;
    const wrongTopics: string[] = [];

    quiz.questions.forEach(q => {
      const userAns = (userAnswers[q.id] || '').trim().toLowerCase();
      const actualAns = q.answer.trim().toLowerCase();
      
      if (q.type === 'short_answer' || q.type === 'fill_blank') {
          // simple includes check for short answer/fill blank
          if (actualAns.includes(userAns) && userAns.length > 2 || userAns === actualAns) {
              correctCount++;
          } else {
              wrongTopics.push(q.topic);
          }
      } else {
          // exact match for MCQ/True False
          if (userAns === actualAns) {
              correctCount++;
          } else {
              wrongTopics.push(q.topic);
          }
      }
    });

    const finalScore = Math.round((correctCount / quiz.questions.length) * 100);
    setScore(finalScore);
    
    // Calculate weak topics (topics that appeared most in wrong answers)
    const topicCounts = wrongTopics.reduce((acc, topic) => {
        acc[topic] = (acc[topic] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    
    const sortedWeakTopics = Object.entries(topicCounts)
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0])
        .slice(0, 3);
        
    setWeakTopics(sortedWeakTopics);
    setIsFinished(true);

    // Save to leaderboard
    if (user) {
      try {
        await addDoc(collection(db, 'leaderboard'), {
            userId: user.uid,
            name: user.email?.split('@')[0] || 'Anonymous',
            score: finalScore,
            date: new Date().toISOString(),
            topic: quiz.questions[0]?.topic || 'General'
        });
        fetchLeaderboard();
      } catch (err) {
         console.error('Error saving to leaderboard', err);
      }
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quiz Generator</h1>
          <p className="text-sm text-slate-500">Test your knowledge automatically from your notes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Generator Setup */}
        {!quiz && (
          <div className="lg:col-span-8 flex flex-col gap-6">
            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex gap-3 items-center">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}
            
            <div 
              className="bg-white rounded-3xl p-8 border-2 border-dashed border-slate-200 text-center hover:bg-slate-50 transition-colors cursor-pointer group"
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
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Upload Notes for Quiz</h3>
                  <p className="text-sm text-slate-500 max-w-[200px] mb-4">
                    PDF, Image, or text files supported
                  </p>
                  <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-bold">
                    Browse Files
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">{selectedFile.name}</h3>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setFilePreview(null); }}
                    className="mt-4 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors"
                  >
                    Remove File
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <h3 className="font-bold text-slate-800 mb-3">Difficulty</h3>
                  <select 
                    value={difficulty} 
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium outline-none focus:border-indigo-500"
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
               </div>
               <div>
                  <h3 className="font-bold text-slate-800 mb-3">Question Count</h3>
                  <input 
                    type="number" 
                    min="1" max="20" 
                    value={questionCount} 
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium outline-none focus:border-indigo-500"
                  />
               </div>
               
               <div className="md:col-span-2">
                  <h3 className="font-bold text-slate-800 mb-3">Question Types</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { id: 'mcq', label: 'Multiple Choice' },
                      { id: 'true_false', label: 'True / False' },
                      { id: 'fill_blank', label: 'Fill Blanks' },
                      { id: 'short_answer', label: 'Short Answer' }
                    ].map(type => (
                      <button
                        key={type.id}
                        onClick={() => toggleType(type.id as QuestionType)}
                        className={`p-3 rounded-xl border text-sm font-medium transition-all text-center ${
                          selectedTypes.includes(type.id as QuestionType) 
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
               </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!selectedFile || isGenerating || selectedTypes.length === 0}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-indigo-500/40 transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Quiz from Notes...
                </>
              ) : (
                <>
                  <BrainCircuit className="w-5 h-5" />
                  Generate Quiz
                </>
              )}
            </button>
          </div>
        )}

        {/* Active Quiz Area */}
        {quiz && !isFinished && (
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                  Question {currentQuestionIdx + 1} of {quiz.questions.length}
                </span>
                <span className="text-sm font-medium text-slate-500 capitalize">
                  {quiz.questions[currentQuestionIdx].type.replace('_', ' ')}
                </span>
              </div>
              
              <h2 className="text-xl font-bold text-slate-800 mb-6">
                {quiz.questions[currentQuestionIdx].question}
              </h2>

              <div className="space-y-3 mb-8">
                {(quiz.questions[currentQuestionIdx].type === 'mcq' || quiz.questions[currentQuestionIdx].type === 'true_false') && 
                  quiz.questions[currentQuestionIdx].options?.map((opt, i) => (
                  <label key={i} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    userAnswers[quiz.questions[currentQuestionIdx].id] === opt
                      ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <input 
                      type="radio" 
                      name={quiz.questions[currentQuestionIdx].id}
                      value={opt}
                      checked={userAnswers[quiz.questions[currentQuestionIdx].id] === opt}
                      onChange={(e) => handleAnswerChange(quiz.questions[currentQuestionIdx].id, e.target.value)}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span className="font-medium text-slate-700">{opt}</span>
                  </label>
                ))}

                {(quiz.questions[currentQuestionIdx].type === 'short_answer' || quiz.questions[currentQuestionIdx].type === 'fill_blank') && (
                  <textarea 
                    value={userAnswers[quiz.questions[currentQuestionIdx].id] || ''}
                    onChange={(e) => handleAnswerChange(quiz.questions[currentQuestionIdx].id, e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 min-h-[100px] outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  />
                )}
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                <button 
                  onClick={prevQuestion}
                  disabled={currentQuestionIdx === 0}
                  className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-all"
                >
                  Previous
                </button>
                
                {currentQuestionIdx === quiz.questions.length - 1 ? (
                   <button 
                    onClick={finishQuiz}
                    className="px-6 py-2.5 rounded-xl font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/20"
                  >
                    Finish & Score
                  </button>
                ) : (
                  <button 
                    onClick={nextQuestion}
                    className="px-6 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all flex items-center gap-2"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Results Area */}
        {quiz && isFinished && (
           <div className="lg:col-span-8 flex flex-col gap-6">
             <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center">
                <div className="w-24 h-24 mx-auto bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                  <Award className="w-12 h-12 text-indigo-600" />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Quiz Completed!</h2>
                <p className="text-slate-500 mb-8">Here is how you performed on this material.</p>
                
                <div className="flex justify-center gap-8 mb-8">
                  <div className="text-center">
                    <span className="block text-4xl font-black text-indigo-600 mb-1">{score}%</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Final Score</span>
                  </div>
                </div>

                {weakTopics.length > 0 && (
                  <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 text-left">
                    <h3 className="font-bold text-rose-800 flex items-center gap-2 mb-3">
                      <Target className="w-5 h-5" /> Focus Areas for Revision
                    </h3>
                    <ul className="space-y-2">
                      {weakTopics.map((topic, i) => (
                        <li key={i} className="flex gap-2 items-start text-sm text-rose-700 font-medium">
                          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0"></span>
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="mt-8 flex gap-4 justify-center">
                  <button 
                    onClick={() => { setQuiz(null); setIsFinished(false); }}
                    className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all"
                  >
                    Generate New Quiz
                  </button>
                </div>
             </div>

             {/* Answers Review */}
             <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                <h3 className="font-bold text-lg text-slate-800 mb-6">Answers Review</h3>
                <div className="space-y-6">
                  {quiz.questions.map((q, i) => {
                    const userAns = (userAnswers[q.id] || '').trim().toLowerCase();
                    const actualAns = q.answer.trim().toLowerCase();
                    const isCorrect = q.type === 'short_answer' || q.type === 'fill_blank' 
                      ? (actualAns.includes(userAns) && userAns.length > 2 || userAns === actualAns)
                      : userAns === actualAns;

                    return (
                      <div key={i} className={`p-4 rounded-xl border ${isCorrect ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                         <p className="font-bold text-slate-800 mb-3">{i + 1}. {q.question}</p>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                           <div>
                             <span className="block text-xs font-bold text-slate-500 mb-1">Your Answer</span>
                             <p className={`font-medium ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                               {userAnswers[q.id] || <span className="italic opacity-50">No answer provided</span>}
                             </p>
                           </div>
                           <div>
                             <span className="block text-xs font-bold text-slate-500 mb-1">Correct Answer</span>
                             <p className="font-medium text-slate-700">{q.answer}</p>
                           </div>
                         </div>
                         
                         <div className="mt-4 pt-4 border-t border-black/5">
                           <span className="block text-xs font-bold text-slate-500 mb-1">Explanation</span>
                           <p className="text-sm text-slate-600">{q.explanation}</p>
                         </div>
                      </div>
                    );
                  })}
                </div>
             </div>
           </div>
        )}

        {/* Right Column: Leaderboard */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm sticky top-6">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Global Leaderboard
            </h3>
            
            <div className="space-y-4">
              {leaderboard.length === 0 ? (
                 <p className="text-sm text-slate-500 text-center py-4">No scores yet. Be the first!</p>
              ) : (
                leaderboard.map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0
                      ${idx === 0 ? 'bg-amber-100 text-amber-600' : 
                        idx === 1 ? 'bg-slate-200 text-slate-600' : 
                        idx === 2 ? 'bg-orange-100 text-orange-600' : 
                        'bg-slate-50 text-slate-400'}`}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-bold text-slate-800 text-sm truncate">{entry.name}</p>
                      <p className="text-xs text-slate-500 truncate">{entry.topic}</p>
                    </div>
                    <div className="font-black text-indigo-600 shrink-0">
                      {entry.score}%
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
