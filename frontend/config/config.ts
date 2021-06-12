import { defineConfig } from 'umi';;
import defaultSettings from './defaultSettings'; // https://umijs.org/config/
import routes from './routes';

export default defineConfig({
  hash: true,
  antd: {},
  dva: {
    hmr: true,
  },
  history: {
    type: "browser",
  },
  locale: {
    // default zh-CN
    default: "zh-CN",
    // default true, when it is true, will use `navigator.language` overwrite default
    antd: true,
    baseNavigator: true,
  },
  dynamicImport: {
    loading: "@/components/PageLoading/index",
  },
  targets: {
    ie: 11,
  },
  routes,
  theme: {
    // ...darkTheme,
    "primary-color": defaultSettings.primaryColor,
  },

  ignoreMomentLocale: true,
  esbuild: {},
  manifest: {
    basePath: "/",
  },
  define: {
    "API_END_POINT": "http://localhost:3000",
  },
});
