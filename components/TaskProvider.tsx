'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { db } from '../lib/firebase';
import { useAuth } from '@/components/AuthProvider';
import { collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, query, orderBy, where } from 'firebase/firestore';

export interface Task {
  id: string;
  title: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  due: string;
  aiRec: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
}

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  addTask: (title: string, category: string, priority: Task['priority'], due: string, aiRec: string) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleComplete: (id: string, completed: boolean) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    const tasksRef = collection(db, 'users', user.uid, 'tasks');
    const q = query(tasksRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
      setTasks(fetchedTasks);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching tasks:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addTask = async (title: string, category: string, priority: Task['priority'], due: string, aiRec: string) => {
    if (!user) return;
    
    if (!title || !title.trim()) {
      throw new Error('Title is required');
    }
    if (!category || !category.trim()) {
      throw new Error('Category is required');
    }
    if (due && due !== 'No due date') {
      const dueDate = new Date(due);
      // Create a date for today with time set to 00:00:00 to only compare dates
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueCompare = new Date(due);
      dueCompare.setHours(0, 0, 0, 0);
      
      if (dueCompare < today) {
        throw new Error('Deadline cannot be in the past');
      }
    }

    const tasksRef = collection(db, 'users', user.uid, 'tasks');
    const duplicateQuery = query(
      tasksRef, 
      where('title', '==', title),
      where('category', '==', category),
      where('due', '==', due || 'No due date')
    );
    const { getDocs } = await import('firebase/firestore');
    const snapshot = await getDocs(duplicateQuery);
    
    if (!snapshot.empty) {
      throw new Error('A duplicate task with the same title, deadline, and category already exists.');
    }

    const newId = crypto.randomUUID();
    const taskData = {
      userId: user.uid,
      title,
      category,
      priority,
      due: due || 'No due date',
      aiRec,
      completed: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await setDoc(doc(db, 'users', user.uid, 'tasks', newId), taskData);
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'tasks', id), {
      ...updates,
      updatedAt: Date.now()
    });
  };

  const deleteTask = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'tasks', id));
  };

  const toggleComplete = async (id: string, completed: boolean) => {
    await updateTask(id, { completed });
  };

  return (
    <TaskContext.Provider value={{ tasks, loading, addTask, updateTask, deleteTask, toggleComplete }}>
      {children}
    </TaskContext.Provider>
  );
}

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    return {
      tasks: [],
      loading: true,
      addTask: async () => {},
      updateTask: async () => {},
      deleteTask: async () => {},
      toggleComplete: async () => {},
    };
  }
  return context;
};
