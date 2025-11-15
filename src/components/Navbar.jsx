import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ theme, toggleTheme }) {
	const navigate = useNavigate();
	const isAuthed = !!localStorage.getItem('accessToken');
	const role = localStorage.getItem('role');
	return (
		<header className="border-b bg-white dark:bg-gray-900 dark:border-gray-700">
			<div className="container mx-auto px-4 py-3 flex items-center justify-between">
				<Link to="/" className="text-xl font-semibold text-sky-700 dark:text-sky-400">
					MedEase
				</Link>
				<nav className="flex items-center gap-4">
					<Link to="/" className="text-gray-700 hover:text-sky-700 dark:text-gray-300 dark:hover:text-sky-400">
						Home
					</Link>
					{isAuthed && (
						<Link to="/dashboard" className="text-gray-700 hover:text-sky-700 dark:text-gray-300 dark:hover:text-sky-400">
							Dashboard
						</Link>
					)}
					{role === 'admin' && (
						<Link to="/admin" className="text-gray-700 hover:text-sky-700 dark:text-gray-300 dark:hover:text-sky-400">
							Admin
						</Link>
					)}
					<button
						type="button"
						className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							if (toggleTheme) {
								toggleTheme();
							}
						}}
						aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
						title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
					>
						{theme === 'light' ? '🌙 Dark' : '☀️ Light'}
					</button>
					{isAuthed ? (
						<button
							className="btn-primary"
							onClick={() => {
								localStorage.clear();
								navigate('/login');
							}}
						>
							Logout
						</button>
					) : (
						<Link to="/login" className="btn-primary">
							Login
						</Link>
					)}
				</nav>
			</div>
		</header>
	);
}


