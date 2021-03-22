import { request } from 'umi';

export async function queryEnvironmentList(): Promise<any> {
  // return request.get(`/environments`);
  return request(`/environments`, {
    method: 'GET',
  });
}

export async function addEnvironment(payload: any): Promise<any> {
  // return request.put(`/environments`, { data: payload });
  return request(`/environments`, {
    method: 'PUT',
    data: payload,
  });
}

export async function saveEnvironment(payload: any): Promise<any> {
  // return request.post(`/environments`, { data: payload });
  return request(`/environments`, {
    method: 'POST',
    data: payload
  });
}

export async function deleteEnvironment(payload: any): Promise<any> {
  // return request.delete(`/environments`, { data: payload });
  return request(`/environments`, {
    method: 'DELETE',
    data: payload
  });
}

