import { useRef, useState } from 'react';
import api, { API_URL } from '../utils/api.js';
import { useNavigate } from 'react-router-dom';

export default function UploadBox() {
	const inputRef = useRef(null);
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	function getFriendlyErrorMessage(err) {
		// Axios network or CORS error (no response)
		if (!err.response) {
			// Connection refused / CORS blocked
			return 'Cannot reach backend. Ensure server is running on the configured URL and CORS allows this origin.';
		}
		// Known status codes
		const status = err.response.status;
		if (status === 401) return 'Please login to upload reports. Redirecting...';
		if (status === 413) return 'File too large. Please upload a file under 10 MB.';
		if (status === 415) return 'Unsupported file type. Use PDF, PNG, or JPG.';
		if (status >= 500) {
			const serverMsg = err.response?.data?.message || '';
			if (serverMsg.includes('OpenAI')) return serverMsg;
			if (serverMsg.includes('quota') || serverMsg.includes('credits')) return serverMsg;
			return 'Server error during analysis. Please check server logs and try again.';
		}
		// Default
		return err.response?.data?.message || 'Upload or analysis failed. Please try again.';
	}

	async function handleFiles(files) {
		if (!files || !files[0]) return;
		setError('');
		setLoading(true);
		try {
			// Check if user is authenticated
			const token = localStorage.getItem('accessToken');
			if (!token) {
				setError('Please login to upload reports.');
				setLoading(false);
				setTimeout(() => navigate('/login'), 2000);
				return;
			}

			// Quick health check to fail fast with a clearer message
			try {
				await api.get('/health', { timeout: 4000 });
			} catch {
				setError(`Backend not reachable at ${API_URL}. Check if server is running and VITE_API_URL is set correctly.`);
				setLoading(false);
				return;
			}

			// 1) Upload file and OCR
			const form = new FormData();
			form.append('report', files[0]);
			const { data: ocr } = await api.post('/api/upload/report', form, {
				headers: { 'Content-Type': 'multipart/form-data' }
			});

			// 2) AI interpret
			const { data: ai } = await api.post('/api/ai/interpret', {
				parsedText: ocr.parsedText,
				fileName: ocr.fileName
			});
			navigate(`/result/${ai.diseaseId}`);
		} catch (e) {
			const msg = getFriendlyErrorMessage(e);
			setError(msg);
			
			// Log detailed error for debugging
			console.error('Upload error:', {
				message: e.message,
				code: e.code,
				status: e.response?.status,
				data: e.response?.data,
				url: e.config?.url
			});
			
			if (e.response?.status === 401) {
				localStorage.removeItem('accessToken');
				localStorage.removeItem('refreshToken');
				setTimeout(() => navigate('/login'), 2000);
			} else if (e.response?.status === 500) {
				// Show the actual server error message
				const errorMsg = e.response?.data?.message || '';
				if (errorMsg.includes('API key') || errorMsg.includes('GEMINI_API_KEY') || errorMsg.includes('OPENAI_API_KEY')) {
					setError(errorMsg);
				} else if (errorMsg.includes('Gemini') || errorMsg.includes('OpenAI')) {
					setError(errorMsg);
				} else {
					// Show more details in development
					const details = e.response?.data?.details;
					setError(errorMsg + (details ? ` (${details})` : ''));
				}
			}
		} finally {
			setLoading(false);
		}
	}

	return (
		<div
			className="card border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center text-center p-8"
			onDragOver={(e) => e.preventDefault()}
			onDrop={(e) => {
				e.preventDefault();
				handleFiles(e.dataTransfer.files);
			}}
		>
			{loading ? (
				<div className="animate-pulse">
					<p className="text-lg font-medium dark:text-gray-300">Analyzing your report...</p>
					<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This may take up to a minute.</p>
				</div>
			) : (
				<>
					<p className="text-lg dark:text-gray-300">Drag & drop your lab report (PDF/Image)</p>
					<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Or click to select</p>
					<button className="btn-primary mt-4" onClick={() => inputRef.current?.click()}>
						Choose File
					</button>
					<input
						ref={inputRef}
						type="file"
						accept=".pdf,image/*"
						className="hidden"
						onChange={(e) => handleFiles(e.target.files)}
					/>
					{error && <p className="text-red-600 dark:text-red-400 mt-3">{error}</p>}
				</>
			)}
		</div>
	);
}


