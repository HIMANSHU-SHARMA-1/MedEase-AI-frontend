import axios from 'axios';

// Get API URL from environment variable
// For production: Set VITE_API_URL in Vercel environment variables
// For local dev: Create .env file with VITE_API_URL=http://localhost:5000
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Log API URL in development to help debug
if (import.meta.env.DEV) {
	console.log('🔗 API Base URL:', API_URL);
}

const api = axios.create({
	baseURL: API_URL,
	withCredentials: false,
	timeout: 30000, // 30 second timeout
});

api.interceptors.request.use((config) => {
	const token = localStorage.getItem('accessToken');
	if (token) config.headers.Authorization = `Bearer ${token}`;
	return config;
});

api.interceptors.response.use(
	(res) => res,
	async (error) => {
		const original = error.config;
		if (error.response?.status === 401 && !original._retry) {
			original._retry = true;
			try {
				const refreshToken = localStorage.getItem('refreshToken');
				if (!refreshToken) throw new Error('No refresh token');
				const { data } = await axios.post(
					API_URL + '/api/auth/refresh',
					{ refreshToken }
				);
				localStorage.setItem('accessToken', data.accessToken);
				localStorage.setItem('refreshToken', data.refreshToken);
				original.headers.Authorization = `Bearer ${data.accessToken}`;
				return api(original);
			} catch {
				localStorage.removeItem('accessToken');
				localStorage.removeItem('refreshToken');
				localStorage.removeItem('role');
				window.location.href = '/login';
			}
		}
		return Promise.reject(error);
	}
);

export default api;


