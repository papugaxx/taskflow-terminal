import { useEffect } from 'react';
import { Button, DatePicker, Form, Input, InputNumber, Select } from 'antd';
import dayjs from 'dayjs';
import type { Task, TaskDraft, TaskEnergy, TaskPriority } from '../types/task';

type Props = {
  initialValues?: Task | null;
  onSave: (values: TaskDraft) => void;
};

type TaskFormValues = {
  title: string;
  description?: string;
  tags?: string[];
  priority?: TaskPriority;
  dueDate?: dayjs.Dayjs;
  project?: string;
  estimateMinutes?: number;
  energy?: TaskEnergy;
};

const priorityOptions: Array<{ value: TaskPriority; label: string }> = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const energyOptions: Array<{ value: TaskEnergy; label: string }> = [
  { value: 'low', label: 'Low energy' },
  { value: 'medium', label: 'Normal focus' },
  { value: 'deep', label: 'Deep work' },
];

export const TaskForm = ({ onSave, initialValues }: Props) => {
  const [form] = Form.useForm<TaskFormValues>();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        dueDate: initialValues.dueDate ? dayjs(initialValues.dueDate) : undefined,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ priority: 'medium', tags: [], estimateMinutes: 60, energy: 'medium' });
    }
  }, [initialValues, form]);

  const handleFinish = (values: TaskFormValues) => {
    onSave({
      title: values.title.trim(),
      description: values.description?.trim() || '',
      tags: values.tags || [],
      priority: values.priority || 'medium',
      dueDate: values.dueDate?.toISOString?.(),
      project: values.project?.trim() || undefined,
      estimateMinutes: Number(values.estimateMinutes ?? 60),
      energy: values.energy || 'medium',
      background: {
        color: '#101010',
        opacity: 0.12,
      },
    });
  };

  return (
    <Form form={form} onFinish={handleFinish} layout="vertical" className="task-form">
      <Form.Item name="title" label="Task title" rules={[{ required: true, message: 'Please enter a task title' }]}>
        <Input placeholder="e.g. Launch landing page" maxLength={80} showCount />
      </Form.Item>

      <Form.Item name="description" label="Description">
        <Input.TextArea rows={4} placeholder="Add context, acceptance criteria or next steps..." />
      </Form.Item>

      <div className="form-grid">
        <Form.Item name="project" label="Project / Area">
          <Input placeholder="Marketing, Portfolio, Client work..." />
        </Form.Item>
        <Form.Item name="priority" label="Priority">
          <Select options={priorityOptions} />
        </Form.Item>
      </div>

      <div className="form-grid">
        <Form.Item name="dueDate" label="Due date">
          <DatePicker className="full-width" />
        </Form.Item>
        <Form.Item name="estimateMinutes" label="Estimate">
          <InputNumber min={15} max={480} step={15} addonAfter="min" className="full-width" />
        </Form.Item>
      </div>

      <div className="form-grid">
        <Form.Item name="energy" label="Energy type">
          <Select options={energyOptions} />
        </Form.Item>
        <Form.Item name="tags" label="Tags">
          <Select mode="tags" placeholder="frontend, docs, bug..." tokenSeparators={[',']} />
        </Form.Item>
      </div>

      <Button type="primary" htmlType="submit" block size="large">
        Save task
      </Button>
    </Form>
  );
};
