import { Effect } from 'dva';
import { addTask, addTasks, queryTaskList, saveTask } from '@/services/task';
import { Reducer } from 'redux';
import {Platform} from "@/models/platform";
import {ConnectState} from "@/models/connect";

export interface Task {
  _id?: string;
  articleId: string;
  platformId: string;
  status?: string;
  category: string;
  tag: string;
  title: string;
  pubType: string;
  checked: boolean;
  url: string;
  ready?: boolean;
  error?: boolean;
  authType: string;
  readNum?: number;
  likeNum?: number;
  commentNum?: number;
  platform?: Platform;
  platformName?: string;
}

export interface TaskModelState {
  tasks: Task[];
  currentTask?: Task;
}

export interface TaskModelType {
  namespace: 'task';
  state: TaskModelState;
  effects: {
    fetchTaskList: Effect;
    addTasks: Effect;
    addTask: Effect;
    saveTask: Effect;
    saveTaskList: Effect;
    saveCurrentTask: Effect;
  };
  reducers: {
    setTaskList: Reducer<TaskModelState>;
    setCurrentTask: Reducer<TaskModelState>;
  };
}

const TaskModel: TaskModelType = {
  namespace: 'task',

  state: {
    tasks: [],
  },

  effects: {
    *fetchTaskList(action, { select, call, put }) {
      const response = yield call(queryTaskList, { id: action.payload.id });
      const newTasks: Task[] = response.data;
      const tasks: Task[] = yield select((state: ConnectState) => state.task.tasks);
      if (action.payload.updateStatus) {
        // 只更新状态
        for (let i = 0; i < tasks.length; i++) {
          const task = tasks[i];
          const newTask = newTasks.filter((t: Task) => t._id === task._id)[0];
          if (!newTask) continue;
          tasks[i].status = newTask.status;
          tasks[i].error = newTask.error;
          tasks[i].url = newTask.url;
        }
        yield put({
          type: 'setTaskList',
          payload: tasks,
        });
      } else {
        // 更新全部
        yield put({
          type: 'setTaskList',
          payload: response.data,
        });
      }
    },
    *addTasks(action, { call }) {
      yield call(addTasks, action.payload);
    },
    *addTask(action, { call }) {
      yield call(addTask, action.payload);
    },
    *saveTaskList(action, { put }) {
      yield put({
        type: 'setTaskList',
        payload: action.payload,
      });
    },
    *saveTask(action, { call }) {
      yield call(saveTask, action.payload);
    },
    *saveCurrentTask(action, { put }) {
      yield put({
        type: 'setCurrentTask',
        payload: action.payload,
      });
    },
  },

  reducers: {
    setCurrentTask(state, action) {
      if (!state)
        return {
          tasks: [],
        };
      return {
        ...state,
        currentTask: action.payload,
      };
    },
    setTaskList(state, action) {
      return {
        ...state,
        tasks: action.payload,
      };
    },
  },
};

export default TaskModel;
