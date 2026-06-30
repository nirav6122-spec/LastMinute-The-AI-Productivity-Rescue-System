'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { getHabits, addHabit } from '@/lib/firestore';
import { Habit } from '@/lib/types';
import { Activity, Plus, Check } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function HabitsPage() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    if (user) {
      getHabits(user.uid).then(h => {
        setHabits(h);
        setLoading(false);
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const id = await addHabit({
        userId: user.uid,
        title: newTitle,
        streak: 0,
        lastCompletedDate: null,
        createdAt: new Date().toISOString(),
      });
      setHabits([...habits, { id, userId: user.uid, title: newTitle, streak: 0, lastCompletedDate: null, createdAt: new Date().toISOString() }]);
      setShowForm(false);
      setNewTitle('');
    } catch (error) {
      console.error(error);
      alert('Failed to add habit');
    }
  };

  const handleComplete = async (habit: Habit) => {
    const today = new Date().toISOString().split('T')[0];
    if (habit.lastCompletedDate === today) return; // Already done today

    const newStreak = habit.streak + 1;
    await updateDoc(doc(db, 'users', habit.userId, 'habits', habit.id), { streak: newStreak, lastCompletedDate: today });
    setHabits(habits.map(h => h.id === habit.id ? { ...h, streak: newStreak, lastCompletedDate: today } : h));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Habits</h1>
          <p className="text-gray-500 mt-1">Build consistency with daily tracking.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} />
          <span>New Habit</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
          <input required type="text" placeholder="Habit name (e.g. Meditate for 10 mins)" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="flex-1 bg-gray-50 border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-600 outline-none" />
          <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 font-medium">Add</button>
        </form>
      )}

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-200 rounded-2xl w-full"></div>)}
        </div>
      ) : habits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {habits.map(habit => {
            const today = new Date().toISOString().split('T')[0];
            const doneToday = habit.lastCompletedDate === today;
            return (
              <div key={habit.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{habit.title}</h3>
                  <p className="text-sm text-gray-500 font-medium mt-1 flex items-center gap-1">
                    <span className="text-orange-500">🔥 {habit.streak} day streak</span>
                  </p>
                </div>
                <button 
                  onClick={() => handleComplete(habit)}
                  disabled={doneToday}
                  className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${doneToday ? 'bg-green-100 text-green-600 cursor-not-allowed' : 'bg-gray-100 text-gray-400 hover:bg-indigo-100 hover:text-indigo-600'}`}
                >
                  <Check size={24} />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">No habits yet</h3>
          <p className="text-gray-500">Start building good habits today.</p>
        </div>
      )}
    </div>
  );
}
