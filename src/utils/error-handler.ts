export const handleApiError = (error: Error): string => {
  if (error.message.length > 600) {
    return "Có lỗi xảy ra!";
  }
  return `${error.message}`;
};
