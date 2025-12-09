/**
 * Translates backend error messages to Vietnamese
 * Handles all AppResponseCode status codes from backend
 */
export const translateError = (error: unknown): string => {
  const errorObj = error as {
    response?: { data?: { message?: string; statusCode?: number } };
    message?: string;
    status?: number;
  };

  const message = errorObj?.response?.data?.message || errorObj?.message || '';
  const statusCode = errorObj?.response?.data?.statusCode || errorObj?.status;

  // Handle null reference errors from backend
  if (message.includes('Value cannot be null') || message.includes('Parameter')) {
    return 'Dữ liệu không tồn tại hoặc đã bị xóa';
  }

  // Handle specific status codes from AppResponseCode
  switch (statusCode) {
    case 101:
      return message || 'Thiếu cấu hình tài khoản quản trị viên';

    case 400:
      if (message.includes('already exists') || message.includes('tồn tại')) {
        return message || 'Dữ liệu đã tồn tại';
      }
      if (message.includes('invalid') || message.includes('không hợp lệ')) {
        return message || 'Dữ liệu không hợp lệ';
      }
      return message || 'Tệp tin không hợp lệ';

    case 401:
      return message || 'Hành động không hợp lệ';

    case 402:
      return message || 'Email chưa được xác thực';

    case 403:
      // ACCOUNT_LOCKED
      if (message.includes('khóa') || message.includes('locked') || message.includes('lockout')) {
        return message || 'Tài khoản đã bị khóa';
      }
      return message || 'Tài khoản đã bị khóa';

    case 404:
      return message || 'Tài khoản không hợp lệ hoặc không tồn tại';

    case 405:
      return message || 'Dữ liệu bị trùng lặp';

    case 406:
      return message || 'Mã OTP không hợp lệ hoặc đã hết hạn';

    case 407:
      return message || 'Vai trò không hợp lệ';

    case 408:
      return message || 'Mật khẩu mới không được trùng với mật khẩu cũ';

    case 409:
      return message || 'Chưa được xác thực';

    case 410:
      return message || 'Lỗi xác thực token bảo mật';

    case 411:
      return message || 'Không có quyền truy cập';

    case 412:
      // FORBIDDEN - No permission
      return message || 'Bạn không có quyền thực hiện yêu cầu này';

    case 413:
      return message || 'Không tìm thấy dữ liệu yêu cầu';

    case 415:
      return message || 'Dữ liệu đã tồn tại trong hệ thống';

    case 416:
      return message || 'Dịch vụ tạm thời không khả dụng';

    case 419:
      return message || 'Thiếu các chất dinh dưỡng bắt buộc';

    case 421:
      return message || 'Thiếu thông tin giới tính';

    case 500:
      return message || 'Đã xảy ra lỗi không xác định';

    default:
      // If message is just an error code or technical message, return generic message
      if (message && message.length < 10) {
        return 'Có lỗi xảy ra. Vui lòng thử lại sau';
      }
      return message || 'Có lỗi xảy ra. Vui lòng thử lại sau';
  }
};
