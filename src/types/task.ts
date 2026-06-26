export type TaskStatus = 'active' | 'completed' | 'deleted';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskEnergy = 'low' | 'medium' | 'deep';

export type TaskBackground = {
  color: string;
  imageUrl?: string;
  opacity: number;
};

export interface Task {
  id: string;
  title: string;
  description: string;
  tags: string[];
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  project?: string;
  estimateMinutes: number;
  energy: TaskEnergy;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  background: TaskBackground;
}

export type TaskDraft = Omit<Task, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'completedAt'>;

export type UserSettings = {
  cardPadding: number;
  headerFontSize: number;
  descFontSize: number;
  compactMode: boolean;
  glassIntensity: number;
  motionIntensity: number;
  silverMode: boolean;
  dailyCapacityHours: number;
  focusSessionMinutes: number;
  autoArchiveCompleted: boolean;
  showFocusPanel: boolean;
  reduceMotion: boolean;
};
