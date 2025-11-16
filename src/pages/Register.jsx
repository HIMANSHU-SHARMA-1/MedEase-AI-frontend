import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { API_URL } from '../utils/api.js';

export default function Register() {
	const navigate = useNavigate();
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	async function submit(e) {
		e.preventDefault();
		setError('');
		setLoading(true);
		try {
			const { data } = await api.post('/api/auth/register', { name, email, password });
			localStorage.setItem('accessToken', data.accessToken);
			localStorage.setItem('refreshToken', data.refreshToken);
			localStorage.setItem('role', data.user.role);
			navigate('/');
		} catch (err) {
			// Better error handling
			if (!err.response) {
				// Network error - backend not reachable
				setError(`Cannot connect to backend at ${API_URL}. Check if server is running and VITE_API_URL is set correctly.`);
			} else if (err.response.status === 400) {
				// Validation error
				setError(err.response.data?.message || 'Invalid registration data. Please check your inputs.');
			} else if (err.response.status === 409) {
				// User already exists
				setError('Email already registered. Please login instead.');
			} else if (err.response.status === 401) {
				// Unauthorized
				setError('Registration failed. Please check your credentials.');
			} else {
				// Other errors
				setError(err.response.data?.message || 'Registration failed. Please try again.');
			}
			console.error('Registration error:', err);
		} finally {
			setLoading(false);
		}
	}
	return (
		<div className="max-w-sm mx-auto card">
			<h2 className="text-xl font-semibold mb-4 dark:text-gray-200">Register</h2>
			<form onSubmit={submit} className="space-y-3">
				<input
					type="text"
					placeholder="Full Name"
					className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
					value={name}
					onChange={(e) => setName(e.target.value)}
				/>
				<input
					type="email"
					placeholder="Email"
					className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
				<input
					type="password"
					placeholder="Password"
					className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
				<button disabled={loading} className="btn-primary w-full" type="submit">
					Create account
				</button>
				{error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
				<p className="text-sm text-gray-600 dark:text-gray-400">
					Have an account? <Link to="/login" className="text-sky-700 dark:text-sky-400 underline">Login</Link>
				</p>
			</form>
		</div>
	);
}


