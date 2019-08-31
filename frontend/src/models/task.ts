import {Effect} from 'dva';
import {saveTask} from "@/services/task";

// import {Reducer} from "redux";


export interface Task {
  _id: string;
  platform: string;
  status: string;
  category: string;
  tag: string;
}


export interface TaskModelState {
}

export interface TaskModelType {
  namespace: 'task';
  state: TaskModelState;
  effects: {
    saveTask: Effect;
  };
  reducers: {};
}

const TaskModel: TaskModelType = {
  namespace: 'task',

  state: {},

  effects: {
    * saveTask(action, {call}) {
      yield call(saveTask, action.payload)
    }
  },

  reducers: {},
};

export default TaskModel;
