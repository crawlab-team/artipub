import request from '@/utils/request';

export async function queryPlatformList(): Promise<any> {
  return request.get(`/platforms`);
}

export async function addPlatform(payload: any): Promise<any> {
  return request.put(`/platforms`, { data: payload });
}

export async function savePlatform(payload: any): Promise<any> {
  return request.post(`/platforms/${payload._id}`, { data: payload });
}

export async function deletePlatform(payload: any): Promise<any> {
  return request.delete(`/platforms/${payload._id}`);
}

export async function fetchPlatformArticles(payload: any): Promise<any> {
  return request.get(`/platforms/${payload._id}/articles`);
}

export async function importPlatformArticles(payload: any): Promise<any> {
  return request.post(`/platforms/${payload.platformId}/articles`, { data: payload.siteArticles });
}

export async function updateCookieStatus(): Promise<any> {
  return request.post(`/platforms/checkCookies`);
}
