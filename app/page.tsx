'use client';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Zap, Mic, AlertCircle, Check, PlayCircle } from 'lucide-react';
import { useTasks } from '@/components/TaskProvider';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { playNotificationSound } from '@/lib/audio';

export default function Page() {
  const { tasks, toggleComplete, addTask, loading: tasksLoading } = useTasks();
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterPriority, setFilterPriority] = useState<string>('All');

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  const categories = ['All', ...Array.from(new Set(tasks.map(t => t.category))).filter(c => c && c !== 'All')];
  const priorities = ['All', 'High', 'Medium', 'Low'];

  const filteredTasks = activeTasks.filter(t =>
    (filterCategory === 'All' || t.category === filterCategory) &&
    (filterPriority === 'All' || t.priority === filterPriority)
  );

  const categoryDistribution = tasks.reduce((acc, task) => {
    acc[task.category] = (acc[task.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(categoryDistribution).map(([name, value]) => ({ name, value }));
  const COLORS = ['#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#f59e0b', '#10b981'];

  const priorityStyles = {
    High: {
      card: 'border-red-100 bg-red-50/30 hover:bg-white hover:border-slate-200',
      checkbox: 'border-red-400 bg-white hover:bg-red-50',
      text: 'text-red-600',
      aiRec: 'bg-white border-slate-200 text-slate-400'
    },
    Medium: {
      card: 'border-amber-100 bg-amber-50/30 hover:bg-white hover:border-slate-200',
      checkbox: 'border-amber-400 bg-white hover:bg-amber-50',
      text: 'text-amber-600',
      aiRec: 'bg-white border-slate-200 text-slate-400'
    },
    Low: {
      card: 'border-emerald-100 bg-emerald-50/30 hover:bg-white hover:border-slate-200',
      checkbox: 'border-emerald-400 bg-white hover:bg-emerald-50',
      text: 'text-emerald-600',
      aiRec: 'bg-white border-slate-200 text-slate-400'
    }
  };
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }
    
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setTranscript('Voice recognition not supported in this browser.');
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      setIsRecording(true);
      setTranscript('Listening...');
    };
    
    recognition.onresult = async (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(`You said: "${text}". Processing...`);
      try {
        const res = await fetch('/api/voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        });
        const data = await res.json();
        if (data.task) {
          await addTask(data.task.title, 'Other', data.task.priority, data.task.due, data.task.aiRec);
          setTranscript(`Added: ${data.task.title}`);
        } else {
          setTranscript('Could not understand task.');
        }
      } catch (err) {
        console.error(err);
        setTranscript('Failed to process voice command.');
      }
      setIsRecording(false);
    };
    
    recognition.onerror = (event: any) => {
      console.error(event.error);
      setIsRecording(false);
      setTranscript('Error listening.');
    };
    
    recognition.onend = () => {
      setIsRecording(false);
    };
    
    recognition.start();
  };

  const getPlan = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: activeTasks })
      });
      const data = await res.json();
      setPlan(data.plan);
    } catch (err) {
      console.error(err);
      setPlan("Failed to generate plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const calculateProductivityScore = () => {
    if (tasks.length === 0) return 0;
    return Math.round((completedTasks.length / tasks.length) * 100);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full">
      <div className="md:col-span-8 flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <p className="text-slate-500 text-sm font-medium">Productivity Score</p>
            <div className="flex items-end justify-between mt-1">
              <h3 className="text-3xl font-bold text-slate-900">{calculateProductivityScore()}%</h3>
              <span className="text-emerald-500 text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded">+12%</span>
            </div>
          </div>
          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <p className="text-slate-500 text-sm font-medium">Habit Streak</p>
            <div className="flex items-end justify-between mt-1">
              <h3 className="text-3xl font-bold text-slate-900">12 <span className="text-base font-normal text-slate-400">days</span></h3>
              <span className="text-orange-500 text-sm">🔥</span>
            </div>
          </div>
          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <p className="text-slate-500 text-sm font-medium">Hours Saved</p>
            <div className="flex items-end justify-between mt-1">
              <h3 className="text-3xl font-bold text-slate-900">6.4</h3>
              <span className="text-slate-400 text-xs">this week</span>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white border border-slate-200 rounded-3xl p-6 flex flex-col shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            <h2 className="text-lg font-bold">Today's Focus</h2>
            <div className="flex items-center gap-2">
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="text-xs bg-slate-100 px-3 py-1.5 rounded-lg font-medium outline-none">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="text-xs bg-slate-100 px-3 py-1.5 rounded-lg font-medium outline-none">
                {priorities.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <button onClick={getPlan} disabled={loading || activeTasks.length === 0} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-1">
                <PlayCircle className="w-4 h-4" />
                {loading ? 'Analyzing...' : 'Generate AI Plan'}
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            {tasksLoading ? (
              <div className="text-slate-400 text-sm text-center py-4">Loading tasks...</div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-slate-400 text-sm text-center py-8">No tasks matching your filters.</div>
            ) : (
              filteredTasks.map((t, idx) => (
                <div key={`${t.id || idx}-${idx}`} className={`flex items-center gap-4 p-4 rounded-xl group transition-all border ${priorityStyles[t.priority as keyof typeof priorityStyles]?.card || 'border-slate-200 hover:bg-slate-50'}`}>
                  <div 
                    onClick={() => { toggleComplete(t.id, true); playNotificationSound(); }}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${priorityStyles[t.priority as keyof typeof priorityStyles]?.checkbox || 'border-slate-300 hover:bg-slate-200'}`}
                  ></div>
                  <div className="flex-1">
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase tracking-wider mb-1 inline-block">
                      {t.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{t.title}</h4>
                    <p className={`text-xs ${priorityStyles[t.priority as keyof typeof priorityStyles]?.text || 'text-slate-500'}`}>{t.due}</p>
                  </div>
                  <div className={`text-xs font-mono px-2 py-1 rounded border ${priorityStyles[t.priority as keyof typeof priorityStyles]?.aiRec || 'bg-slate-100 border-transparent text-slate-500'}`}>
                    AI REC: {t.aiRec}
                  </div>
                </div>
              ))
            )}
          </div>

          {plan ? (
            <div className="mt-6 p-5 bg-slate-50 border border-slate-200 rounded-2xl">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-500" />
                Your Optimized Plan
              </h3>
              <div className="prose prose-sm prose-slate max-w-none text-slate-700">
                <ReactMarkdown>{plan}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="mt-6 p-4 bg-indigo-900 rounded-2xl text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="p-1 bg-white/20 rounded">
                    <Zap className="w-4 h-4 text-indigo-200" />
                  </span>
                  <h3 className="text-sm font-bold uppercase tracking-wider">AI Rescue Plan Ready</h3>
                </div>
                <p className="text-sm text-indigo-100 leading-relaxed mb-4">Click "Generate AI Plan" above to prioritize your active tasks and optimize your schedule.</p>
              </div>
              <div className="absolute top-[-20%] right-[-5%] w-40 h-40 bg-indigo-500 rounded-full blur-[60px] opacity-20"></div>
            </div>
          )}
        </div>
      </div>

      <div className="md:col-span-4 flex flex-col gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <h2 className="text-base font-bold">Category Distribution</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <h2 className="text-base font-bold">Completed Today</h2>
          <div className="space-y-4">
            {completedTasks.length === 0 ? (
              <p className="text-xs text-slate-400">No tasks completed yet.</p>
            ) : (
              completedTasks.slice(0, 3).map((t, idx) => (
                <div key={`${t.id || idx}-${idx}`} className="flex items-center gap-3">
                  <div 
                    onClick={() => toggleComplete(t.id, false)}
                    className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center cursor-pointer hover:bg-indigo-200"
                  >
                    <Check className="w-3 h-3" />
                  </div>
                  <p className="text-sm text-slate-500 line-through">{t.title}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div 
          onClick={toggleRecording}
          className={`flex-1 border rounded-3xl p-6 shadow-sm flex flex-col justify-center items-center text-center cursor-pointer transition-all duration-300 ${isRecording ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-transform duration-300 ${isRecording ? 'bg-white/20 text-white scale-110 animate-pulse' : 'bg-indigo-50 text-indigo-600'}`}>
            <Mic className="w-5 h-5" />
          </div>
          <h3 className={`text-sm font-bold mb-2 transition-colors ${isRecording ? 'text-white' : 'text-slate-900'}`}>
            {isRecording ? 'Listening...' : 'Voice Assistant'}
          </h3>
          <p className={`text-xs transition-colors ${isRecording ? 'text-indigo-200' : 'text-slate-500'}`}>
            {transcript || (isRecording ? 'Speak now...' : 'Tap to speak')}
          </p>
        </div>

        <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">AI Insights</span>
            <AlertCircle className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-sm text-indigo-900 leading-snug">
            Your focus peaks between <span className="font-bold">9 AM and 11 AM</span>. I've scheduled your hardest tasks there tomorrow.
          </p>
        </div>
      </div>
    </div>
  );
}
