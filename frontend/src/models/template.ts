import { Effect } from 'dva';
import { Reducer } from 'redux';
import { getTemplateList } from '@/services/template';

export interface Template {
    _id: string;
    name: string;
    content: string;
    contentHtml: string;
}

export interface TemplateModelState {
    templateList: Template[]
}

export interface TemplateModelType {
    namespace: 'template';
    state: TemplateModelState;
    effects: {
        getTemplateList: Effect
    };
    reducers: {
        templateList: Reducer;
    }
}

const TemplateModel: TemplateModelType= {
    namespace: 'template',

    state: {
        templateList: []
    },

    effects: {
        *getTemplateList(_, { call, put }) {
            const templateList = yield call(getTemplateList);
            yield put({
                type: 'templateList',
                payload: templateList
            });
        }
    },

    reducers: {
        templateList(state, action) {
            return {
                ...state,
                templateList: action.payload.data || []
            }
        }
    }
}

export default TemplateModel;