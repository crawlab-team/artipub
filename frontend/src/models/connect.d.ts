import {MenuDataItem} from '@ant-design/pro-layout';
import {GlobalModelState} from './global';
import {DefaultSettings as SettingModelState} from '../../config/defaultSettings';
import {UserModelState} from './user';
import { ArticleModelState } from "@/models/article";
import { PlatformModelState } from "@/models/platform";
import { TaskModelState } from "@/models/task";
import { EnvironmentModelState } from "@/models/environment";

export {GlobalModelState, SettingModelState, UserModelState};

export interface Loading {
  global: boolean;
  effects: { [key: string]: boolean | undefined };
  models: {
    global?: boolean;
    menu?: boolean;
    setting?: boolean;
    user?: boolean;
    article?: boolean;
    login?: boolean;
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
  template: TemplateModelState;
  environment: EnvironmentModelState;
  login: StateType;
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
