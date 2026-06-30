export type Priority = 'High' | 'Medium' | 'Low';
export type Status = 'Pending' | 'In Progress' | 'Completed';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  detailedDescription?: string;
  deadline: string | null;
  priority: Priority;
  category: string;
  timeEstimateMinutes: number;
  status: Status;
  createdAt: string;
  gcalEventId?: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  targetDate: string;
  progress: number; // 0-100
  createdAt: string;
}

export interface Habit {
  id: string;
  userId: string;
  title: string;
  streak: number;
  lastCompletedDate: string | null;
  createdAt: string;
}
