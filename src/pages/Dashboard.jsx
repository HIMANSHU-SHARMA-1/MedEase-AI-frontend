import { useEffect, useState } from 'react';
import api from '../utils/api.js';

export default function Dashboard() {
	const [history, setHistory] = useState([]);
	const [bookmarks, setBookmarks] = useState([]);
	const [q, setQ] = useState('');

	useEffect(() => {
		(async () => {
			try {
				const { data: historyData } = await api.get('/api/diseases');
				setHistory(historyData);
				
				// Fetch user data which includes bookmarks
				const { data: userData } = await api.get('/api/auth/me');
				if (userData?.user?.bookmarks) {
					setBookmarks(userData.user.bookmarks);
					// Also save to localStorage as backup
					localStorage.setItem('bookmarks', JSON.stringify(userData.user.bookmarks));
				} else {
					// Fallback to localStorage if bookmarks not in response
					const b = localStorage.getItem('bookmarks');
					if (b) {
						try {
							setBookmarks(JSON.parse(b));
						} catch (e) {
							console.error('Failed to parse bookmarks from localStorage:', e);
						}
					}
				}
			} catch (err) {
				console.error('Failed to load dashboard data:', err);
				// Fallback to localStorage
				const b = localStorage.getItem('bookmarks');
				if (b) {
					try {
						setBookmarks(JSON.parse(b));
					} catch (e) {
						console.error('Failed to parse bookmarks from localStorage:', e);
					}
				}
			}
		})();
	}, []);

	useEffect(() => {
		if (bookmarks?.length) localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
	}, [bookmarks]);

	const filtered = history.filter((h) =>
		(h.detectedDisease || '').toLowerCase().includes(q.trim().toLowerCase())
	);

	return (
		<div className="grid md:grid-cols-3 gap-6">
			<div className="md:col-span-2 space-y-4">
				<div className="flex items-center gap-2">
					<input
						value={q}
						onChange={(e) => setQ(e.target.value)}
						placeholder="Search your uploads"
						className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
					/>
				</div>
				<div className="card">
					<h3 className="text-lg font-semibold mb-2 dark:text-gray-200">Past Uploads</h3>
					<div className="space-y-2">
						{filtered.map((it) => (
							<div key={it._id} className="border rounded p-3 dark:border-gray-700 dark:bg-gray-800/50">
								<div className="flex items-center justify-between">
									<div>
										<p className="font-medium dark:text-gray-200">{it.detectedDisease}</p>
										<p className="text-sm text-gray-500 dark:text-gray-400">{new Date(it.createdAt).toLocaleString()}</p>
									</div>
									<a className="btn-primary" href={`/result/${it._id}`} onClick={(e)=>{e.preventDefault(); window.location.href=`/result/${it._id}`;}}>
										View
									</a>
								</div>
								<p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">{it.parsedText?.slice(0, 200)}...</p>
							</div>
						))}
						{filtered.length === 0 && <p className="text-gray-600 dark:text-gray-400">No uploads yet.</p>}
					</div>
				</div>
			</div>
			<div className="space-y-4">
				<div className="card">
					<h3 className="text-lg font-semibold mb-2 dark:text-gray-200">Bookmarked Diseases</h3>
					{(bookmarks || []).length === 0 ? (
						<p className="text-gray-600 dark:text-gray-400">No bookmarks yet.</p>
					) : (
						<div className="space-y-2">
							{bookmarks.map((b, i) => (
								<div key={i} className="border rounded p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:border-gray-700 transition-colors">
									<div className="flex items-center justify-between">
										<div>
											<p className="font-medium text-gray-900 dark:text-gray-200">{b.title || 'Untitled'}</p>
											{b.diseaseId && (
												<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">ID: {b.diseaseId}</p>
											)}
										</div>
										{b.diseaseId && (
											<a 
												className="btn-primary text-sm px-3 py-1" 
												href={`/result/${b.diseaseId}`}
												onClick={(e) => {
													e.preventDefault();
													window.location.href = `/result/${b.diseaseId}`;
												}}
											>
												View
											</a>
										)}
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}


