import request from '@/utils/request';

export async function getTemplateList(): Promise<any> {
    return request('/template/list');
}