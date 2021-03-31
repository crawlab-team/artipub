import { Effect } from 'dva';
import { Reducer } from 'redux';

import { query as queryUsers, queryCurrent } from "@/services/user";

export interface CurrentUser {
  avatar?: string;
  name?: string;
  title?: string;
  group?: string;
  signature?: string;
  tags?: {
    key: string;
    label: string;
  }[];
  unreadCount?: number;
}

export interface UserModelState {
  currentUser: CurrentUser;
  isLogin: boolean;
}


export interface UserModelType {
  namespace: 'user';
  state: UserModelState;
  effects: {
    fetch: Effect;
    fetchCurrent: Effect;
    fetchLoginState: Effect;
  };
  reducers: {
    saveCurrentUser: Reducer<UserModelState>;
    changeNotifyCount: Reducer<UserModelState>;
    updateLoginState: Reducer<UserModelState>;
  };
}

const UserModel: UserModelType = {
  namespace: 'user',

  state: {
    currentUser: {},
    isLogin: false,
  },

  effects: {
    *fetch(_, { call, put }) {
      const response = yield call(queryUsers);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *fetchCurrent(_, { call, put }) {
      const response = yield call(queryCurrent);
      yield put({
        type: 'saveCurrentUser',
        payload: response,
      });
    },
    *fetchLoginState(_, { call, put }) {
      const isLogin = document.cookie.split(';').some((c) => c.split('=')[0] === 'apt')
      yield put({
        type: 'updateLoginState',
        payload: isLogin
      });
    }
  },

  reducers: {
    saveCurrentUser(state = {currentUser: {}, isLogin: false}, action) {
      return {
        ...state,
        currentUser: action.payload || {},
      };
    },
    updateLoginState(state = {currentUser: {}, isLogin: false}, action) {
      return {
        ...state,
        isLogin: action.payload
        }
    },
    changeNotifyCount(
      state = {currentUser: {}, isLogin: false},
      action,
    ) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          notifyCount: action.payload.totalCount,
          unreadCount: action.payload.unreadCount,
        },
      };
    },
  },
};

export default UserModel;
