'use client';

import { useAuth } from '@/components/AuthProvider';
import { Home, CheckSquare, Calendar as CalendarIcon, Target, Activity, Zap, LogOut, Menu, X, Mic, Search, Plus } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AddTaskModal } from '@/components/AddTaskModal';

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, signOut, isDemo } = useAuth();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'AI Planner', href: '/planner', icon: Zap },
    { name: 'Calendar', href: '/calendar', icon: CalendarIcon },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  ];

  return (
    <div className="w-full h-screen bg-slate-50 flex overflow-hidden font-sans text-slate-800">
      <aside className="hidden md:flex w-60 h-full bg-white border-r border-slate-200 flex-col shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Zap className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">LastMinute – The AI Productivity Rescue System</span>
        </div>
        
        <nav className="mt-4 flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <item.icon size={20} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto mb-4 mx-4 bg-slate-900 rounded-xl text-white">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">Procrastination Risk</p>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold">High</span>
            <div className="flex-1 h-2 bg-slate-800 rounded-full">
              <div className="h-full bg-red-500 rounded-full" style={{ width: '78%' }}></div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 h-full flex flex-col min-w-0">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 flex items-center justify-between z-10 shrink-0">
          <div className="flex-1 flex items-center">
            <div className="relative w-full max-w-sm hidden sm:block">
              <input type="text" placeholder="Search tasks or ask AI..." className="w-full pl-9 pr-4 py-2 bg-slate-100 border-transparent rounded-full text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all" />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isDemo && (
              <div className="flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold border border-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                Demo Mode Active
              </div>
            )}
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 shadow-md transition-shadow">
              <Plus size={16} />
              Add Task
            </button>
            <div onClick={signOut} className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 overflow-hidden cursor-pointer flex items-center justify-center">
              {user?.photoURL ? <img src={user.photoURL} alt="User" /> : <LogOut size={16} className="text-slate-500" />}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>

      <AddTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
