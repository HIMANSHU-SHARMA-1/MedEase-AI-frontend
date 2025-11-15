import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import ResultPage from './pages/ResultPage.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import { useEffect, useState, useCallback } from 'react';

function PrivateRoute({ children }) {
	const token = localStorage.getItem('accessToken');
	return token ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
	const token = localStorage.getItem('accessToken');
	const role = localStorage.getItem('role');
	return token && role === 'admin' ? children : <Navigate to="/" replace />;
}

export default function App() {
	const [theme, setTheme] = useState(() => {
		try {
			const savedTheme = localStorage.getItem('theme');
			if (savedTheme === 'dark' || savedTheme === 'light') {
				return savedTheme;
			}
		} catch (e) {
			console.error('Error reading theme from localStorage:', e);
		}
		return 'light';
	});
	
	// Apply theme whenever it changes
	useEffect(() => {
		const root = document.documentElement;
		if (theme === 'dark') {
			root.classList.add('dark');
		} else {
			root.classList.remove('dark');
		}
		try {
			localStorage.setItem('theme', theme);
		} catch (e) {
			console.error('Error saving theme to localStorage:', e);
		}
	}, [theme]);
	
	// Theme toggle function
	const toggleTheme = useCallback(() => {
		setTheme(prevTheme => {
			const newTheme = prevTheme === 'light' ? 'dark' : 'light';
			// Immediately apply to DOM for instant feedback
			const root = document.documentElement;
			if (newTheme === 'dark') {
				root.classList.add('dark');
			} else {
				root.classList.remove('dark');
			}
			return newTheme;
		});
	}, []);
	return (
		<div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors">
			<Navbar theme={theme} toggleTheme={toggleTheme} />
			<main className="flex-1 container mx-auto p-4">
				<Routes>
					<Route path="/" element={<Home />} />
					<Route
						path="/dashboard"
						element={
							<PrivateRoute>
								<Dashboard />
							</PrivateRoute>
						}
					/>
					<Route
						path="/admin"
						element={
							<AdminRoute>
								<AdminPanel />
							</AdminRoute>
						}
					/>
					<Route
						path="/result/:id"
						element={
							<PrivateRoute>
								<ResultPage />
							</PrivateRoute>
						}
					/>
					<Route path="/login" element={<Login />} />
					<Route path="/register" element={<Register />} />
				</Routes>
			</main>
			<Footer />
		</div>
	);
}


