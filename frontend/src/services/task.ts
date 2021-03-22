import { request } from 'umi';

export async function queryTaskList(payload: any): Promise<any> {
  // return request.delete(`/environments`, { data: payload });
  return request(`/articles/${payload.id}/tasks`, {
    method: 'GET',
  });
}

export async function addTasks(payload: any): Promise<any> {
  // return request.put(`/tasks/batch`, { data: payload });
  return request(`/tasks/batch`, {
    method: 'PUT',
    data: payload,
  });
}

export async function addTask(payload: any): Promise<any> {
  // return request.put(`/tasks`, { data: payload });
  return request(`/tasks`, {
    method: 'PUT',
    data: payload,
  });
}

export async function saveTask(payload: any): Promise<any> {
  // return request.post(`/tasks/${payload._id}`, { data: payload });
  return request(`/tasks/${payload._id}`, {
    method: 'POST',
    data: payload,
  });
}
