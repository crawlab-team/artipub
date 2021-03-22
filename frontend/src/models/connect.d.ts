import type { MenuDataItem } from '@ant-design/pro-layout';
import { GlobalModelState } from './global';
// import {DefaultSettings as SettingModelState} from '../../config/defaultSettings';
import { UserModelState } from './user';
import type { ArticleModelState } from '@/models/article';
import type { PlatformModelState } from '@/models/platform';
import type { TaskModelState } from '@/models/task';
import type { EnvironmentModelState } from '@/models/environment';

export { GlobalModelState, SettingModelState, UserModelState };

export interface Loading {
  global: boolean;
  effects: Record<string, boolean | undefined>;
  models: {
    global?: boolean;
    menu?: boolean;
    setting?: boolean;
    user?: boolean;
    article?: boolean;
  };
}

export interface ConnectState {
  global: GlobalModelState;
  loading: Loading;
  settings: SettingModelState;
  user: UserModelState;
  article: ArticleModelState;
  platform: PlatformModelState;
  task: TaskModelState;
  environment: EnvironmentModelState;
}

/**
 * @type P: Type of payload
 * @type C: Type of callback
 */
export type Dispatch = <P = any, C = (payload: P) => void>(action: {
  type: string;
  payload?: P;
  callback?: C;
  [key: string]: any;
}) => any;

export interface Route extends MenuDataItem {
  routes?: Route[];
}
