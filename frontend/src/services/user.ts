import { request } from 'umi';

export async function query(): Promise<any> {
  // return request('/api/users');
  return request('/api/users', {
    method: 'GET',
  });
}

export async function queryCurrent(): Promise<any> {
  // return request('/api/currentUser');
  return request('/api/currentUser', {

  });
}

export async function queryNotices(): Promise<any> {
  return request('/api/notices');
}
