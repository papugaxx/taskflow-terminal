import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Input,
  message,
  Modal,
  Progress,
  Row,
  Segmented,
  Select,
  Space,
  Statistic,
  Tabs,
  Tag,
  Timeline,
  Typography,
  Upload,
} from 'antd';
import {
  CalendarOutlined,
  DownloadOutlined,
  FieldTimeOutlined,
  FireOutlined,
  ImportOutlined,
  PlusOutlined,
  SearchOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import type { CSSProperties } from 'react';
import { TaskCard } from '../components/TaskCard';
import { TaskForm } from '../components/TaskForm';
import type { Task, TaskDraft, TaskPriority, UserSettings } from '../types/task';
import { exportTasks, loadTasks, parseImportedTasks, saveTasks } from '../utils/storage';

type DashboardTab = 'active' | 'planner' | 'completed' | 'archive' | 'analytics';
type Action = 'edit' | 'complete' | 'restore' | 'archive' | 'delete';

type Props = {
  settings: UserSettings;
  defaultTab?: 'active' | 'completed' | 'archive' | 'analytics';
};

const priorityOrder: Record<TaskPriority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
const priorityLabels: TaskPriority[] = ['urgent', 'high', 'medium', 'low'];

const formatHours = (minutes: number) => `${Math.round((minutes / 60) * 10) / 10}h`;

export const Dashboard = ({ settings, defaultTab = 'active' }: Props) => {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [searchText, setSearchText] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [sortMode, setSortMode] = useState<'updated' | 'priority' | 'dueDate' | 'estimate'>('updated');
  const [activeTab, setActiveTab] = useState<DashboardTab>(defaultTab === 'analytics' ? 'analytics' : defaultTab);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const persistTasks = (nextTasks: Task[]) => {
    setTasks(nextTasks);
    saveTasks(nextTasks);
  };

  const activeTasks = useMemo(() => tasks.filter((task) => task.status === 'active'), [tasks]);
  const completedTasks = useMemo(() => tasks.filter((task) => task.status === 'completed'), [tasks]);
  const capacityMinutes = settings.dailyCapacityHours * 60;

  const stats = useMemo(() => {
    const deleted = tasks.filter((task) => task.status === 'deleted');
    const overdue = activeTasks.filter((task) => task.dueDate && dayjs(task.dueDate).isBefore(dayjs(), 'day'));
    const urgent = activeTasks.filter((task) => task.priority === 'urgent');
    const dueSoon = activeTasks.filter((task) => task.dueDate && dayjs(task.dueDate).diff(dayjs(), 'day') <= 3 && dayjs(task.dueDate).diff(dayjs(), 'day') >= 0);
    const plannedMinutes = activeTasks.reduce((sum, task) => sum + task.estimateMinutes, 0);

    return {
      total: tasks.length,
      active: activeTasks.length,
      completed: completedTasks.length,
      deleted: deleted.length,
      overdue: overdue.length,
      urgent: urgent.length,
      dueSoon: dueSoon.length,
      plannedMinutes,
      workloadPercent: capacityMinutes ? Math.min(160, Math.round((plannedMinutes / capacityMinutes) * 100)) : 0,
      completionRate: tasks.length ? Math.round((completedTasks.length / tasks.length) * 100) : 0,
    };
  }, [activeTasks, capacityMinutes, completedTasks, tasks]);

  const focusQueue = useMemo(() => {
    return activeTasks
      .sort((a, b) => {
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff) return priorityDiff;
        return (a.dueDate ? dayjs(a.dueDate).valueOf() : Infinity) - (b.dueDate ? dayjs(b.dueDate).valueOf() : Infinity);
      })
      .slice(0, 5);
  }, [activeTasks]);

  const projects = useMemo(() => {
    const names = [...new Set(tasks.map((task) => task.project).filter(Boolean) as string[])];
    return names.sort((a, b) => a.localeCompare(b));
  }, [tasks]);

  const projectData = useMemo(() => {
    const grouped = new Map<string, { active: number; minutes: number; completed: number }>();
    tasks.forEach((task) => {
      const key = task.project || 'Inbox';
      const current = grouped.get(key) ?? { active: 0, minutes: 0, completed: 0 };
      if (task.status === 'active') {
        current.active += 1;
        current.minutes += task.estimateMinutes;
      }
      if (task.status === 'completed') current.completed += 1;
      grouped.set(key, current);
    });
    return [...grouped.entries()].map(([project, data]) => ({ project, ...data })).sort((a, b) => b.minutes - a.minutes).slice(0, 6);
  }, [tasks]);

  const priorityData = useMemo(() => {
    const maxCount = Math.max(1, ...priorityLabels.map((priority) => activeTasks.filter((task) => task.priority === priority).length));
    return priorityLabels.map((priority) => {
      const count = activeTasks.filter((task) => task.priority === priority).length;
      return { priority, count, percent: Math.round((count / maxCount) * 100) };
    });
  }, [activeTasks]);

  const weeklyData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => dayjs().subtract(6 - index, 'day'));
    const maxCount = Math.max(1, ...days.map((day) => tasks.filter((task) => task.completedAt && dayjs(task.completedAt).isSame(day, 'day')).length));
    return days.map((day) => {
      const count = tasks.filter((task) => task.completedAt && dayjs(task.completedAt).isSame(day, 'day')).length;
      return { label: day.format('dd'), count, height: Math.max(8, Math.round((count / maxCount) * 100)) };
    });
  }, [tasks]);

  const visibleTasks = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    return tasks
      .filter((task) => {
        if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
        if (projectFilter !== 'all' && (task.project || 'Inbox') !== projectFilter) return false;
        if (!query) return true;
        const searchable = [task.title, task.description, task.priority, task.status, task.project, task.energy, ...task.tags].join(' ').toLowerCase();
        return searchable.includes(query);
      })
      .sort((a, b) => {
        if (sortMode === 'priority') return priorityOrder[b.priority] - priorityOrder[a.priority];
        if (sortMode === 'dueDate') return (a.dueDate ? dayjs(a.dueDate).valueOf() : Infinity) - (b.dueDate ? dayjs(b.dueDate).valueOf() : Infinity);
        if (sortMode === 'estimate') return b.estimateMinutes - a.estimateMinutes;
        return dayjs(b.updatedAt).valueOf() - dayjs(a.updatedAt).valueOf();
      });
  }, [priorityFilter, projectFilter, searchText, sortMode, tasks]);

  const overdueValueStyle: CSSProperties = { color: stats.overdue ? '#f0b983' : undefined };
  const overdueStatisticStyles = { content: overdueValueStyle };

  const handleAction = (id: string, action: Action) => {
    if (action === 'edit') {
      const target = tasks.find((task) => task.id === id);
      setEditingTask(target ?? null);
      setSelectedTask(null);
      setIsModalOpen(true);
      return;
    }

    const now = new Date().toISOString();
    const updated = tasks.map((task) => {
      if (task.id !== id) return task;
      if (action === 'archive') return { ...task, status: 'deleted' as const, updatedAt: now };
      if (action === 'delete') return null;
      if (action === 'complete') return { ...task, status: settings.autoArchiveCompleted ? 'deleted' as const : 'completed' as const, completedAt: now, updatedAt: now };
      if (action === 'restore') return { ...task, status: 'active' as const, completedAt: undefined, updatedAt: now };
      return task;
    }).filter(Boolean) as Task[];

    persistTasks(updated);
    setSelectedTask((current) => (current?.id === id ? updated.find((task) => task.id === id) ?? null : current));
    message.success(action === 'delete' ? 'Task deleted forever' : action === 'archive' ? 'Task archived' : `Task ${action}d successfully`);
  };

  const handleSave = (values: TaskDraft) => {
    const now = new Date().toISOString();
    if (editingTask) {
      const updated = tasks.map((task) => (task.id === editingTask.id ? { ...task, ...values, updatedAt: now } : task));
      persistTasks(updated);
      message.success('Task updated');
    } else {
      const newTask: Task = { ...values, id: crypto.randomUUID(), status: 'active', createdAt: now, updatedAt: now };
      persistTasks([newTask, ...tasks]);
      message.success('Task created');
    }
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleExport = () => {
    const blob = new Blob([exportTasks(tasks)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `taskflow-export-${dayjs().format('YYYY-MM-DD')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (file: File) => {
    try {
      const payload = await file.text();
      const imported = parseImportedTasks(payload);
      persistTasks(imported);
      message.success(`Imported ${imported.length} tasks`);
    } catch {
      message.error('Import failed. Please select a valid TaskFlow JSON file.');
    }
  };

  const renderCards = (status: Task['status']) => {
    const list = visibleTasks.filter((task) => task.status === status);
    if (!list.length) return <Empty className="empty-state" description="No tasks found" />;
    return (
      <Row gutter={[18, 18]}>
        {list.map((task) => (
          <Col xs={24} md={12} xl={8} xxl={6} key={task.id}>
            <TaskCard task={task} settings={settings} onOpen={setSelectedTask} onAction={handleAction} />
          </Col>
        ))}
      </Row>
    );
  };

  const taskTimeline = selectedTask ? [
    { children: `Created ${dayjs(selectedTask.createdAt).format('DD MMM YYYY, HH:mm')}` },
    { children: `Estimated ${selectedTask.estimateMinutes} minutes · ${selectedTask.energy} energy` },
    { children: `Last updated ${dayjs(selectedTask.updatedAt).format('DD MMM YYYY, HH:mm')}` },
    ...(selectedTask.completedAt ? [{ color: 'green', children: `Completed ${dayjs(selectedTask.completedAt).format('DD MMM YYYY, HH:mm')}` }] : []),
  ] : [];

  return (
    <div className="dashboard">
      <section className="hero-panel hero-panel--product liquid-panel">
        <div className="hero-content">
          <p className="eyebrow mono">FOCUS COMMAND CENTER</p>
          <h1>Command your day.</h1>
          <p className="hero-copy">
            A premium productivity cockpit for capacity planning, deep-work focus and project health — not another plain to-do list.
          </p>
          <Space wrap className="hero-actions">
            <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => { setEditingTask(null); setIsModalOpen(true); }}>New task</Button>
            <Button size="large" icon={<DownloadOutlined />} onClick={handleExport}>Export backup</Button>
          </Space>
        </div>

        {settings.showFocusPanel && (
          <aside className="focus-queue-card">
            <div className="focus-queue-header">
              <span className="focus-icon"><ThunderboltOutlined /></span>
              <div><p className="mono muted">TODAY'S FOCUS</p><strong>{focusQueue.length ? 'Next best moves' : 'Clear queue'}</strong></div>
            </div>
            <div className="focus-queue-list">
              {focusQueue.length ? focusQueue.map((task, index) => (
                <button className="focus-row" key={task.id} type="button" onClick={() => setSelectedTask(task)}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <b>{task.title}</b>
                  <em>{task.dueDate ? dayjs(task.dueDate).format('MMM D') : `${task.estimateMinutes}m`}</em>
                </button>
              )) : <p className="muted">Create active tasks and the planner will build a queue.</p>}
            </div>
          </aside>
        )}
      </section>

      <Row gutter={[12, 12]} className="stats-grid product-stats">
        <Col xs={12} lg={6}><Card className="stat-card liquid-panel" variant="borderless"><Statistic title="Active" value={stats.active} /></Card></Col>
        <Col xs={12} lg={6}><Card className="stat-card liquid-panel" variant="borderless"><Statistic title="Planned work" value={formatHours(stats.plannedMinutes)} /></Card></Col>
        <Col xs={12} lg={6}><Card className="stat-card liquid-panel" variant="borderless"><Statistic title="Overdue" value={stats.overdue} styles={overdueStatisticStyles} /></Card></Col>
        <Col xs={12} lg={6}><Card className="stat-card liquid-panel" variant="borderless"><Statistic title="Done rate" value={stats.completionRate} suffix="%" /></Card></Col>
      </Row>

      {stats.workloadPercent > 100 && (
        <Alert className="workload-alert" type="warning" showIcon message="Capacity warning" description={`You planned ${formatHours(stats.plannedMinutes)} of work for a ${settings.dailyCapacityHours}h daily capacity. Move or split tasks before the day becomes overloaded.`} />
      )}

      <div className="board-panel liquid-panel">
        <div className="toolbar">
          <Input allowClear placeholder="Search tasks, projects, tags or status" prefix={<SearchOutlined />} value={searchText} onChange={(event) => setSearchText(event.target.value)} className="search-input" />
          <div className="toolbar-controls">
            <Select value={projectFilter} onChange={setProjectFilter} className="toolbar-select" options={[{ value: 'all', label: 'All projects' }, { value: 'Inbox', label: 'Inbox' }, ...projects.map((project) => ({ value: project, label: project }))]} />
            <Select value={priorityFilter} onChange={setPriorityFilter} className="toolbar-select" options={[{ value: 'all', label: 'All priorities' }, { value: 'urgent', label: 'Urgent' }, { value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' }]} />
            <Segmented value={sortMode} onChange={(value) => setSortMode(value as typeof sortMode)} options={[{ value: 'updated', label: 'Updated' }, { value: 'priority', label: 'Priority' }, { value: 'dueDate', label: 'Due' }, { value: 'estimate', label: 'Effort' }]} />
            <Upload beforeUpload={(file) => { void handleImport(file); return false; }} showUploadList={false} accept="application/json"><Button icon={<ImportOutlined />}>Import</Button></Upload>
          </div>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as DashboardTab)}
          items={[
            { key: 'active', label: `Board (${stats.active})`, children: renderCards('active') },
            { key: 'completed', label: `Done (${stats.completed})`, children: renderCards('completed') },
            { key: 'archive', label: `Archive (${stats.deleted})`, children: renderCards('deleted') },
            { key: 'planner', label: 'Planner', children: (
              <div className="planner-grid">
                <Card className="liquid-panel planner-card" variant="borderless">
                  <p className="mono muted">DAILY CAPACITY</p>
                  <div className="capacity-hero"><Progress type="dashboard" percent={stats.workloadPercent} strokeColor="#e8e4da" trailColor="rgba(255,255,255,.08)" /><div><h3>{formatHours(stats.plannedMinutes)}</h3><p className="muted">planned against {settings.dailyCapacityHours}h capacity</p></div></div>
                </Card>
                <Card className="liquid-panel planner-card" variant="borderless">
                  <p className="mono muted">PROJECT HEALTH</p>
                  {projectData.map((item) => (
                    <div className="project-row" key={item.project}><b>{item.project}</b><span>{item.active} active · {formatHours(item.minutes)}</span><Progress percent={Math.min(100, Math.round((item.minutes / Math.max(capacityMinutes, 1)) * 100))} showInfo={false} strokeColor="#e8e4da" trailColor="rgba(255,255,255,.08)" /></div>
                  ))}
                </Card>
                <Card className="liquid-panel planner-card" variant="borderless">
                  <p className="mono muted">SELLING POINT</p>
                  <div className="feature-stack">
                    <div><FieldTimeOutlined /><b>Effort estimates</b><span>People see if the day is realistic before starting.</span></div>
                    <div><FireOutlined /><b>Energy matching</b><span>Deep work, focus tasks and low-energy tasks are separated.</span></div>
                    <div><CalendarOutlined /><b>Deadline queue</b><span>The app recommends what to do next instead of just storing tasks.</span></div>
                  </div>
                </Card>
              </div>
            ) },
            { key: 'analytics', label: 'Insights', children: (
              <div className="analytics-grid premium-analytics">
                <Card className="liquid-panel chart-card" variant="borderless"><p className="mono muted">PRIORITY LOAD</p>{priorityData.map((item) => (<div className="bar-row" key={item.priority}><span>{item.priority}</span><div className="bar-track"><div className={`bar-fill bar-${item.priority}`} style={{ width: `${item.percent}%` }} /></div><b>{item.count}</b></div>))}</Card>
                <Card className="liquid-panel chart-card" variant="borderless"><p className="mono muted">7-DAY COMPLETION</p><div className="mini-chart">{weeklyData.map((item) => (<div className="mini-chart-column" key={item.label}><div className="mini-chart-bar" style={{ height: `${item.height}%` }} /><span>{item.label}</span></div>))}</div></Card>
                <Card className="liquid-panel chart-card smart-plan-card" variant="borderless"><p className="mono muted">SMART DAILY PLAN</p><h3>Next best moves</h3><ol className="smart-plan-list">{focusQueue.map((task) => <li key={task.id}>{task.title}</li>)}{!focusQueue.length && <li>Create active tasks to generate the queue.</li>}</ol><p className="muted">Auto-prioritizes urgent work and nearest deadlines.</p></Card>
                <Card className="liquid-panel chart-card focus-card" variant="borderless"><p className="mono muted">FOCUS INDEX</p><Progress type="circle" percent={stats.completionRate} strokeColor="#e8e4da" trailColor="rgba(255,255,255,0.08)" /><p className="muted">{stats.urgent} urgent · {stats.dueSoon} due soon · {stats.overdue} overdue</p></Card>
              </div>
            ) },
          ]}
        />
      </div>

      <Modal open={isModalOpen} onCancel={() => { setIsModalOpen(false); setEditingTask(null); }} footer={null} destroyOnHidden title={editingTask ? 'Edit task' : 'Create task'} width={760}>
        <TaskForm initialValues={editingTask} onSave={handleSave} />
      </Modal>

      <Modal open={Boolean(selectedTask)} onCancel={() => setSelectedTask(null)} footer={selectedTask ? [<Button key="edit" onClick={() => handleAction(selectedTask.id, 'edit')}>Edit</Button>, selectedTask.status === 'active' ? <Button key="complete" type="primary" onClick={() => handleAction(selectedTask.id, 'complete')}>Complete</Button> : <Button key="restore" type="primary" onClick={() => handleAction(selectedTask.id, 'restore')}>Restore</Button>] : null} title="Task intelligence" width={820} className="task-detail-modal">
        {selectedTask && (
          <div className="task-detail">
            <div className="task-detail-hero liquid-panel"><Tag>{selectedTask.priority.toUpperCase()}</Tag>{selectedTask.project && <Tag>{selectedTask.project}</Tag>}<Typography.Title level={2}>{selectedTask.title}</Typography.Title><Typography.Paragraph>{selectedTask.description || 'No description provided.'}</Typography.Paragraph><Space wrap>{selectedTask.tags.map((tag) => <Tag key={tag}>#{tag}</Tag>)}</Space></div>
            <Descriptions bordered column={1} size="small"><Descriptions.Item label="Status">{selectedTask.status}</Descriptions.Item><Descriptions.Item label="Project">{selectedTask.project || 'Inbox'}</Descriptions.Item><Descriptions.Item label="Estimate">{selectedTask.estimateMinutes} minutes · {selectedTask.energy}</Descriptions.Item><Descriptions.Item label="Due date">{selectedTask.dueDate ? dayjs(selectedTask.dueDate).format('DD MMM YYYY') : 'No due date'}</Descriptions.Item><Descriptions.Item label="Created">{dayjs(selectedTask.createdAt).format('DD MMM YYYY, HH:mm')}</Descriptions.Item></Descriptions>
            <Timeline className="task-timeline" items={taskTimeline} />
          </div>
        )}
      </Modal>
    </div>
  );
};
