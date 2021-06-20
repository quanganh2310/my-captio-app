import { stringify } from 'querystring';
import { history } from 'umi';
import { accountLogin,
  // accountSignout,
  // fakeAccountLogin
} from '@/services/login';
import { setAuthority } from '@/utils/authority';
import { getPageQuery } from '@/utils/utils';
import { message } from 'antd';

const Model = {
  namespace: 'login',
  state: {
    status: undefined,
  },
  effects: {
    *login({ payload }, { call, put }) {
      const response = yield call(accountLogin, payload);
      // const response = yield call(fakeAccountLogin, payload);
      yield put({
        type: 'changeLoginStatus',
        payload: response,
      }); // Login successfully

      if (response.status === 'ok') {
        localStorage.setItem("user", JSON.stringify(response));
        // yield put({
        //   type: 'changeLoginStatus',
        //   payload: response,
        // }); // Login successfully
        const urlParams = new URL(window.location.href);
        const params = getPageQuery();
        message.success('🎉 🎉 🎉  Login successful！');
        let { redirect } = params;

        if (redirect) {
          const redirectUrlParams = new URL(redirect);

          if (redirectUrlParams.origin === urlParams.origin) {
            redirect = redirect.substr(urlParams.origin.length);

            if (window.routerBase !== '/') {
              redirect = redirect.replace(window.routerBase, '/');
            }

            if (redirect.match(/^\/.*#/)) {
              redirect = redirect.substr(redirect.indexOf('#') + 1);
            }
          } else {
            window.location.href = '/';
            return;
          }
        }
        // redirect = redirect === 'user/login'? '/':redirect;
        history.replace(redirect || '/');
      }
    },

    // logout() {
    //   const { redirect } = getPageQuery(); // Note: There may be security issues, please note

    //   if (window.location.pathname !== '/user/login' && !redirect) {
    //     history.replace({
    //       pathname: '/user/login',
    //       search: stringify({
    //         redirect: window.location.href,
    //       }),
    //     });
    //   }
    // },
    logout() {
      localStorage.removeItem("user");
      // If it is not the login interface, jump to the login interface
        const { redirect } = getPageQuery(); // Note: There may be security issues, please note

      if (window.location.pathname !== 'user/login' && !redirect) {
        history.replace({
          pathname: 'user/login',
          search: stringify({
            redirect: window.location.href,
          }),
        });
      }
    },
    // *logout({ payload }, { call, put }) {
    //   const response = yield call(accountSignout, payload);
    //   // const data = yield call(logoutUser);
    //   if (response.status === 'ok') {
    //     const { redirect } = getPageQuery(); // Note: There may be security issues, please note

    //   if (window.location.pathname !== '/login' && !redirect) {
    //     history.replace({
    //       pathname: '/login',
    //       search: stringify({
    //         redirect: window.location.href,
    //       }),
    //     });
    //   }
    //   };
    // },
  },
  reducers: {
    changeLoginStatus(state, { payload }) {
      setAuthority(payload.currentAuthority);
      return { ...state, status: payload.status, type: payload.type };
    },
  },
  // reducers: {  // effect to obtain data processing method
  //   changeLoginStatus(state, { payload }) {
  //     localStorage.setItem("token", payload.data.token);
  //     localStorage.setItem("roles", payload.data.auth);
  //     console.log(`login, ${payload.data.auth}`);
  //     return { ...state};
  //   },
  // },
};
export default Model;
