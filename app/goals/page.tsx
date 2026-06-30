'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { getGoals, addGoal } from '@/lib/firestore';
import { Goal } from '@/lib/types';
import { Target, Plus } from 'lucide-react';

export default function GoalsPage() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', targetDate: '', progress: 0 });

  useEffect(() => {
    if (user) {
      getGoals(user.uid).then(g => {
        setGoals(g);
        setLoading(false);
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const id = await addGoal({
        userId: user.uid,
        ...newGoal,
        createdAt: new Date().toISOString(),
      });
      setGoals([...goals, { id, userId: user.uid, ...newGoal, createdAt: new Date().toISOString() }]);
      setShowForm(false);
      setNewGoal({ title: '', targetDate: '', progress: 0 });
    } catch (error) {
      console.error(error);
      alert('Failed to add goal');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Goals</h1>
          <p className="text-gray-500 mt-1">Track your long-term objectives.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} />
          <span>New Goal</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Goal Title</label>
            <input required type="text" value={newGoal.title} onChange={e => setNewGoal({...newGoal, title: e.target.value})} className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-600 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
              <input required type="date" value={newGoal.targetDate} onChange={e => setNewGoal({...newGoal, targetDate: e.target.value})} className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-600 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Initial Progress (%)</label>
              <input type="number" min="0" max="100" value={newGoal.progress} onChange={e => setNewGoal({...newGoal, progress: parseInt(e.target.value)})} className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-600 outline-none" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-xl">Cancel</button>
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700">Save Goal</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1,2].map(i => <div key={i} className="h-32 bg-gray-200 rounded-2xl w-full"></div>)}
        </div>
      ) : goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map(goal => (
            <div key={goal.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{goal.title}</h3>
                <p className="text-sm text-gray-500 mt-1">Target: {new Date(goal.targetDate).toLocaleDateString()}</p>
              </div>
              <div className="mt-6">
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span className="text-gray-700">Progress</span>
                  <span className="text-indigo-600">{goal.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${goal.progress}%` }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">No goals set</h3>
          <p className="text-gray-500">Define your long-term objectives to track your progress.</p>
        </div>
      )}
    </div>
  );
}
