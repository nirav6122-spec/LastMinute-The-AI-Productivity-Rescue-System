import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Task, Goal, Habit } from './types';

export const getTasks = async (userId: string): Promise<Task[]> => {
  const q = query(collection(db, 'users', userId, 'tasks'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
};

export const addTask = async (task: Omit<Task, 'id'>): Promise<string> => {
  if (!task.title || !task.title.trim()) {
    throw new Error('Title is required');
  }
  if (!task.category || !task.category.trim()) {
    throw new Error('Category is required');
  }

  if (task.deadline) {
    const deadlineDate = new Date(task.deadline);
    if (deadlineDate < new Date()) {
      throw new Error('Deadline cannot be in the past');
    }
  }

  // Check for duplicates
  const q = query(
    collection(db, 'users', task.userId, 'tasks'),
    where('title', '==', task.title),
    where('category', '==', task.category),
    where('deadline', '==', task.deadline || '')
  );
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    throw new Error('A duplicate task with the same title, deadline, and category already exists.');
  }

  const docRef = await addDoc(collection(db, 'users', task.userId, 'tasks'), task);
  return docRef.id;
};

export const updateTask = async (userId: string, id: string, updates: Partial<Task>) => {
  const docRef = doc(db, 'users', userId, 'tasks', id);
  await updateDoc(docRef, updates);
};

export const deleteTask = async (userId: string, id: string) => {
  const docRef = doc(db, 'users', userId, 'tasks', id);
  await deleteDoc(docRef);
};

export const getGoals = async (userId: string): Promise<Goal[]> => {
  const q = query(collection(db, 'users', userId, 'goals'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal));
};

export const addGoal = async (goal: Omit<Goal, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'users', goal.userId, 'goals'), goal);
  return docRef.id;
};

export const getHabits = async (userId: string): Promise<Habit[]> => {
  const q = query(collection(db, 'users', userId, 'habits'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit));
};

export const addHabit = async (habit: Omit<Habit, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'users', habit.userId, 'habits'), habit);
  return docRef.id;
};

