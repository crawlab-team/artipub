import { Effect } from 'dva';
import {
  addPlatform,
  deletePlatform,
  fetchPlatformArticles,
  queryPlatformList,
  savePlatform,
} from '@/services/platform';
import { Reducer } from 'redux';
import { message } from 'antd';

export interface Platform {
  _id?: string;
  name: string;
  label: string;
  editorType: string;
  description: string;
}

export interface SiteArticle {
  title: string;
  url: string;
  exists: boolean;
  articleId?: string;
  checked?: boolean;
}

export interface PlatformModelState {
  platforms?: Platform[];
  currentPlatform?: Platform;
  siteArticles?: SiteArticle[];
  modalVisible?: boolean;
  fetchModalVisible?: boolean;
  fetchLoading?: boolean;
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
    saveFetchModalVisible: Effect;
    fetchSiteArticles: Effect;
    saveSiteArticles: Effect;
  };
  reducers: {
    setPlatformList: Reducer<PlatformModelState>;
    setModalVisible: Reducer<PlatformModelState>;
    setFetchModalVisible: Reducer<PlatformModelState>;
    setCurrentPlatform: Reducer<PlatformModelState>;
    setSiteArticles: Reducer<PlatformModelState>;
    setFetchLoading: Reducer<PlatformModelState>;
  };
}

const PlatformModel: PlatformModelType = {
  namespace: 'platform',

  state: {
    platforms: [],
    modalVisible: false,
    fetchModalVisible: false,
    fetchLoading: false,
  },

  effects: {
    *fetchPlatformList(_, { call, put }) {
      const response = yield call(queryPlatformList);
      yield put({
        type: 'setPlatformList',
        payload: response.data,
      });
    },
    *savePlatform(action, { call }) {
      yield call(savePlatform, action.payload);
    },
    *addPlatform(action, { call }) {
      yield call(addPlatform, action.payload);
    },
    *deletePlatform(action, { call }) {
      yield call(deletePlatform, action.payload);
    },
    *saveCurrentPlatform(action, { put }) {
      yield put({
        type: 'setCurrentPlatform',
        payload: action.payload,
      });
    },
    *saveModalVisible(action, { put }) {
      yield put({
        type: 'setModalVisible',
        payload: action.payload,
      });
    },
    *saveFetchModalVisible(action, { put }) {
      yield put({
        type: 'setFetchModalVisible',
        payload: action.payload,
      });
    },
    *fetchSiteArticles(action, { call, put }) {
      yield put({
        type: 'setFetchLoading',
        payload: true,
      });
      const response = yield call(fetchPlatformArticles, action.payload);
      if (response) {
        yield put({
          type: 'setSiteArticles',
          payload: response.data.map((d: SiteArticle) => {
            d.checked = true;
            return d;
          }),
        });
      } else {
        message.error('获取文章发生错误');
      }
      yield put({
        type: 'setFetchLoading',
        payload: false,
      });
    },
    *saveSiteArticles(action, { put }) {
      yield put({
        type: 'setSiteArticles',
        payload: action.payload,
      });
    },
  },

  reducers: {
    setPlatformList(state, action) {
      return {
        ...state,
        platforms: action.payload,
      };
    },
    setModalVisible(state, action) {
      return {
        ...state,
        modalVisible: action.payload,
      };
    },
    setFetchModalVisible(state, action) {
      return {
        ...state,
        fetchModalVisible: action.payload,
      };
    },
    setCurrentPlatform(state, action) {
      return {
        ...state,
        currentPlatform: action.payload,
      };
    },
    setSiteArticles(state, action) {
      return {
        ...state,
        siteArticles: action.payload,
      };
    },
    setFetchLoading(state, action) {
      return {
        ...state,
        fetchLoading: action.payload,
      };
    },
  },
};

export default PlatformModel;
