// Central API base URL
// - In local dev (npm run dev): Vite proxy forwards /api/* to localhost:5000
// - In production: VITE_API_URL must be set to your Render backend URL
const API_BASE = import.meta.env.VITE_API_URL || '';

export default API_BASE;
