export const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const validatePassword = (password) => password.length >= 8;
export const validatePhone = (phone) => /^[0-9]{10}$/.test(phone.replace(/\D/g, ''));
export const validateRequired = (value) => value && value.trim().length > 0;
