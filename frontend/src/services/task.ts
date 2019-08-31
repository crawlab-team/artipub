import request from '@/utils/request';

export async function queryTaskList(payload: any): Promise<any> {
  return request.get(`/articles/${payload.id}/tasks`);
}

export async function addTasks(payload: any): Promise<any> {
  return request.put(`/tasks/batch`, {data: payload});
}

export async function addTask(payload: any): Promise<any> {
  return request.put(`/tasks`, {data: payload});
}

export async function saveTask(payload: any): Promise<any> {
  return request.post(`/tasks/${payload._id}`, {data: payload});
}
