import { useEffect, useMemo, useState } from 'react';
import { ConfigProvider, Layout, Menu, theme } from 'antd';
import { AppstoreOutlined, BarChartOutlined, SettingOutlined } from '@ant-design/icons';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';
import { loadSettings, saveSettings } from './utils/storage';
import type { UserSettings } from './types/task';

const { Header, Content } = Layout;
type PageKey = 'dashboard' | 'analytics' | 'settings';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageKey>('dashboard');
  const [settings, setSettings] = useState<UserSettings>(() => loadSettings());

  useEffect(() => {
    const root = document.documentElement;
    const glassAlpha = Math.min(0.9, Math.max(0.48, settings.glassIntensity / 100));
    const motion = settings.reduceMotion ? 0 : Math.min(1, Math.max(0, settings.motionIntensity / 100));
    root.style.setProperty('--glass-alpha', String(glassAlpha));
    root.style.setProperty('--motion-scale', String(motion));
    root.dataset.silver = String(settings.silverMode);
  }, [settings]);

  const antdTheme = useMemo(
    () => ({
      algorithm: theme.darkAlgorithm,
      token: {
        colorPrimary: '#f5f5f0',
        colorBgBase: '#030303',
        colorTextBase: '#f6f6f3',
        colorBorder: 'rgba(255,255,255,.16)',
        borderRadius: 24,
        fontFamily: 'Inter, system-ui, sans-serif',
      },
      components: {
        Button: { borderRadius: 999, controlHeight: 44 },
        Card: { borderRadiusLG: 30 },
        Modal: { borderRadiusLG: 30 },
        Segmented: { borderRadius: 999 },
        Input: { borderRadius: 16 },
        Select: { borderRadius: 16 },
      },
    }),
    [],
  );

  const handleSaveSettings = (nextSettings: UserSettings) => {
    setSettings(nextSettings);
    saveSettings(nextSettings);
  };

  return (
    <ConfigProvider theme={antdTheme}>
      <Layout className="app-shell">
        <div className="liquid-canvas" aria-hidden="true" />
        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />

        <Header className="app-header liquid-panel">
          <div className="brand" aria-label="TaskFlow Terminal">
            <span className="brand-mark">TF</span>
            <span>
              <span className="brand-title">TaskFlow</span>
              <span className="brand-subtitle">CONTROL OS</span>
            </span>
          </div>

          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[currentPage]}
            onClick={(event) => setCurrentPage(event.key as PageKey)}
            className="top-menu"
            items={[
              { key: 'dashboard', icon: <AppstoreOutlined />, label: 'Board' },
              { key: 'analytics', icon: <BarChartOutlined />, label: 'Insights' },
              { key: 'settings', icon: <SettingOutlined />, label: 'Studio' },
            ]}
          />
        </Header>

        <Content className="app-content">
          {currentPage === 'settings' ? (
            <Settings settings={settings} onSave={handleSaveSettings} />
          ) : (
            <Dashboard key={currentPage} settings={settings} defaultTab={currentPage === 'analytics' ? 'analytics' : 'active'} />
          )}
        </Content>
      </Layout>
    </ConfigProvider>
  );
}
