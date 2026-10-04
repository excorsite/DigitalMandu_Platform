export const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const validatePassword = (password) => password.length >= 8;
export const validateGmail = (email) =>
  /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@gmail\.com$/i.test(email);
export const validatePhone = (phone) => /^[0-9]{10}$/.test(phone);
export const validateRequired = (value) => value && value.trim().length > 0;
