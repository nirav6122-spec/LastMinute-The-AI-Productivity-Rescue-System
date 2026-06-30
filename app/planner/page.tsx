'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { getTasks } from '@/lib/firestore';
import { Task } from '@/lib/types';
import { Zap, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function PlannerPage() {
  const { user, token } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [plan, setPlan] = useState('');

  useEffect(() => {
    if (user) {
      getTasks(user.uid).then(t => {
        // @ts-ignore
        setTasks(t.filter(task => task.status !== 'Completed' && task.completed !== true));
        setLoading(false);
      });
    }
  }, [user]);

  const generatePlan = async () => {
    if (!token || tasks.length === 0) return;
    setAnalyzing(true);
    try {
      const res = await fetch('/api/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ tasks })
      });
      const data = await res.json();
      setPlan(data.plan);
    } catch (error) {
      console.error(error);
      alert('Failed to generate plan');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">AI Planner</h1>
        <p className="text-gray-500 mt-1">Let Gemini analyze your pending tasks and build an optimal schedule.</p>
      </div>

      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600">
              <Zap size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Smart Prioritization</h2>
              <p className="text-gray-600 mt-1">You have {tasks.length} pending tasks to analyze.</p>
            </div>
          </div>
          
          <button
            onClick={generatePlan}
            disabled={analyzing || tasks.length === 0}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Analyzing Workload...</span>
              </>
            ) : (
              <>
                <Zap size={20} />
                <span>Generate Today's Plan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {plan && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Zap className="text-yellow-500" size={20} />
            Your Optimized Action Plan
          </h3>
          <div className="prose prose-indigo max-w-none">
            <ReactMarkdown>{plan}</ReactMarkdown>
          </div>
        </div>
      )}

      {!plan && tasks.length === 0 && !loading && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No tasks to analyze</h3>
          <p className="text-gray-500 mt-1">Add some tasks first to get an AI-generated plan.</p>
        </div>
      )}
    </div>
  );
}
