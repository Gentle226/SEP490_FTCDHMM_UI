/**
 * Translates backend error messages to Vietnamese
 * Handles null reference errors, validation errors, and other common backend errors
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

  // Handle validation errors
  if (statusCode === 400) {
    if (message.includes('already exists') || message.includes('tồn tại')) {
      return 'Dữ liệu đã tồn tại';
    }
    if (message.includes('invalid') || message.includes('không hợp lệ')) {
      return 'Dữ liệu không hợp lệ';
    }
    return 'Yêu cầu không hợp lệ';
  }

  // Handle not found errors
  if (statusCode === 404) {
    return 'Không tìm thấy dữ liệu';
  }

  // Handle unauthorized errors
  if (statusCode === 401) {
    return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại';
  }

  // Handle forbidden errors
  if (statusCode === 403) {
    return 'Bạn không có quyền thực hiện hành động này';
  }

  // Handle server errors
  if (statusCode === 500) {
    return 'Có lỗi xảy ra trên máy chủ. Vui lòng thử lại sau';
  }

  // If message is just an error code or technical message, return generic message
  if (message && message.length < 10) {
    return 'Có lỗi xảy ra. Vui lòng thử lại sau';
  }

  return message || 'Có lỗi xảy ra. Vui lòng thử lại sau';
};
