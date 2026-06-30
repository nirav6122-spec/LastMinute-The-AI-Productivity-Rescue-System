import { db } from './firebase';
import { collection, addDoc, getDocs, query, limit } from 'firebase/firestore';

export const seedDemoData = async (userId: string) => {
  // Check if there are already any tasks for this user to prevent duplicate seeds
  const tasksRef = collection(db, 'users', userId, 'tasks');
  const existingTasks = await getDocs(query(tasksRef, limit(1)));
  if (!existingTasks.empty) {
    return;
  }

  const tasks = [
    { title: 'Finish Q3 report', priority: 'High', due: 'Today', aiRec: '2h', completed: false, createdAt: Date.now(), updatedAt: Date.now() },
    { title: 'Team meeting', priority: 'Medium', due: 'Tomorrow', aiRec: '30m', completed: false, createdAt: Date.now(), updatedAt: Date.now() },
    { title: 'Review project proposals', priority: 'Low', due: 'Next week', aiRec: '1h', completed: false, createdAt: Date.now(), updatedAt: Date.now() },
  ];
  
  const habits = [
    { name: 'Morning meditation', streak: 5, lastCompletedDate: '2026-06-28', createdAt: Date.now() },
    { name: 'Read 30 mins', streak: 12, lastCompletedDate: '2026-06-28', createdAt: Date.now() },
  ];

  const goals = [
    { title: 'Learn TypeScript', progress: 60, target: 100, createdAt: Date.now() },
    { title: 'Run a marathon', progress: 20, target: 100, createdAt: Date.now() },
  ];

  for (const task of tasks) {
    await addDoc(collection(db, 'users', userId, 'tasks'), task);
  }
  for (const habit of habits) {
    await addDoc(collection(db, 'users', userId, 'habits'), habit);
  }
  for (const goal of goals) {
    await addDoc(collection(db, 'users', userId, 'goals'), goal);
  }
};
