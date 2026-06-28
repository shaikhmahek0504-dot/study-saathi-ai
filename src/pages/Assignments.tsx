import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, Edit2, Trash2, Calendar, Clock, AlertCircle, Loader2, Sparkles, X, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

type Priority = 'Low' | 'Medium' | 'High';
type Status = 'todo' | 'in_progress' | 'done';

interface Assignment {
  id: string;
  subject: string;
  description: string;
  priority: Priority;
  deadline: string;
  status: Status;
  predictedCompletionTime?: string;
  predictedUrgency?: string;
  predictedBestTime?: string;
  order: number;
}

const columns: { id: Status; title: string; color: string }[] = [
  { id: 'todo', title: 'To Do', color: 'bg-slate-100 dark:bg-slate-800/50' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-indigo-50 dark:bg-indigo-900/20' },
  { id: 'done', title: 'Done', color: 'bg-emerald-50 dark:bg-emerald-900/20' },
];

export default function Assignments() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [deadline, setDeadline] = useState('');
  
  const [isPredicting, setIsPredicting] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'assignments'), orderBy('order'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Assignment[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Assignment);
      });
      setAssignments(data);
    });
    return () => unsubscribe();
  }, [user]);

  const resetForm = () => {
    setSubject('');
    setDescription('');
    setPriority('Medium');
    setDeadline('');
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handlePredict = async (assignmentData: any) => {
    try {
      setIsPredicting(true);
      const res = await fetch('/api/predict-assignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignmentData)
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsPredicting(false);
    }
    return null;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const assignmentData = {
      subject,
      description,
      priority,
      deadline,
    };

    const predictions = await handlePredict(assignmentData);

    const newAssignment = {
      ...assignmentData,
      status: 'todo' as Status,
      order: assignments.filter(a => a.status === 'todo').length,
      ...predictions
    };

    if (editingId) {
      const editDoc = assignments.find(a => a.id === editingId);
      if (editDoc) {
        await updateDoc(doc(db, 'users', user.uid, 'assignments', editingId), {
           ...assignmentData,
           ...predictions
        });
      }
    } else {
      await addDoc(collection(db, 'users', user.uid, 'assignments'), newAssignment);
    }
    
    resetForm();
  };

  const handleEdit = (assignment: Assignment) => {
    setSubject(assignment.subject);
    setDescription(assignment.description);
    setPriority(assignment.priority);
    setDeadline(assignment.deadline);
    setEditingId(assignment.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'assignments', id));
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const draggedAssignment = assignments.find(a => a.id === draggableId);
    if (!draggedAssignment) return;

    const destStatus = destination.droppableId as Status;
    const sourceStatus = source.droppableId as Status;

    // Optimistic UI update
    const newAssignments = Array.from(assignments);
    
    // Remove from old
    const sourceItems = newAssignments.filter(a => a.status === sourceStatus).sort((a,b) => a.order - b.order);
    sourceItems.splice(source.index, 1);
    sourceItems.forEach((item, i) => { item.order = i; });

    // Add to new
    const destItems = destStatus === sourceStatus ? sourceItems : newAssignments.filter(a => a.status === destStatus).sort((a,b) => a.order - b.order);
    const updatedDragged = { ...draggedAssignment, status: destStatus, order: destination.index };
    destItems.splice(destination.index, 0, updatedDragged);
    destItems.forEach((item, i) => { item.order = i; });

    const finalAssignments = newAssignments.map(a => {
        const inSource = sourceItems.find(s => s.id === a.id);
        const inDest = destItems.find(d => d.id === a.id);
        return inDest || inSource || a;
    });

    setAssignments(finalAssignments);

    // Save to Firestore
    if (user) {
        // We only really need to update the affected ones, but to be safe we can update all changed
        const updates = finalAssignments.filter(a => 
           a.status === destStatus || a.status === sourceStatus
        ).map(a => updateDoc(doc(db, 'users', user.uid, 'assignments', a.id), { status: a.status, order: a.order }));
        
        await Promise.all(updates);
    }
  };

  const getPriorityColor = (p: Priority) => {
    if (p === 'High') return 'bg-rose-100 text-rose-700 border-rose-200';
    if (p === 'Medium') return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Assignment Manager</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Track tasks and get AI-powered working strategies</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-sm transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Assignment
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 items-start">
          {columns.map(col => (
            <Droppable key={col.id} droppableId={col.id}>
              {(provided, snapshot) => (
                <div 
                  ref={provided.innerRef} 
                  {...provided.droppableProps}
                  className={`rounded-3xl p-4 min-h-[500px] border border-slate-200 dark:border-slate-800 shadow-sm ${col.color} transition-colors ${snapshot.isDraggingOver ? 'ring-2 ring-indigo-300 dark:ring-indigo-700 ring-offset-2 dark:ring-offset-slate-900 bg-opacity-80' : ''}`}
                >
                  <h2 className="font-bold text-slate-800 dark:text-white mb-4 px-2 flex justify-between items-center">
                    {col.title}
                    <span className="text-xs bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                      {assignments.filter(a => a.status === col.id).length}
                    </span>
                  </h2>
                  
                  <div className="flex flex-col gap-3">
                    {assignments.filter(a => a.status === col.id).sort((a,b) => a.order - b.order).map((assignment, index) => (
                      <Draggable key={assignment.id} draggableId={assignment.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-shadow group
                               ${snapshot.isDragging ? 'shadow-xl ring-2 ring-indigo-500 rotate-2' : 'hover:shadow-md'}`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-bold text-slate-800 dark:text-white break-words">{assignment.subject}</h3>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(assignment)} className="p-1 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded">
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(assignment.id)} className="p-1 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 rounded">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{assignment.description}</p>
                            
                            <div className="flex flex-wrap gap-2 mb-4">
                              <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${getPriorityColor(assignment.priority)}`}>
                                {assignment.priority}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(assignment.deadline), 'MMM d, yyyy')}
                              </span>
                            </div>

                            {(assignment.predictedCompletionTime || assignment.predictedUrgency) && (
                              <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-3 rounded-xl border border-indigo-100/50 dark:border-indigo-900/30 space-y-2">
                                <div className="flex items-center gap-1.5 text-indigo-800 dark:text-indigo-300 text-xs font-bold mb-1">
                                  <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" /> AI Insights
                                </div>
                                {assignment.predictedCompletionTime && (
                                  <div className="flex items-center gap-1.5 text-[10px] text-slate-600 dark:text-slate-400 font-medium">
                                    <Clock className="w-3 h-3 shrink-0 text-slate-400 dark:text-slate-500" />
                                    <span>Takes ~{assignment.predictedCompletionTime}</span>
                                  </div>
                                )}
                                {assignment.predictedUrgency && (
                                  <div className="flex items-center gap-1.5 text-[10px] text-slate-600 dark:text-slate-400 font-medium">
                                    <AlertCircle className="w-3 h-3 shrink-0 text-slate-400 dark:text-slate-500" />
                                    <span>{assignment.predictedUrgency} urgency</span>
                                  </div>
                                )}
                                {assignment.predictedBestTime && (
                                  <div className="flex items-center gap-1.5 text-[10px] text-slate-600 dark:text-slate-400 font-medium">
                                    <Activity className="w-3 h-3 shrink-0 text-slate-400 dark:text-slate-500" />
                                    <span>Do: {assignment.predictedBestTime}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative"
            >
              <button 
                onClick={resetForm}
                className="absolute top-6 right-6 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-full p-1"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
                {editingId ? 'Edit Assignment' : 'New Assignment'}
              </h2>
              
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Subject / Task Name</label>
                  <input 
                    type="text" required
                    value={subject} onChange={e => setSubject(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none text-slate-900 dark:text-white"
                    placeholder="e.g. Calculus Chapter 4 Exercises"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                  <textarea 
                    value={description} onChange={e => setDescription(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none resize-none min-h-[100px] text-slate-900 dark:text-white"
                    placeholder="Notes or details about this task..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                    <select 
                      value={priority} onChange={e => setPriority(e.target.value as Priority)}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none text-slate-900 dark:text-white"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Deadline</label>
                    <input 
                      type="date" required
                      value={deadline} onChange={e => setDeadline(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                  <button 
                    type="button" onClick={resetForm}
                    className="px-5 py-2.5 rounded-xl font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" disabled={isPredicting}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-sm transition-colors disabled:opacity-50"
                  >
                    {isPredicting ? (
                       <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
                    ) : (
                      <>{editingId ? 'Save Changes' : 'Create Assignment'}</>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
