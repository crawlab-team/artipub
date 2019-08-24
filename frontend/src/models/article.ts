import {Effect} from 'dva';
// import { Reducer } from 'redux';

import {queryArticle, queryArticles, saveArticle} from '@/services/article';
import {Reducer} from "redux";

export interface Article {
  _id: string;
  title: string;
  content: string;
}

export interface ArticleModelState {
  articles?: Article[];
  currentArticleId?: string,
  currentArticle?: Article;
}

export interface ArticleModelType {
  namespace: 'article';
  state: ArticleModelState;
  effects: {
    fetchArticleList: Effect;
    fetchArticle: Effect;
    setArticleTitle: Effect;
    setArticleContent: Effect;
    saveCurrentArticle: Effect;
  };
  reducers: {
    saveArticle: Reducer<ArticleModelState>;
    saveArticleList: Reducer<ArticleModelState>;
    saveArticleTitle: Reducer<ArticleModelState>;
    saveArticleContent: Reducer<ArticleModelState>;
  };
}

const ArticleModel: ArticleModelType = {
  namespace: 'article',

  state: {
    articles: [],
    currentArticleId: undefined,
    currentArticle: undefined,
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

    * setArticleTitle(action, {put}) {
      yield put({
        type: 'saveArticleTitle',
        payload: action.payload
      })
    },
    * setArticleContent(action, {put}) {
      yield put({
        type: 'saveArticleContent',
        payload: action.payload
      })
    },
    * saveCurrentArticle(action, {state, call}) {
      yield call(saveArticle, action.payload);
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
    }
  },
};

export default ArticleModel;
