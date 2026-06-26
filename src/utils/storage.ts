import type { Task, UserSettings } from '../types/task';

const TASKS_KEY = 'taskflow.tasks.v3';
const LEGACY_TASKS_KEY = 'tasks_db';
const SETTINGS_KEY = 'taskflow.settings.v5';
const LEGACY_SETTINGS_KEY = 'globalSettings';

export const DEFAULT_SETTINGS: UserSettings = {
  cardPadding: 18,
  headerFontSize: 18,
  descFontSize: 14,
  compactMode: false,
  glassIntensity: 72,
  motionIntensity: 42,
  silverMode: true,
  dailyCapacityHours: 6,
  focusSessionMinutes: 50,
  autoArchiveCompleted: false,
  showFocusPanel: true,
  reduceMotion: false,
};

export function loadTasks(): Task[] {
  const raw = localStorage.getItem(TASKS_KEY) ?? localStorage.getItem('taskflow.tasks.v2') ?? localStorage.getItem(LEGACY_TASKS_KEY);
  if (!raw) return getDemoTasks();

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return getDemoTasks();
    return parsed.map(normalizeTask).filter(Boolean) as Task[];
  } catch {
    return getDemoTasks();
  }
}

export function saveTasks(tasks: Task[]) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export function loadSettings(): UserSettings {
  const raw = localStorage.getItem(SETTINGS_KEY) ?? localStorage.getItem('taskflow.settings.v4') ?? localStorage.getItem(LEGACY_SETTINGS_KEY);
  if (!raw) return DEFAULT_SETTINGS;

  try {
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      compactMode: Boolean(parsed.compactMode ?? DEFAULT_SETTINGS.compactMode),
      silverMode: Boolean(parsed.silverMode ?? DEFAULT_SETTINGS.silverMode),
      autoArchiveCompleted: Boolean(parsed.autoArchiveCompleted ?? DEFAULT_SETTINGS.autoArchiveCompleted),
      showFocusPanel: Boolean(parsed.showFocusPanel ?? DEFAULT_SETTINGS.showFocusPanel),
      reduceMotion: Boolean(parsed.reduceMotion ?? DEFAULT_SETTINGS.reduceMotion),
      cardPadding: Number(parsed.cardPadding ?? DEFAULT_SETTINGS.cardPadding),
      headerFontSize: Number(parsed.headerFontSize ?? DEFAULT_SETTINGS.headerFontSize),
      descFontSize: Number(parsed.descFontSize ?? DEFAULT_SETTINGS.descFontSize),
      glassIntensity: Number(parsed.glassIntensity ?? DEFAULT_SETTINGS.glassIntensity),
      motionIntensity: Number(parsed.motionIntensity ?? DEFAULT_SETTINGS.motionIntensity),
      dailyCapacityHours: Number(parsed.dailyCapacityHours ?? DEFAULT_SETTINGS.dailyCapacityHours),
      focusSessionMinutes: Number(parsed.focusSessionMinutes ?? DEFAULT_SETTINGS.focusSessionMinutes),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function exportTasks(tasks: Task[]) {
  return JSON.stringify({ exportedAt: new Date().toISOString(), version: 3, tasks }, null, 2);
}

export function parseImportedTasks(payload: string): Task[] {
  const parsed = JSON.parse(payload);
  const tasks = Array.isArray(parsed) ? parsed : parsed.tasks;
  if (!Array.isArray(tasks)) throw new Error('Invalid import format');
  return tasks.map(normalizeTask).filter(Boolean) as Task[];
}

function normalizeTask(input: Partial<Task>): Task | null {
  if (!input || !input.title) return null;
  const now = new Date().toISOString();
  const energy = input.energy === 'low' || input.energy === 'deep' ? input.energy : 'medium';
  return {
    id: String(input.id ?? crypto.randomUUID()),
    title: String(input.title),
    description: String(input.description ?? ''),
    tags: Array.isArray(input.tags) ? input.tags.map(String) : [],
    status: input.status === 'completed' || input.status === 'deleted' ? input.status : 'active',
    priority: input.priority === 'low' || input.priority === 'high' || input.priority === 'urgent' ? input.priority : 'medium',
    dueDate: input.dueDate || undefined,
    project: input.project ? String(input.project) : undefined,
    estimateMinutes: Math.max(15, Number(input.estimateMinutes ?? 60)),
    energy,
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
    completedAt: input.completedAt,
    background: {
      color: input.background?.color ?? '#101010',
      imageUrl: input.background?.imageUrl,
      opacity: Number(input.background?.opacity ?? 0.12),
    },
  };
}

function getDemoTasks(): Task[] {
  const now = new Date();
  const iso = now.toISOString();
  const tomorrow = new Date(now.getTime() + 86_400_000).toISOString();
  const nextWeek = new Date(now.getTime() + 604_800_000).toISOString();
  return [
    {
      id: crypto.randomUUID(),
      title: 'Polish GitHub presentation',
      description: 'Make the repository feel like a real product: strong README, screenshots, CI, Docker and clean structure.',
      tags: ['github', 'portfolio'],
      status: 'active',
      priority: 'high',
      dueDate: tomorrow,
      project: 'Portfolio launch',
      estimateMinutes: 90,
      energy: 'deep',
      createdAt: iso,
      updatedAt: iso,
      background: { color: '#151515', opacity: 0.12 },
    },
    {
      id: crypto.randomUUID(),
      title: 'Record product walkthrough screenshots',
      description: 'Prepare before/after screens and a short product story for the repository README.',
      tags: ['marketing', 'demo'],
      status: 'active',
      priority: 'urgent',
      dueDate: tomorrow,
      project: 'Portfolio launch',
      estimateMinutes: 45,
      energy: 'medium',
      createdAt: iso,
      updatedAt: iso,
      background: { color: '#161616', opacity: 0.12 },
    },
    {
      id: crypto.randomUUID(),
      title: 'Ship Docker production flow',
      description: 'Keep nginx, compose and deployment docs ready for a reviewer or recruiter.',
      tags: ['docker', 'devops'],
      status: 'active',
      priority: 'medium',
      dueDate: nextWeek,
      project: 'Engineering',
      estimateMinutes: 70,
      energy: 'deep',
      createdAt: iso,
      updatedAt: iso,
      background: { color: '#202020', opacity: 0.12 },
    },
    {
      id: crypto.randomUUID(),
      title: 'Create task intelligence modal',
      description: 'Open any card to view metadata, timeline and fast actions without losing board context.',
      tags: ['ux', 'feature'],
      status: 'completed',
      priority: 'medium',
      project: 'Product',
      estimateMinutes: 60,
      energy: 'medium',
      createdAt: iso,
      updatedAt: iso,
      completedAt: iso,
      background: { color: '#111111', opacity: 0.12 },
    },
  ];
}
