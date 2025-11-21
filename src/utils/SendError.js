export const SendError = (res, status, message) => {
  return res.status(status).json({ success: false, message });
};
