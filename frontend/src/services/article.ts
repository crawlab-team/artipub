import request from '@/utils/request';

export async function queryArticle(payload: any): Promise<any> {
  return request(`/articles/${payload.id}`);
}

export async function queryArticles(): Promise<any> {
  return request('/articles');
}

export async function saveArticle(payload: any): Promise<any> {
  return request.post(`/articles/${payload._id}`, {data: payload});
}

export async function addArticle(payload: any): Promise<any> {
  return request.put(`/articles`, {data: payload});
}

export async function deleteArticle(payload: any): Promise<any> {
  return request.delete(`/articles/${payload._id}`);
}

export async function publishArticle(payload: any): Promise<any> {
  return request.post(`/articles/${payload.id}/publish`);
}
