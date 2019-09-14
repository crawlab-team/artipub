import {Effect} from 'dva';
import {Reducer} from 'redux';
import {queryEnvironmentList, saveEnvironment} from "@/services/environment";

export interface Environment {
  _id?: string;
  value?: string;
}

export interface EnvironmentModelState {
  environments?: Environment[];
}

export interface EnvironmentModelType {
  namespace: 'environment';
  state: EnvironmentModelState;
  effects: {
    fetchEnvironmentList: Effect;
    saveEnvironment: Effect;
    saveEnvironmentList: Effect;
  };
  reducers: {
    setEnvironmentList: Reducer<EnvironmentModelState>;
  };
}

const EnvironmentModel: EnvironmentModelType = {
  namespace: 'environment',

  state: {
    environments: [],
  },

  effects: {
    * fetchEnvironmentList(_, {call, put}) {
      const response = yield call(queryEnvironmentList);
      yield put({
        type: 'setEnvironmentList',
        payload: response.data,
      });
    },
    * saveEnvironment(action, {call, put}) {
      yield call(saveEnvironment, action.payload);
    },
    * saveEnvironmentList(action, {put}) {
      yield put({
        type: 'setEnvironmentList',
        payload: action.payload,
      })
    }
  },

  reducers: {
    setEnvironmentList(state, action) {
      return {
        ...state,
        environments: action.payload,
      };
    },
  },
};

export default EnvironmentModel;
