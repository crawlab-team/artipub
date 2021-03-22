import { request } from 'umi';

export async function queryPlatformList(): Promise<any> {
  // return request.get(`/platforms`);
  return request(`/platforms`, {
    method: 'GET',
  });
}

export async function addPlatform(payload: any): Promise<any> {
  // return request.put(`/platforms`, { data: payload });
  return request(`/platforms`, {
    method: 'GET',
    data: payload,
  });
}

export async function savePlatform(payload: any): Promise<any> {
  // return request.post(`/platforms/${payload._id}`, { data: payload });
  return request(`/platforms/${payload._id}`, {
    method: 'POST',
    data: payload
  });
}

export async function deletePlatform(payload: any): Promise<any> {
  // return request.delete(`/platforms/${payload._id}`);
  return request(`/platforms/${payload._id}`, {
    method: 'DELETE',
  });
}

export async function fetchPlatformArticles(payload: any): Promise<any> {
  // return request.get(`/platforms/${payload._id}/articles`);
  return request(`/platforms/${payload._id}/articles`, {
    method: 'GET',
  });
}

export async function importPlatformArticles(payload: any): Promise<any> {
  // return request.post(`/platforms/${payload.platformId}/articles`, { data: payload.siteArticles });
  return request(`/platforms/${payload.platformId}/articles`, {
    method: 'POST',
    data: payload.siteArticles,
  });

}

export async function updateCookieStatus(): Promise<any> {
  // return request.post(`/platforms/checkCookies`);
  return request(`/platforms/checkCookies`, {
    method: 'POST',
  });
}
