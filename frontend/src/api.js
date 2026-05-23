const rawApiBase = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
const API_BASE = rawApiBase.replace(/\/$/, '');

export default API_BASE;
