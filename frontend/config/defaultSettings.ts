import { Settings as LayoutSettings } from '@ant-design/pro-layout';

const Settings: LayoutSettings & {
  pwa?: boolean;
  logo?: string;
} = {
  navTheme: 'dark',
  // 拂晓蓝
  primaryColor: '#1890ff',
  layout: 'side',
  contentWidth: 'Fluid',
  fixedHeader: false,
  fixSiderbar: false,
  colorWeak: false,
  title: 'ArtiPub',
  pwa: false,
  iconfontUrl: '',
  menu: {
    locale: true,
  },
};

export default Settings;