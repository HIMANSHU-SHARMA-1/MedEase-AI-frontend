import { Link } from 'react-router-dom';
import UploadBox from '../components/UploadBox.jsx';

export default function Home() {
	const isAuthenticated = !!localStorage.getItem('accessToken');

	return (
		<div className="max-w-3xl mx-auto">
			<h1 className="text-3xl font-bold mb-4 text-sky-700 dark:text-sky-400">MedEase</h1>
			<p className="text-gray-700 dark:text-gray-300 mb-6">
				Upload your lab report and let AI analyze it automatically. No typing needed.
			</p>
			{!isAuthenticated && (
				<div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
					<p className="text-blue-800 dark:text-blue-300">
						Please <Link to="/login" className="underline font-semibold">login</Link> or{' '}
						<Link to="/register" className="underline font-semibold">register</Link> to upload and analyze lab reports.
					</p>
				</div>
			)}
			<UploadBox />
		</div>
	);
}


