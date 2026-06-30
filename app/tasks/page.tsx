'use client';
import { useState } from 'react';
import { useTasks } from '@/components/TaskProvider';
import { Check, Trash2, X } from 'lucide-react';
import { playNotificationSound } from '@/lib/audio';

export default function TasksPage() {
  const { tasks, toggleComplete, deleteTask, loading } = useTasks();
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{isOpen: boolean, type: 'single' | 'bulk', taskId?: string}>({ isOpen: false, type: 'single' });

  const toggleSelect = (id: string) => {
    setSelectedTasks(prev => 
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  const handleBulkComplete = () => {
    selectedTasks.forEach(id => toggleComplete(id, true));
    if (selectedTasks.length > 0) {
      playNotificationSound();
    }
    setSelectedTasks([]);
  };

  const confirmDelete = () => {
    if (deleteDialog.type === 'bulk') {
      selectedTasks.forEach(id => deleteTask(id));
      setSelectedTasks([]);
    } else if (deleteDialog.type === 'single' && deleteDialog.taskId) {
      deleteTask(deleteDialog.taskId);
    }
    setDeleteDialog({ isOpen: false, type: 'single' });
  };

  const cancelDelete = () => {
    setDeleteDialog({ isOpen: false, type: 'single' });
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading tasks...</div>;
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm h-full flex flex-col relative">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">All Tasks</h1>
        <div className="text-sm font-medium text-slate-500">{tasks.length} total tasks</div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center text-slate-400 py-12">No tasks available.</div>
        ) : (
          tasks.map((t, idx) => (
            <div key={`${t.id || idx}-${idx}`} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${t.completed ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-200 hover:border-indigo-300'}`}>
              <div
                onClick={() => toggleSelect(t.id)}
                className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer ${selectedTasks.includes(t.id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}
              >
                {selectedTasks.includes(t.id) && <Check className="w-3 h-3 text-white" />}
              </div>
              <div 
                onClick={() => {
                  toggleComplete(t.id, !t.completed);
                  if (!t.completed) playNotificationSound();
                }}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${t.completed ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 hover:border-indigo-400'}`}
              >
                {t.completed && <Check className="w-4 h-4 text-white" />}
              </div>
              <div className="flex-1">
                <h4 className={`text-sm font-bold ${t.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>{t.title}</h4>
                <div className="flex gap-3 mt-1">
                  <span className="text-xs font-medium text-slate-500">{t.due}</span>
                  <span className={`text-xs font-bold px-2 rounded-full ${t.priority === 'High' ? 'bg-red-50 text-red-600' : t.priority === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                    {t.priority}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setDeleteDialog({ isOpen: true, type: 'single', taskId: t.id })}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>

      {selectedTasks.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white p-4 rounded-full shadow-lg flex items-center gap-4 z-40">
          <span className="text-sm font-medium">{selectedTasks.length} selected</span>
          <button onClick={handleBulkComplete} className="text-xs bg-indigo-500 hover:bg-indigo-600 px-3 py-1.5 rounded-full">Complete</button>
          <button onClick={() => setDeleteDialog({ isOpen: true, type: 'bulk' })} className="text-xs bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-full">Delete</button>
          <button onClick={() => setSelectedTasks([])} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
      )}

      {deleteDialog.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 overflow-hidden">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Task{deleteDialog.type === 'bulk' ? 's' : ''}?</h3>
            <p className="text-slate-500 text-sm mb-6">
              Are you sure you want to delete {deleteDialog.type === 'bulk' ? `these ${selectedTasks.length} tasks` : 'this task'}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={cancelDelete} className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
