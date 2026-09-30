export const formatPrice = (price) => new Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR' }).format(price);
export const formatDate = (date) => new Intl.DateTimeFormat('en-NP', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(date));
export const formatDateTime = (date) => new Intl.DateTimeFormat('en-NP', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date));
export const truncateText = (text, length = 50) => text.length > length ? `${text.substring(0, length)}...` : text;
