import {Effect} from 'dva';
import {addPlatform, queryPlatformList, savePlatform} from "@/services/platform";
import {Reducer} from "redux";


export interface Platform {
  _id?: string;
  name: String,
  label: String,
  description: String,
}


export interface PlatformModelState {
  platforms?: Platform[];
  currentPlatform?: Platform;
  modalVisible?: boolean;
}

export interface PlatformModelType {
  namespace: 'platform';
  state: PlatformModelState;
  effects: {
    fetchPlatformList: Effect;
    savePlatform: Effect;
    addPlatform: Effect;
    saveCurrentPlatform: Effect;
    setModalVisible: Effect;
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
      console.log(response.data);
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
    * saveCurrentPlatform(action, {put}) {
      yield put({
        type: 'setCurrentPlatform',
        payload: action.payload,
      });
    },
    * setModalVisible(action, {put}) {
      yield put({
        type: 'saveModalVisible',
        payload: action.payload,
      });
    },
  },

  reducers: {
    setPlatformList(state, action) {
      // if (!state) return {...state};
      // const platforms: Platform[] = [];
      // action.payload.forEach((d: Platform) => {
      //   platforms.push(d);
      // });
      return {
        ...state,
        platforms: action.payload,
      }
    },
    setModalVisible(state, action) {
      return {
        ...state,
        modalVisible: action.payload,
      }
    },
    setCurrentPlatform(state, action) {
      return {
        ...state,
        currentPlatform: action.payload,
      }
    }
  },
};

export default PlatformModel;
