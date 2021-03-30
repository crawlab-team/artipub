import request from '@/utils/request';

export type LoginParamsType = {
  userName: string;
  password: string;
};

export type RegisterParamsType = {
  email: string;
  userName: string;
  password: string;
  confirmPassword: string;

}

export async function loginApi(params: LoginParamsType) {
  return request('/users/login', {
    method: 'POST',
    data: params,
  });
}

export async function registerApi(params: RegisterParamsType) {
  const {confirmPassword, ...rest} = params;
  return request('/users/signup', {
    method: 'POST',
    data: rest,
  });
}


export async function getFakeCaptcha(mobile: string) {
  return request(`/api/login/captcha?mobile=${mobile}`);
}
