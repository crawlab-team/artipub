import {Effect} from 'dva';
import {addPlatform, deletePlatform, queryPlatformList, savePlatform} from "@/services/platform";
import {Reducer} from "redux";

export interface Platform {
  _id?: string;
  name: string,
  label: string,
  description: string,
}

export interface PlatformModelState {
  platforms: Platform[];
  currentPlatform?: Platform;
  modalVisible: boolean;
}

export interface PlatformModelType {
  namespace: 'platform';
  state: PlatformModelState;
  effects: {
    fetchPlatformList: Effect;
    savePlatform: Effect;
    addPlatform: Effect;
    deletePlatform: Effect;
    saveCurrentPlatform: Effect;
    saveModalVisible: Effect;
  };
  reducers: {
    setPlatformList: Reducer<PlatformModelState>;
    setModalVisible: Reducer<PlatformModelState>;
    setCurrentPlatform: Reducer<PlatformModelState>;
  };
}

const PlatformModel: PlatformModelType = {
  namespace: 'platform',

  state: {
    platforms: [],
    modalVisible: false,
  },

  effects: {
    * fetchPlatformList(_, {call, put}) {
      const response = yield call(queryPlatformList);
      yield put({
        type: 'setPlatformList',
        payload: response.data,
      })
    },
    * savePlatform(action, {call}) {
      yield call(savePlatform, action.payload);
    },
    * addPlatform(action, {call}) {
      yield call(addPlatform, action.payload);
    },
    * deletePlatform(action, {call}) {
      yield call(deletePlatform, action.payload);
    },
    * saveCurrentPlatform(action, {put}) {
      yield put({
        type: 'setCurrentPlatform',
        payload: action.payload,
      });
    },
    * saveModalVisible(action, {put}) {
      yield put({
        type: 'setModalVisible',
        payload: action.payload,
      });
    },
  },

  reducers: {
    setPlatformList(state, action) {
      if (!state) return {
        platforms: [],
        modalVisible: false,
      };
      return {
        ...state,
        platforms: action.payload,
      }
    },
    setModalVisible(state, action) {
      if (!state) return {
        platforms: [],
        modalVisible: false,
      };
      return {
        ...state,
        modalVisible: action.payload,
      }
    },
    setCurrentPlatform(state, action) {
      if (!state) return {
        platforms: [],
        modalVisible: false,
      };
      return {
        ...state,
        currentPlatform: action.payload,
      }
    }
  },
};

export default PlatformModel;
