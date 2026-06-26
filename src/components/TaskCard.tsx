import dayjs from 'dayjs';
import { Button, Card, Popconfirm, Space, Tag, Tooltip, Typography } from 'antd';
import { CheckOutlined, DeleteOutlined, EditOutlined, EyeOutlined, InboxOutlined, UndoOutlined } from '@ant-design/icons';
import type { CSSProperties } from 'react';
import type { Task, UserSettings } from '../types/task';

type TaskAction = 'edit' | 'complete' | 'restore' | 'archive' | 'delete';

const priorityLabels = {
  low: 'LOW',
  medium: 'MEDIUM',
  high: 'HIGH',
  urgent: 'URGENT',
} as const;

const energyLabels = {
  low: 'LIGHT',
  medium: 'FOCUS',
  deep: 'DEEP',
} as const;

type Props = {
  task: Task;
  settings: UserSettings;
  onOpen: (task: Task) => void;
  onAction: (id: string, action: TaskAction) => void;
};

export const TaskCard = ({ task, settings, onOpen, onAction }: Props) => {
  const isOverdue = task.dueDate && task.status === 'active' && dayjs(task.dueDate).isBefore(dayjs(), 'day');
  const deleteMode = task.status === 'deleted';
  const popconfirmOkButtonProps = { danger: deleteMode };

  const bodyStyle: CSSProperties = {
    padding: settings.cardPadding,
    minHeight: settings.compactMode ? 210 : 286,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    zIndex: 2,
  };

  const cardStyles = { body: bodyStyle };
  const backgroundStyle: CSSProperties = {
    backgroundColor: task.background?.color || '#111',
    backgroundImage: task.background?.imageUrl ? `url(${task.background.imageUrl})` : undefined,
    opacity: task.background?.opacity ?? 0.12,
  };
  const titleStyle: CSSProperties = { fontSize: settings.headerFontSize };
  const descriptionStyle: CSSProperties = { fontSize: settings.descFontSize };
  const descriptionEllipsis = { rows: settings.compactMode ? 2 : 4 };

  return (
    <Card
      className={`task-card liquid-panel task-priority-${task.priority} ${settings.compactMode ? 'task-card--compact' : ''}`}
      variant="borderless"
      styles={cardStyles}
      onDoubleClick={() => onOpen(task)}
    >
      <div className="task-card-bg" style={backgroundStyle} />
      <div className="task-card-sheen" />
      <div className="task-card-gradient" />

      <div className="task-card-content">
        <div className="task-card-meta">
          <Tag className="premium-tag priority-tag">{priorityLabels[task.priority]}</Tag>
          <Tag className="premium-tag">{energyLabels[task.energy]}</Tag>
          {task.dueDate && (
            <Tag className={`premium-tag ${isOverdue ? 'danger-tag' : ''}`}>
              {isOverdue ? 'OVERDUE' : dayjs(task.dueDate).format('MMM D')}
            </Tag>
          )}
        </div>

        {task.project && <span className="task-project mono">{task.project}</span>}

        <Typography.Title level={4} className="task-title" style={titleStyle}>
          {task.title}
        </Typography.Title>

        <Typography.Paragraph className="task-description" style={descriptionStyle} ellipsis={descriptionEllipsis}>
          {task.description || 'No description provided.'}
        </Typography.Paragraph>

        <div className="task-tags">
          {task.tags.slice(0, 4).map((tag) => (
            <Tag key={tag} className="soft-tag">#{tag}</Tag>
          ))}
        </div>
      </div>

      <div className="task-card-footer">
        <span className="mono muted">{Math.round(task.estimateMinutes / 15) * 15} MIN · {dayjs(task.updatedAt).format('DD.MM.YY')}</span>
        <Space>
          <Tooltip title="Open details"><Button type="text" size="small" icon={<EyeOutlined />} onClick={() => onOpen(task)} /></Tooltip>
          {task.status === 'active' ? (
            <>
              <Tooltip title="Edit task"><Button type="text" size="small" icon={<EditOutlined />} onClick={() => onAction(task.id, 'edit')} /></Tooltip>
              <Tooltip title="Mark completed"><Button type="text" size="small" icon={<CheckOutlined />} onClick={() => onAction(task.id, 'complete')} /></Tooltip>
            </>
          ) : (
            <Tooltip title="Restore task"><Button type="text" size="small" icon={<UndoOutlined />} onClick={() => onAction(task.id, 'restore')} /></Tooltip>
          )}
          <Popconfirm
            title={deleteMode ? 'Delete this task forever?' : 'Move this task to archive?'}
            okText={deleteMode ? 'Delete forever' : 'Archive'}
            okButtonProps={popconfirmOkButtonProps}
            onConfirm={() => onAction(task.id, deleteMode ? 'delete' : 'archive')}
          >
            <Button type="text" size="small" danger icon={deleteMode ? <DeleteOutlined /> : <InboxOutlined />} />
          </Popconfirm>
        </Space>
      </div>
    </Card>
  );
};
