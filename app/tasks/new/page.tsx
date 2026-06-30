'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { addTask } from '@/lib/firestore';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { Priority, Status } from '@/lib/types';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function NewTaskPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState({ title: false, category: false, deadline: false });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    detailedDescription: '',
    deadline: '',
    priority: 'Medium' as Priority,
    category: 'Work',
    timeEstimateMinutes: 30,
    status: 'Pending' as Status,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!user) return;
    
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.category.trim()) {
      setError('Category is required');
      return;
    }
    if (formData.deadline) {
      const deadlineDate = new Date(formData.deadline);
      if (deadlineDate < new Date()) {
        setError('Deadline cannot be in the past');
        return;
      }
    }
    
    setLoading(true);
    try {
      // Check for duplicates
      const tasksRef = collection(db, 'users', user.uid, 'tasks');
      const duplicateQuery = query(
        tasksRef,
        where('title', '==', formData.title),
        where('category', '==', formData.category),
        where('deadline', '==', formData.deadline || '')
      );
      const snapshot = await getDocs(duplicateQuery);
      if (!snapshot.empty) {
        throw new Error('A duplicate task with the same title, deadline, and category already exists.');
      }

      await addTask({
        userId: user.uid,
        ...formData,
        createdAt: new Date().toISOString(),
      });
      router.push('/tasks');
    } catch (err: any) {
      console.error('Error adding task', err);
      setError(err.message || 'Failed to add task');
    } finally {
      setLoading(false);
    }
  };

  const isPastDate = formData.deadline ? new Date(formData.deadline) < new Date() : false;
  const isSubmitDisabled = loading || isPastDate || !formData.title.trim() || !formData.category.trim();

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/tasks" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 w-fit">
        <ArrowLeft size={20} />
        <span>Back to Tasks</span>
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h1 className="text-2xl font-bold text-gray-900">Create New Task</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
            <input
              required
              type="text"
              value={formData.title}
              onBlur={() => setTouched({ ...touched, title: true })}
              onChange={e => {
                setFormData({ ...formData, title: e.target.value });
                if (!touched.title) setTouched({ ...touched, title: true });
              }}
              className={`w-full bg-gray-50 border rounded-xl px-4 py-2 focus:ring-2 outline-none transition-all ${touched.title && !formData.title.trim() ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-600'}`}
              placeholder="What needs to be done?"
            />
            {touched.title && !formData.title.trim() && (
              <p className="text-red-500 text-xs mt-1">Title is required.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-600 outline-none transition-all min-h-[100px]"
              placeholder="Add details, links, or notes..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description</label>
            <textarea
              value={formData.detailedDescription}
              onChange={e => setFormData({ ...formData, detailedDescription: e.target.value })}
              className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-600 outline-none transition-all min-h-[150px]"
              placeholder="Provide a more context-rich and detailed description for this task..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
              <input
                type="datetime-local"
                value={formData.deadline}
                onBlur={() => setTouched({ ...touched, deadline: true })}
                onChange={e => {
                  setFormData({ ...formData, deadline: e.target.value });
                  if (!touched.deadline) setTouched({ ...touched, deadline: true });
                }}
                className={`w-full bg-gray-50 border rounded-xl px-4 py-2 focus:ring-2 outline-none transition-all ${isPastDate ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-600'}`}
              />
              {isPastDate && (
                <p className="text-red-500 text-xs mt-1">Deadline cannot be in the past.</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value as Priority })}
                className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                type="text"
                value={formData.category}
                onBlur={() => setTouched({ ...touched, category: true })}
                onChange={e => {
                  setFormData({ ...formData, category: e.target.value });
                  if (!touched.category) setTouched({ ...touched, category: true });
                }}
                className={`w-full bg-gray-50 border rounded-xl px-4 py-2 focus:ring-2 outline-none transition-all ${touched.category && !formData.category.trim() ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-600'}`}
                placeholder="e.g. Work, Personal, Study"
              />
              {touched.category && !formData.category.trim() && (
                <p className="text-red-500 text-xs mt-1">Category is required.</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Time (mins)</label>
              <input
                type="number"
                min="0"
                value={formData.timeEstimateMinutes}
                onChange={e => setFormData({ ...formData, timeEstimateMinutes: parseInt(e.target.value) || 0 })}
                className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={20} />
              )}
              <span>Save Task</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
