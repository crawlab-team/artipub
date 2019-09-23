import { Effect } from 'dva';
import {
  addArticle,
  deleteArticle,
  publishArticle,
  queryArticle,
  queryArticles,
  saveArticle,
} from '@/services/article';
import { Reducer } from 'redux';

export interface Article {
  _id?: string;
  title: string;
  content: string;
  contentHtml: string;
  platformIds: string[];
  readNum?: number;
  likeNum?: number;
  commentNum?: number;
}

export interface ArticleModelState {
  articles?: Article[];
  currentArticleId?: string;
  currentArticle?: Article;
  pubModalVisible?: boolean;
  platformModalVisible?: boolean;
  fetchHandle?: number;
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
    setArticleContentHtml: Effect;
    setArticlePlatformIds: Effect;
    saveCurrentArticle: Effect;
    deleteArticle: Effect;
    setPubModalVisible: Effect;
    publishArticle: Effect;
    setPlatformModalVisible: Effect;
    setFetchHandle: Effect;
  };
  reducers: {
    saveArticle: Reducer<ArticleModelState>;
    saveArticleList: Reducer<ArticleModelState>;
    saveArticleTitle: Reducer<ArticleModelState>;
    saveArticleContent: Reducer<ArticleModelState>;
    saveArticleContentHtml: Reducer<ArticleModelState>;
    saveArticlePlatformIds: Reducer<ArticleModelState>;
    savePubModalVisible: Reducer<ArticleModelState>;
    savePlatformModalVisible: Reducer<ArticleModelState>;
    saveFetchHandle: Reducer<ArticleModelState>;
  };
}

const ArticleModel: ArticleModelType = {
  namespace: 'article',

  state: {
    articles: [],
    currentArticleId: undefined,
    currentArticle: { title: '', content: '', contentHtml: '', platformIds: [] },
    pubModalVisible: false,
    platformModalVisible: false,
    fetchHandle: undefined,
  },

  effects: {
    *fetchArticle(action, { call, put }) {
      const response = yield call(queryArticle, action.payload);
      yield put({
        type: 'saveArticle',
        payload: response.data,
      });
    },

    *fetchArticleList(_, { call, put }) {
      const response = yield call(queryArticles);
      yield put({
        type: 'saveArticleList',
        payload: response.data,
      });
    },

    *newArticle(action, { call, put }) {
      const response = yield call(addArticle, action.payload);
      yield put({
        type: 'saveArticle',
        payload: response.data,
      });
    },

    *resetArticle(_, { put }) {
      yield put({
        type: 'saveArticle',
        payload: { title: '', content: '' },
      });
    },

    *setArticleTitle(action, { put }) {
      yield put({
        type: 'saveArticleTitle',
        payload: action.payload,
      });
    },

    *setArticleContent(action, { put }) {
      yield put({
        type: 'saveArticleContent',
        payload: action.payload,
      });
    },

    *setArticleContentHtml(action, { put }) {
      yield put({
        type: 'saveArticleContentHtml',
        payload: action.payload,
      });
    },

    *setArticlePlatformIds(action, { put }) {
      yield put({
        type: 'saveArticlePlatformIds',
        payload: action.payload,
      });
    },

    *saveCurrentArticle(action, { call, put }) {
      if (action.payload._id) {
        yield call(saveArticle, action.payload);
      } else {
        const response = yield call(saveArticle, action.payload);
        yield put({
          type: 'saveArticle',
          payload: response.data,
        });
      }
    },

    *deleteArticle(action, { call }) {
      yield call(deleteArticle, action.payload);
    },

    *setPubModalVisible(action, { put }) {
      yield put({
        type: 'savePubModalVisible',
        payload: action.payload,
      });
    },

    *publishArticle(action, { call }) {
      yield call(publishArticle, action.payload);
    },

    *setPlatformModalVisible(action, { put }) {
      yield put({
        type: 'savePlatformModalVisible',
        payload: action.payload,
      });
    },

    *setFetchHandle(action, { put }) {
      yield put({
        type: 'saveFetchHandle',
        payload: action.payload,
      });
    },
  },

  reducers: {
    saveArticle(state, action) {
      return {
        ...state,
        currentArticle: action.payload,
      };
    },
    saveArticleList(state, action) {
      return {
        ...state,
        articles: action.payload,
      };
    },
    saveArticleTitle(state, action) {
      if (!state || !state.currentArticle) return { ...state };
      const currentArticle = state.currentArticle;
      currentArticle.title = action.payload.title;
      return {
        ...state,
        currentArticle,
      };
    },
    saveArticleContent(state, action) {
      if (!state || !state.currentArticle) return { ...state };
      const currentArticle = state.currentArticle;
      currentArticle.content = action.payload.content;
      currentArticle.contentHtml = action.payload.contentHtml;
      return {
        ...state,
        currentArticle,
      };
    },
    saveArticleContentHtml(state, action) {
      if (!state || !state.currentArticle) return { ...state };
      const currentArticle = state.currentArticle;
      currentArticle.contentHtml = action.payload.contentHtml;
      return {
        ...state,
        currentArticle,
      };
    },
    saveArticlePlatformIds(state, action) {
      if (!state || !state.currentArticle) return { ...state };
      const currentArticle = state.currentArticle;
      currentArticle.platformIds = action.payload;
      return {
        ...state,
        currentArticle,
      };
    },
    savePubModalVisible(state, action) {
      return {
        ...state,
        pubModalVisible: action.payload,
      };
    },
    savePlatformModalVisible(state, action) {
      return {
        ...state,
        platformModalVisible: action.payload,
      };
    },
    saveFetchHandle(state, action) {
      return {
        ...state,
        fetchHandle: action.payload,
      };
    },
  },
};

export default ArticleModel;
