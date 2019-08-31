import {Effect} from 'dva';
import {addTask, addTasks, queryTaskList, saveTask} from "@/services/task";
import {Reducer} from "redux";

export interface Task {
  _id?: string;
  articleId: string;
  platformId: string;
  status?: string;
  category: string;
  tag: string;
  checked: boolean;
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
    * fetchTaskList(action, {call, put}) {
      const response = yield call(queryTaskList);
      put({
        type: 'setTaskList',
        payload: response.data
      })
    },
    * addTasks(action, {call}) {
      yield call(addTasks, action.payload)
    },
    * addTask(action, {call}) {
      yield call(addTask, action.payload)
    },
    * saveTaskList(action, {put}) {
      yield put({
        type: 'setTaskList',
        payload: action.payload,
      })
    },
    * saveTask(action, {call}) {
      yield call(saveTask, action.payload)
    },
    * saveCurrentTask(action, {put}) {
      yield put({
        type: 'setCurrentTask',
        payload: action.payload,
      })
    }
  },

  reducers: {
    setCurrentTask(state, action) {
      if (!state) return {
        tasks: []
      };
      return {
        ...state,
        currentTask: action.payload,
      }
    },
    setTaskList(state, action) {
      return {
        ...state,
        tasks: action.payload
      }
    }
  },
};

export default TaskModel;
