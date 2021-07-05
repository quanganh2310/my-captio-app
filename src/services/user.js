import request from '@/utils/request';

export async function query() {
  return request('/api/users');
}
export async function queryCurrent() {
  return request('/api/currentUser');
  // const data = JSON.parse(localStorage.getItem('user'));
  // if (data) {
    // return {
    //   name: data.userName,
    //   avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
    //   userid: data.userId,
    //   email: 'antdesign@alipay.com',
    // };
  // }
  // return {
  //   name: '',
  //   avatar: '',
  //   userid: '',
  //   email: '',
  // };

}
export async function queryNotices() {
  return request('/api/notices');
}
