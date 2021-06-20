/** Request 网络请求工具 更详细的 api 文档: https://github.com/umijs/umi-request */
import { extend } from 'umi-request';
import { notification } from 'antd';

const codeMessage = {
  200: 'Máy chủ đã trả về thành công dữ liệu được yêu cầu.',
  201: 'Dữ liệu mới hoặc sửa đổi thành công.',
  202: 'Dữ liệu mới hoặc sửa đổi thành công.',
  204: 'Xóa dữ liệu thành công.',
  400: 'Yêu cầu đã được phát hành với một lỗi. Máy chủ không tạo hoặc sửa đổi dữ liệu.',
  401: 'Người dùng không có quyền (mã thông báo, tên người dùng, lỗi mật khẩu).',
  403: 'Người dùng được ủy quyền nhưng quyền truy cập bị cấm.',
  404: 'Không thấy trang yêu cầu',
  406: 'Định dạng được yêu cầu không khả dụng.',
  410: 'Tài nguyên được yêu cầu sẽ bị xóa vĩnh viễn và sẽ không còn khả dụng nữa.',
  422: 'Đã xảy ra lỗi xác thực khi tạo đối tượng.',
  500: 'Đã xảy ra lỗi trên máy chủ. Vui lòng kiểm tra máy chủ.',
  502: 'Bad gateway.',
  503: 'The service is unavailable and the server is temporarily overloaded or maintained.',
  504: 'Đã hết thời gian chờ của cổng.',
};
/** 异常处理程序 */

const errorHandler = (error) => {
  const { response } = error;

  if (response && response.status) {
    const errorText = codeMessage[response.status] || response.statusText;
    const { status, url } = response;
    notification.error({
      message: `请求错误 ${status}: ${url}`,
      description: errorText,
    });
  } else if (!response) {
    notification.error({
      description: '您的网络发生异常，无法连接服务器',
      message: '网络异常',
    });
  }

  return response;
};
/** 配置request请求时的默认参数 */

const request = extend({
  errorHandler,
  // 默认错误处理
  credentials: 'include', // 默认请求是否带上cookie
});
export default request;
