import request from '@/utils/request';
import { parse } from 'querystring';

export const getPageQuery = () => parse(window.location.href.split('?')[1]);

export async function fakeAccountLogin(params) {
  return request('/api/login/account', {
    method: 'POST',
    data: params,
  });
}

export async function accountLogin(params) {
  return request('/account/login', {
    method: 'POST',
    data: params,
  }).then((response) => {
    console.log(response);
    return response;
  }).catch((error) => {
    console.log(error);
  });
}

export async function accountSignout() {
  return request('/user/logout');
}

export async function getFakeCaptcha(mobile) {
  return request(`/api/login/captcha?mobile=${mobile}`);
}
