import toast from 'react-hot-toast';
export const handleError = (error) => { const message = error.response?.data?.message || error.message || 'An error occurred'; toast.error(message); console.error('Error:', error); return message; };
export const getErrorMessage = (error) => error.response?.data?.message || error.message || 'An unexpected error occurred';
