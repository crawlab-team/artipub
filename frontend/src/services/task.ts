import request from '@/utils/request';

export async function saveTask(payload: any): Promise<any> {
  return request.post(`/tasks/${payload._id}`, {data: payload});
}
