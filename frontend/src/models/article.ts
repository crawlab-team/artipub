import {Effect} from 'dva';
// import { Reducer } from 'redux';

import {addArticle, deleteArticle, publishArticle, queryArticle, queryArticles, saveArticle} from '@/services/article';
import {Reducer} from "redux";

export interface Article {
  _id?: string;
  title: string;
  content: string;
}

export interface Platform {
  label: string;
  name: string;
  icon?: string;
  checked?: boolean;
}

export interface ArticleModelState {
  articles?: Article[];
  currentArticleId?: string;
  currentArticle?: Article;
  pubModalVisible?: boolean;
  platformList?: Platform[];
}

export interface ArticleModelType {
  namespace: 'article';
  state: ArticleModelState;
  effects: {
    fetchArticleList: Effect;
    fetchArticle: Effect;
    newArticle: Effect;
    resetArticle: Effect;
    setArticleTitle: Effect;
    setArticleContent: Effect;
    saveCurrentArticle: Effect;
    deleteArticle: Effect;
    setPubModalVisible: Effect;
    resetPlatform: Effect;
    checkPlatform: Effect;
    publishArticle: Effect;
  };
  reducers: {
    saveArticle: Reducer<ArticleModelState>;
    saveArticleList: Reducer<ArticleModelState>;
    saveArticleTitle: Reducer<ArticleModelState>;
    saveArticleContent: Reducer<ArticleModelState>;
    savePubModalVisible: Reducer<ArticleModelState>;
    resetPlatform: Reducer<ArticleModelState>;
    checkPlatform: Reducer<ArticleModelState>;
  };
}

const defaultPlatformList: Platform[] = [
  {
    label: '掘金',
    name: 'juejin',
    icon: '@/assets/img/juejin-logo.svg',
    checked: true,
  },
  {
    label: 'SegmentFault',
    name: 'segmentfault',
    checked: true,
  },
  {
    label: '简书',
    name: 'jianshu',
    checked: true,
  },
];

const ArticleModel: ArticleModelType = {
  namespace: 'article',

  state: {
    articles: [],
    currentArticleId: undefined,
    currentArticle: {title: '', content: ''},
    pubModalVisible: false,
    platformList: JSON.parse(JSON.stringify(defaultPlatformList)),
  },

  effects: {
    * fetchArticle(action, {call, put}) {
      const response = yield call(queryArticle, action.payload);
      yield put({
        type: 'saveArticle',
        payload: response.data,
      });
    },

    * fetchArticleList(_, {call, put}) {
      const response = yield call(queryArticles);
      yield put({
        type: 'saveArticleList',
        payload: response.data,
      });
    },

    * newArticle(action, {call, put}) {
      const response = yield call(addArticle, action.payload);
      yield put({
        type: 'saveArticle',
        payload: response.data
      });
    },

    * resetArticle(_, {put}) {
      yield put({
        type: 'saveArticle',
        payload: {title: '', content: ''}
      });
    },

    * setArticleTitle(action, {put}) {
      yield put({
        type: 'saveArticleTitle',
        payload: action.payload,
      })
    },

    * setArticleContent(action, {put}) {
      yield put({
        type: 'saveArticleContent',
        payload: action.payload,
      })
    },

    * saveCurrentArticle(action, {call, put}) {
      if (action.payload._id) {
        yield call(saveArticle, action.payload);
      } else {
        const response = yield call(saveArticle, action.payload);
        yield put({
          type: 'saveArticle',
          payload: response.data,
        })
      }
    },

    * deleteArticle(action, {call}) {
      yield call(deleteArticle, action.payload);
    },

    * setPubModalVisible(action, {put}) {
      yield put({
        type: 'savePubModalVisible',
        payload: action.payload,
      })
    },

    * resetPlatform(action, {put}) {
      yield put({
        type: 'resetPlatformList',
        payload: action.payload,
      })
    },

    * checkPlatform(action, {put}) {
      yield put({
        type: 'checkPlatformList',
        payload: action.payload,
      })
    },

    * publishArticle(action, {call}) {
      yield call(publishArticle, action.payload)
    }
  },

  reducers: {
    saveArticle(state, action) {
      return {
        ...state,
        currentArticle: action.payload,
      }
    },
    saveArticleList(state, action) {
      return {
        ...state,
        articles: action.payload,
      }
    },
    saveArticleTitle(state, action) {
      if (!state || !state.currentArticle) return {...state};
      const currentArticle = state.currentArticle;
      currentArticle.title = action.payload.title;
      return {
        ...state,
        currentArticle
      }
    },
    saveArticleContent(state, action) {
      if (!state || !state.currentArticle) return {...state};
      const currentArticle = state.currentArticle;
      currentArticle.content = action.payload.content;
      return {
        ...state,
        currentArticle
      }
    },
    savePubModalVisible(state, action) {
      return {
        ...state,
        pubModalVisible: action.payload,
      }
    },
    resetPlatform(state, action) {
      if (!state || !state.platformList) return {...state};
      console.log(action.payload);
      state.platformList.forEach(d => {
        d.checked = action.payload;
      });
      return {
        ...state,
      }
    },
    checkPlatform(state, action) {
      if (!state || !state.platformList) return {...state};
      const {name, checked} = action.payload;
      state.platformList.forEach(d => {
        if (name === d.name) {
          d.checked = checked;
        }
      });
      return {
        ...state,
      }
    }
  },
};

export default ArticleModel;
