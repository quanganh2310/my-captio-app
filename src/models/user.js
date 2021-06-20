import { queryCurrent, query as queryUsers } from '@/services/user';

const UserModel = {
  namespace: 'user',
  state: {
    currentUser: {},
  },
  effects: {
    *fetch(_, { call, put }) {
      const response = yield call(queryUsers);
      yield put({
        type: 'save',
        payload: response,
      });
    },

    *fetchCurrent(_, { call, put }) {
      // const response = yield call(queryCurrent);
      const currentUser = localStorage.getItem('user');
      if (currentUser) {
        const data = JSON.parse(currentUser);
        console.log(data);
        yield put({
          type: 'saveCurrentUser',
          payload: {
              name: 'admin',
              avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
              userid: 'admin',
              email: 'antdesign@alipay.com',
            },
        });
      }
      // else {
      //   yield put({
      //     type: 'saveCurrentUser',
      //     payload: {
            // name: 'admin',
            // avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
            // userid: 'admin',
            // email: 'antdesign@alipay.com',
      //     },
      //   });
      // }
    },
  },
  reducers: {
    saveCurrentUser(state, action) {
      return { ...state, currentUser: action.payload || {} };
    },

    changeNotifyCount(
      state = {
        currentUser: {},
      },
      action,
    ) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          notifyCount: action.payload.totalCount,
          unreadCount: action.payload.unreadCount,
        },
      };
    },
  },
};
export default UserModel;
