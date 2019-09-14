import request from '@/utils/request';

export async function queryEnvironmentList(): Promise<any> {
  return request.get(`/environments`);
}

export async function addEnvironment(payload: any): Promise<any> {
  return request.put(`/environments`, { data: payload });
}

export async function saveEnvironment(payload: any): Promise<any> {
  return request.post(`/environments`, { data: payload });
}

export async function deleteEnvironment(payload: any): Promise<any> {
  return request.delete(`/environments`, { data: payload });
}

