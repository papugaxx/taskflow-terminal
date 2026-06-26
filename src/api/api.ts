import type { Task } from '../types/task';
import { loadTasks, saveTasks } from '../utils/storage';

const DELAY = Number(import.meta.env.VITE_API_DELAY) || 0;
const sleep = () => new Promise((resolve) => setTimeout(resolve, DELAY));

export const api = {
  getTasks: async (): Promise<Task[]> => {
    await sleep();
    return loadTasks();
  },
  saveTasks: async (tasks: Task[]) => {
    await sleep();
    saveTasks(tasks);
  },
};
