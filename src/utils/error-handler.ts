export const handleApiError = (error: Error): string => {
  if (error.message.length > 600) {
    return "Có lỗi xảy ra, hãy thử xóa lịch sử chat!";
  }
  return `${error.message}`;
};
