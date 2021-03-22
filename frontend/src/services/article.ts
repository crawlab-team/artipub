import { request } from 'umi';

export async function queryArticle(payload: any): Promise<any> {
  // return request(`/articles/${payload.id}`);
  return request(`/articles/${payload.id}`, {
    method: 'GET',
  });

}

export async function queryArticles(): Promise<any> {
  // return request('/articles');
  return request('/articles', {
    method: 'GET',
  });
}

export async function saveArticle(payload: any): Promise<any> {
  // return request.post(`/articles/${payload._id}`, { data: payload });
  return request(`/articles/${payload._id}`, {
    method: 'POST',
    data: payload,
  });
}

export async function addArticle(payload: any): Promise<any> {
  // return request.put(`/articles`, { data: payload });
  return request(`/articles`, {
    method: 'PUT',
    data: payload,
  });
}

export async function deleteArticle(payload: any): Promise<any> {
  // return request.delete(`/articles/${payload._id}`);
  return request(`/articles/${payload._id}`, {
    method: 'DELETE',
  });
}

export async function publishArticle(payload: any): Promise<any> {
  // return request.post(`/articles/${payload.id}/publish`);
  return request(`/articles/${payload.id}/publish`, {
    method: 'POST',
  });
}
