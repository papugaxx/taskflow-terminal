import { Button, Card, Form, InputNumber, Switch, Typography } from 'antd';
import type { UserSettings } from '../types/task';

const { Title, Paragraph } = Typography;

type Props = {
  settings: UserSettings;
  onSave: (settings: UserSettings) => void;
};

const NumberSetting = ({ label, helper, name, min, max, suffix }: { label: string; helper: string; name: keyof UserSettings; min: number; max: number; suffix?: string }) => (
  <Form.Item label={label} extra={helper} name={name}>
    <InputNumber min={min} max={max} addonAfter={suffix} className="settings-number" />
  </Form.Item>
);

export const Settings = ({ settings, onSave }: Props) => {
  const [form] = Form.useForm<UserSettings>();

  const handleFinish = (values: UserSettings) => {
    onSave({
      ...settings,
      ...values,
      cardPadding: Number(values.cardPadding),
      headerFontSize: Number(values.headerFontSize),
      descFontSize: Number(values.descFontSize),
      dailyCapacityHours: Number(values.dailyCapacityHours),
      focusSessionMinutes: Number(values.focusSessionMinutes),
      glassIntensity: 72,
      motionIntensity: values.reduceMotion ? 0 : 42,
      compactMode: Boolean(values.compactMode),
      silverMode: true,
      autoArchiveCompleted: Boolean(values.autoArchiveCompleted),
      showFocusPanel: Boolean(values.showFocusPanel),
      reduceMotion: Boolean(values.reduceMotion),
    });
  };

  return (
    <div className="settings-layout settings-layout--product">
      <Card className="settings-card liquid-panel" variant="borderless">
        <p className="eyebrow mono">PRODUCT SETTINGS</p>
        <Title level={3}>Workflow engine</Title>
        <Paragraph className="muted">
          These settings change how the planner works: daily capacity, focus blocks, automation and the density of the board.
        </Paragraph>

        <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={settings}>
          <div className="settings-grid-two">
            <NumberSetting label="Daily work capacity" helper="Used for workload forecast and overload warnings." name="dailyCapacityHours" min={1} max={14} suffix="h" />
            <NumberSetting label="Focus session length" helper="Used by the smart focus queue." name="focusSessionMinutes" min={15} max={120} suffix="min" />
            <NumberSetting label="Card spacing" helper="Controls board density without breaking the layout." name="cardPadding" min={12} max={28} suffix="px" />
            <NumberSetting label="Title size" helper="Keeps task cards readable on large screens." name="headerFontSize" min={15} max={24} suffix="px" />
          </div>

          <div className="settings-switch-grid product-switches">
            <Form.Item label="Show Today’s Focus" name="showFocusPanel" valuePropName="checked" extra="Turns the smart queue in the hero on or off.">
              <Switch />
            </Form.Item>
            <Form.Item label="Compact board" name="compactMode" valuePropName="checked" extra="Shows more cards when the backlog is large.">
              <Switch />
            </Form.Item>
            <Form.Item label="Auto-archive completed" name="autoArchiveCompleted" valuePropName="checked" extra="Keeps the active board clean for real work.">
              <Switch />
            </Form.Item>
            <Form.Item label="Reduce background motion" name="reduceMotion" valuePropName="checked" extra="Useful for long work sessions and accessibility.">
              <Switch />
            </Form.Item>
          </div>

          <Button type="primary" htmlType="submit" block size="large">
            Save workflow settings
          </Button>
        </Form>
      </Card>

      <Card className="settings-card liquid-panel settings-value-card" variant="borderless">
        <p className="mono muted">WHY THESE SETTINGS MATTER</p>
        <div className="value-list">
          <div><b>Capacity planning</b><span>Prevents overloading the day with more work than fits.</span></div>
          <div><b>Focus queue</b><span>Turns a messy backlog into the next few actions.</span></div>
          <div><b>Automation</b><span>Keeps completed work out of the way without deleting history.</span></div>
          <div><b>Accessibility</b><span>Motion and density can be adjusted for long sessions.</span></div>
        </div>
      </Card>
    </div>
  );
};
