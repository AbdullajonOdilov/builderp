import { useState, useEffect } from 'react';
import { Task } from '@/types/task';

const STORAGE_KEY = 'tasks';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setTasks(JSON.parse(stored));
    }
  }, []);

  const saveTasks = (newTasks: Task[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks));
    setTasks(newTasks);
  };

  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    saveTasks([...tasks, newTask]);
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    saveTasks(tasks.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTask = (id: string) => {
    saveTasks(tasks.filter(t => t.id !== id));
  };

  return { tasks, addTask, updateTask, deleteTask };
};
