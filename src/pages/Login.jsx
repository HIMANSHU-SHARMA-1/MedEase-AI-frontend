import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api.js';

export default function Login() {
	const navigate = useNavigate();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	async function submit(e) {
		e.preventDefault();
		setError('');
		setLoading(true);
		try {
			const { data } = await api.post('/api/auth/login', { email, password });
			localStorage.setItem('accessToken', data.accessToken);
			localStorage.setItem('refreshToken', data.refreshToken);
			localStorage.setItem('role', data.user.role);
			navigate('/');
		} catch {
			setError('Invalid credentials');
		} finally {
			setLoading(false);
		}
	}
	return (
		<div className="max-w-sm mx-auto card">
			<h2 className="text-xl font-semibold mb-4 dark:text-gray-200">Login</h2>
			<form onSubmit={submit} className="space-y-3">
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
					Login
				</button>
				{error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
				<p className="text-sm text-gray-600 dark:text-gray-400">
					No account? <Link to="/register" className="text-sky-700 dark:text-sky-400 underline">Register</Link>
				</p>
			</form>
		</div>
	);
}


