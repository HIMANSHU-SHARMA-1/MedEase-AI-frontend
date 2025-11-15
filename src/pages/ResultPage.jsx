import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api.js';
import ResultCard from '../components/ResultCard.jsx';

function toEmbedUrl(url) {
	if (!url || typeof url !== 'string') return null;
	
	try {
		const parsed = new URL(url);
		let videoId = null;
		
		// Handle youtube.com URLs
		if (parsed.hostname.includes('youtube.com')) {
			videoId = parsed.searchParams.get('v');
			// Also check for /embed/ or /watch/ paths
			if (!videoId) {
				const match = parsed.pathname.match(/\/(?:embed|watch|v)\/([a-zA-Z0-9_-]{11})/);
				if (match) videoId = match[1];
			}
		}
		// Handle youtu.be short URLs
		else if (parsed.hostname.includes('youtu.be')) {
			const match = parsed.pathname.match(/\/([a-zA-Z0-9_-]{11})/);
			if (match) videoId = match[1];
		}
		
		if (videoId) {
			// Add parameters to prevent some tracking and improve privacy
			return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`;
		}
		return null;
	} catch (error) {
		console.warn('Failed to parse video URL:', url, error);
		return null;
	}
}

export default function ResultPage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [disease, setDisease] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [bookmarking, setBookmarking] = useState(false);
	const [language, setLanguage] = useState('en');
	const [localized, setLocalized] = useState(null);
	const [localizing, setLocalizing] = useState(false);
	const [unavailableVideos, setUnavailableVideos] = useState(new Set());

	useEffect(() => {
		(async () => {
			try {
				const { data } = await api.get(`/api/diseases/${id}`);
				console.log('📊 Disease data received:', {
					hasGlobalStats: !!data?.globalStatistics,
					hasPatientImpact: !!data?.patientImpactFacts,
					globalStats: data?.globalStatistics,
					patientImpact: data?.patientImpactFacts
				});
				setDisease(data);
			} catch {
				setError(language === 'hi' ? 'परिणाम लोड करने में विफल' : 'Failed to load result');
			} finally {
				setLoading(false);
			}
		})();
	}, [id]);

	async function bookmark() {
		if (!disease) return;
		setBookmarking(true);
		try {
			const { data } = await api.post('/api/diseases/bookmark', {
				diseaseId: disease._id,
				title: disease.name
			});
			// Update localStorage with the returned bookmarks
			if (data?.bookmarks) {
				localStorage.setItem('bookmarks', JSON.stringify(data.bookmarks));
			}
			alert(language === 'hi' ? 'बुकमार्क किया गया' : 'Bookmarked');
		} catch {
			alert(language === 'hi' ? 'बुकमार्क विफल' : 'Bookmark failed');
		} finally {
			setBookmarking(false);
		}
	}

	function downloadPdf() {
		// Simple HTML-to-print as a placeholder for PDF
		window.print();
	}

	useEffect(() => {
		let cancelled = false;
		(async () => {
			if (language === 'en') {
				setLocalized(null);
				return;
			}
			setLocalizing(true);
			try {
				const { data } = await api.get(`/api/diseases/${id}/localized`, {
					params: { lang: language }
				});
				if (!cancelled) {
					setLocalized(data);
				}
			} catch (err) {
				console.error('Localization fetch failed', err);
				if (!cancelled) {
					setLocalized(null);
				}
			} finally {
				if (!cancelled) setLocalizing(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [language, id]);


	// Translation dictionary for UI text
	const t = {
		en: {
			educationalNotice: 'This information is for educational purposes only and not a substitute for professional medical advice.',
			analyzedBy: 'Analyzed by:',
			language: 'Language',
			bookmark: 'Bookmark',
			downloadPdf: 'Download PDF',
			backToDashboard: 'Back to Dashboard',
			loadingLocalized: 'Loading localized content…',
			expertVideoInsights: '🎥 Expert Video Insights',
			refreshVideos: '🔄 Refresh Videos',
			videos: 'videos',
			video: 'video',
			noVideosAvailable: 'No videos available',
			tryRefreshing: 'Try refreshing or check back later',
			videosUnavailable: 'Videos are currently unavailable. Showing web-based educational resources instead.',
			readArticle: 'Read Article',
			noResourcesAvailable: 'No videos or web resources available',
			specialistDoctors: 'Specialist Doctors for',
			connectWithSpecialists: 'Connect with specialists experienced in managing this condition. Use the Google Maps links to view them near you.',
			specialist: 'Specialist',
			contact: 'Contact:',
			viewOnGoogleMaps: 'View on Google Maps',
			abnormalLabValues: 'Abnormal Lab Values',
			abnormality: 'abnormality',
			abnormalities: 'abnormalities',
			noAbnormalValues: 'No abnormal values detected',
			allValuesNormal: 'All lab values are within normal reference ranges',
			testName: 'Test Name',
			test: 'Test',
			yourValue: 'Your Value',
			value: 'Value',
			unit: 'Unit',
			normalRange: 'Normal Range',
			range: 'Range',
			status: 'Status',
			interpretation: 'Interpretation',
			high: 'High',
			low: 'Low',
			notAvailable: 'N/A',
			globalStatistics: 'Global Statistics & How This Affects You',
			howCommonWorldwide: 'How Many People Are Diagnosed With This Disease Worldwide',
			totalPeopleDiagnosed: 'Total People Diagnosed',
			newDiagnosesPerYear: 'New Diagnoses Per Year',
			mortalityRate: 'Mortality Rate',
			mostAffectedAgeGroups: 'Most Affected Age Groups',
			genderDistribution: 'Gender Distribution',
			economicImpact: 'Economic Impact',
			globalTrends: 'Global Trends',
			caseDistribution: 'Case Distribution by Country/Region',
			mostAffectedRegions: 'Most Affected Regions',
			howThisAffectsYou: 'How This Affects You',
			lifestyleImpact: 'Lifestyle Impact',
			workEmployment: 'Work & Employment',
			familyConsiderations: 'Family Considerations',
			financialImpact: 'Financial Impact',
			emotionalMentalHealth: 'Emotional & Mental Health',
			longTermOutlook: 'Long-Term Outlook',
			qualityOfLife: 'Quality of Life',
			importantPrecautions: 'Important Precautions',
			bookmarked: 'Bookmarked',
			bookmarkFailed: 'Bookmark failed',
			failedToLoad: 'Failed to load result'
		},
		hi: {
			educationalNotice: 'यह जानकारी केवल शैक्षिक उद्देश्यों के लिए है और पेशेवर चिकित्सा सलाह का विकल्प नहीं है।',
			analyzedBy: 'विश्लेषण किया गया:',
			language: 'भाषा',
			bookmark: 'बुकमार्क',
			downloadPdf: 'PDF डाउनलोड करें',
			backToDashboard: 'डैशबोर्ड पर वापस जाएं',
			loadingLocalized: 'स्थानीयकृत सामग्री लोड हो रही है…',
			expertVideoInsights: '🎥 विशेषज्ञ वीडियो अंतर्दृष्टि',
			refreshVideos: '🔄 वीडियो रीफ्रेश करें',
			videos: 'वीडियो',
			video: 'वीडियो',
			noVideosAvailable: 'कोई वीडियो उपलब्ध नहीं',
			tryRefreshing: 'कृपया रीफ्रेश करें या बाद में जांचें',
			videosUnavailable: 'वीडियो वर्तमान में उपलब्ध नहीं हैं। इसके बजाय वेब-आधारित शैक्षिक संसाधन दिखाए जा रहे हैं।',
			readArticle: 'लेख पढ़ें',
			noResourcesAvailable: 'कोई वीडियो या वेब संसाधन उपलब्ध नहीं',
			specialistDoctors: 'के लिए विशेषज्ञ डॉक्टर',
			connectWithSpecialists: 'इस स्थिति के प्रबंधन में अनुभवी विशेषज्ञों से जुड़ें। उन्हें अपने पास देखने के लिए Google Maps लिंक का उपयोग करें।',
			specialist: 'विशेषज्ञ',
			contact: 'संपर्क:',
			viewOnGoogleMaps: 'Google Maps पर देखें',
			abnormalLabValues: 'असामान्य लैब मान',
			abnormality: 'असामान्यता',
			abnormalities: 'असामान्यताएं',
			noAbnormalValues: 'कोई असामान्य मान नहीं मिला',
			allValuesNormal: 'सभी लैब मान सामान्य संदर्भ सीमा के भीतर हैं',
			testName: 'परीक्षण नाम',
			test: 'परीक्षण',
			yourValue: 'आपका मान',
			value: 'मान',
			unit: 'इकाई',
			normalRange: 'सामान्य सीमा',
			range: 'सीमा',
			status: 'स्थिति',
			interpretation: 'व्याख्या',
			high: 'उच्च',
			low: 'निम्न',
			notAvailable: 'उपलब्ध नहीं',
			globalStatistics: 'वैश्विक आंकड़े और यह आपको कैसे प्रभावित करता है',
			howCommonWorldwide: 'दुनिया भर में इस बीमारी से कितने लोगों का निदान किया गया है',
			totalPeopleDiagnosed: 'कुल निदान किए गए लोग',
			newDiagnosesPerYear: 'प्रति वर्ष नए निदान',
			mortalityRate: 'मृत्यु दर',
			mostAffectedAgeGroups: 'सबसे अधिक प्रभावित आयु समूह',
			genderDistribution: 'लिंग वितरण',
			economicImpact: 'आर्थिक प्रभाव',
			globalTrends: 'वैश्विक रुझान',
			caseDistribution: 'देश/क्षेत्र के अनुसार मामले का वितरण',
			mostAffectedRegions: 'सबसे अधिक प्रभावित क्षेत्र',
			howThisAffectsYou: 'यह आपको कैसे प्रभावित करता है',
			lifestyleImpact: 'जीवनशैली प्रभाव',
			workEmployment: 'काम और रोजगार',
			familyConsiderations: 'पारिवारिक विचार',
			financialImpact: 'वित्तीय प्रभाव',
			emotionalMentalHealth: 'भावनात्मक और मानसिक स्वास्थ्य',
			longTermOutlook: 'दीर्घकालिक दृष्टिकोण',
			qualityOfLife: 'जीवन की गुणवत्ता',
			importantPrecautions: 'महत्वपूर्ण सावधानियां',
			bookmarked: 'बुकमार्क किया गया',
			bookmarkFailed: 'बुकमार्क विफल',
			failedToLoad: 'परिणाम लोड करने में विफल'
		}
	};
	
	const translations = t[language] || t.en;
	
	const summary = language === 'en' ? disease?.aiSummary : localized?.summary || disease?.aiSummary;
	const allResources =
		language === 'en'
			? disease?.videoResources || []
			: localized?.videoResources || disease?.videoResources || [];
	
	// Get translated global statistics and patient impact facts
	const globalStats = language === 'en' 
		? disease?.globalStatistics 
		: localized?.globalStatistics || disease?.globalStatistics;
	const patientImpact = language === 'en'
		? disease?.patientImpactFacts
		: localized?.patientImpactFacts || disease?.patientImpactFacts;
	
	// Separate videos and web resources
	const allVideos = allResources.filter(r => !r.isWebResource);
	const allWebResources = allResources.filter(r => r.isWebResource);
	
	// Filter out unavailable videos - use original index from allVideos
	const videos = allVideos
		.map((video, originalIdx) => ({ video, originalIdx }))
		.filter(({ video, originalIdx }) => {
			// Check if video has required fields
			if (!video || !video.url || !video.title || video.title === 'Untitled Video' || video.title.trim() === '') {
				return false;
			}
			
			// Check if URL is valid YouTube URL
			if (!video.url.includes('youtube.com') && !video.url.includes('youtu.be')) {
				return false;
			}
			
			// Check if video is marked as unavailable
			if (unavailableVideos.has(originalIdx)) {
				return false;
			}
			
			// Check if embed URL can be generated
			const embedUrl = toEmbedUrl(video.url);
			if (!embedUrl) {
				return false;
			}
			
			return true;
		})
		.map(({ video, originalIdx }) => ({ ...video, _originalIdx: originalIdx }));
	
	// Process web resources
	const webResources = allWebResources.filter(resource => {
		return resource && resource.url && resource.title && resource.title.trim() !== '';
	});
	
	// Debug logging
	useEffect(() => {
		console.log('📹 Resources Debug:', {
			language,
			totalResources: allResources?.length || 0,
			diseaseVideos: disease?.videoResources?.length || 0,
			localizedVideos: localized?.videoResources?.length || 0,
			finalVideos: videos?.length || 0,
			webResources: webResources?.length || 0,
			sampleVideo: videos?.[0] ? {
				title: videos[0].title,
				url: videos[0].url,
				channel: videos[0].channel,
				hasTitle: !!videos[0].title && videos[0].title !== 'Untitled Video',
				hasUrl: !!videos[0].url,
				urlValid: videos[0].url?.includes('youtube.com'),
				fullVideo: videos[0]
			} : null,
			sampleWebResource: webResources?.[0] ? {
				title: webResources[0].title,
				url: webResources[0].url,
				source: webResources[0].source,
				type: webResources[0].type
			} : null
		});
		
		// Log each video's details
		if (videos && videos.length > 0) {
			videos.forEach((v, i) => {
				if (!v.title || v.title === 'Untitled Video' || v.title.trim() === '') {
					console.warn(`⚠️  Video ${i + 1} has no title:`, v);
				}
				if (!v.url || (!v.url.includes('youtube.com') && !v.url.includes('youtu.be'))) {
					console.warn(`⚠️  Video ${i + 1} has invalid URL:`, v.url);
				}
			});
		}
	}, [language, disease, localized, videos]);
	
	const specialists =
		localized?.specialistProviders?.length
			? localized.specialistProviders
			: disease?.specialistProviders || [];

	if (loading) return <p className="dark:text-gray-300">Loading...</p>;
	if (error) return <p className="text-red-600 dark:text-red-400">{error}</p>;
	if (!disease) return null;

	return (
		<div className="space-y-6">
			<div className="flex items-start justify-between gap-4">
				<div>
					<h2 className="text-2xl font-bold dark:text-gray-100">{disease.name}</h2>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						{translations.educationalNotice}
					</p>
					{(disease.aiProvider || disease.aiModel) && (
						<p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
							{translations.analyzedBy} <span className="font-medium capitalize">{disease.aiProvider || 'AI'}</span>
							{disease.aiModel && ` (${disease.aiModel})`}
						</p>
					)}
				</div>
				<div className="flex gap-2 items-start flex-wrap">
					<div className="flex items-center gap-2">
						<label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="language">
							{translations.language}
						</label>
						<select
							id="language"
							className="border rounded px-2 py-1 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
							value={language}
							onChange={(e) => setLanguage(e.target.value)}
						>
							<option value="en">English</option>
							<option value="hi">हिन्दी</option>
						</select>
					</div>
					<button className="btn-primary" disabled={bookmarking} onClick={bookmark}>
						{translations.bookmark}
					</button>
					<button className="btn-primary" onClick={downloadPdf}>
						{translations.downloadPdf}
					</button>
					<button className="btn-primary" onClick={() => navigate('/dashboard')}>
						{translations.backToDashboard}
					</button>
				</div>
			</div>

			{localizing && language !== 'en' && (
				<p className="text-sm text-gray-500 dark:text-gray-400">{translations.loadingLocalized}</p>
			)}

			<ResultCard disease={disease} summary={summary} />

			<div className="card">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
						🎥 Expert Video Insights
						{language !== 'en' && (
							<span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">({language.toUpperCase()})</span>
						)}
					</h3>
					<div className="flex items-center gap-3">
						{videos && videos.length > 0 && (
							<span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
								{videos.length} {videos.length === 1 ? 'video' : 'videos'}
							</span>
						)}
						{webResources && webResources.length > 0 && videos.length === 0 && (
							<span className="text-sm text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded font-medium">
								{webResources.length} {webResources.length === 1 ? 'web resource' : 'web resources'}
							</span>
						)}
						<button
							onClick={async () => {
								try {
									console.log('🔄 Refreshing videos...');
									const response = await api.post(`/api/diseases/${id}/refresh-videos`);
									console.log('📊 Refresh response:', response.data);
									
									if (response.data.count > 0) {
										alert(`✅ Refreshed ${response.data.count} videos! Reloading page...`);
										// Force reload to get fresh data
										setTimeout(() => {
											window.location.reload();
										}, 500);
									} else {
										const errorMsg = response.data.error || response.data.message || 'Unknown error';
										console.error('❌ No videos found:', response.data);
										alert(`⚠️ No videos found.\n\nReason: ${errorMsg}\n\nCheck server console for details.`);
									}
								} catch (err) {
									console.error('❌ Refresh error:', err);
									const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
									alert(`Failed to refresh videos:\n\n${errorMsg}\n\nCheck server console for details.`);
								}
							}}
							className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition-colors font-medium"
							title="Force refresh videos from YouTube API"
						>
							{translations.refreshVideos}
						</button>
					</div>
				</div>

				{videos && videos.length > 0 ? (
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
						{videos.map((video, idx) => {
							// Skip if video is marked as unavailable
							if (video._originalIdx !== undefined && unavailableVideos.has(video._originalIdx)) {
								return null;
							}
							// Debug: Log video data
							if (idx === 0) {
								console.log('🎬 First video data:', {
									title: video.title,
									url: video.url,
									hasTitle: !!video.title,
									hasUrl: !!video.url,
									urlType: typeof video.url
								});
							}
							
							const embedUrl = toEmbedUrl(video.url);
							if (!embedUrl && video.url) {
								console.warn(`⚠️  Could not embed video ${idx + 1}:`, video.url);
							}
							
							return (
								<div key={idx} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md dark:hover:shadow-gray-900/50 transition-shadow">
									{/* Video Player */}
									<div className="aspect-video bg-gray-900 relative">
										{embedUrl ? (
											<>
												<iframe
													title={video.title}
													src={embedUrl}
													className="w-full h-full"
													allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
													allowFullScreen
													loading="lazy"
													onError={(e) => {
														console.warn('Video iframe error, marking as unavailable:', video.url);
														const originalIdx = video._originalIdx !== undefined ? video._originalIdx : idx;
														setUnavailableVideos(prev => new Set([...prev, originalIdx]));
													}}
												/>
												{/* Overlay to catch click if iframe fails */}
												<div 
													className="absolute inset-0 pointer-events-none"
													style={{ zIndex: -1 }}
												/>
											</>
										) : (
											<a
												className="block w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center text-white hover:from-gray-700 hover:to-gray-800 transition-colors"
												href={video.url}
												target="_blank"
												rel="noreferrer"
											>
												<svg className="w-16 h-16 mb-2 opacity-75" fill="currentColor" viewBox="0 0 20 20">
													<path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
												</svg>
												<span className="text-sm font-medium">Open Video</span>
												<span className="text-xs opacity-75 mt-1">Click to watch on source</span>
											</a>
										)}
									</div>

									{/* Video Details */}
									<div className="p-4 space-y-3">
										{/* Title */}
										<h4 className="font-semibold text-gray-900 dark:text-gray-200 line-clamp-2 leading-tight">
											{video.title || 'Untitled Video'}
										</h4>

										{/* Metadata */}
										<div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
											{video.channel && (
												<span className="flex items-center gap-1">
													<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
													</svg>
													{video.channel}
												</span>
											)}
											{video.duration && (
												<span className="flex items-center gap-1">
													<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
													</svg>
													{video.duration}
												</span>
											)}
											{video.publishedDate && (
												<span className="flex items-center gap-1">
													<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
													</svg>
													{video.publishedDate}
												</span>
											)}
											{video.viewCount && (
												<span className="flex items-center gap-1">
													<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
													</svg>
													{typeof video.viewCount === 'number' 
														? video.viewCount.toLocaleString() 
														: video.viewCount}
												</span>
											)}
										</div>

										{/* Learning Objective */}
										{video.reason && (
											<div className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-400 dark:border-blue-500 p-2 rounded">
												<p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1">Learning Focus:</p>
												<p className="text-xs text-blue-700 dark:text-blue-400">{video.reason}</p>
											</div>
										)}

										{/* Actions */}
										<div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
											<a
												className="text-xs text-sky-700 dark:text-sky-400 hover:text-sky-900 dark:hover:text-sky-300 underline font-medium flex items-center gap-1"
												href={video.url}
												target="_blank"
												rel="noreferrer"
											>
												<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
												</svg>
												Watch on Source
											</a>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				) : webResources && webResources.length > 0 ? (
					<div>
						<div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 dark:border-blue-400 rounded">
							<p className="text-sm text-blue-800 dark:text-blue-300">
								<strong>{language === 'hi' ? 'नोट:' : 'Note:'}</strong> {translations.videosUnavailable}
							</p>
						</div>
						<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
							{webResources.map((resource, idx) => (
								<a
									key={idx}
									href={resource.url}
									target="_blank"
									rel="noreferrer"
									className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md dark:hover:shadow-gray-900/50 transition-all hover:border-blue-400 dark:hover:border-blue-500 group"
								>
									{/* Resource Icon/Preview */}
									<div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 p-6 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
										<div className="text-center">
											<svg className="w-12 h-12 mx-auto text-blue-600 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
											</svg>
											{resource.type && (
												<span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
													{resource.type}
												</span>
											)}
										</div>
									</div>

									{/* Resource Details */}
									<div className="p-4 space-y-3">
										{/* Title */}
										<h4 className="font-semibold text-gray-900 dark:text-gray-200 line-clamp-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
											{resource.title || 'Medical Resource'}
										</h4>

										{/* Description */}
										{resource.description && (
											<p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
												{resource.description}
											</p>
										)}

										{/* Source */}
										<div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
											</svg>
											<span className="font-medium">{resource.source || 'Medical Resource'}</span>
										</div>

										{/* Open Link Button */}
										<div className="pt-2">
											<span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
												{translations.readArticle}
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
												</svg>
											</span>
										</div>
									</div>
								</a>
							))}
						</div>
					</div>
				) : (
					<div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
						<svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
						</svg>
						<p className="text-gray-600 dark:text-gray-400 font-medium mb-2">{translations.noResourcesAvailable}</p>
						<p className="text-sm text-gray-500 dark:text-gray-500">{translations.tryRefreshing}</p>
					</div>
				)}
			</div>

			{specialists.length > 0 && (
				<div className="card">
					<h3 className="text-lg font-semibold mb-3">Specialist Doctors for {disease.name}</h3>
					<p className="text-sm text-gray-600 mb-3">
						Connect with specialists experienced in managing this condition. Use the Google Maps links to view
						them near you.
					</p>
					<div className="space-y-3">
						{specialists.map((doc, idx) => (
							<div key={idx} className="border rounded p-3">
								<p className="font-semibold text-gray-800">
									{doc.name}{' '}
									<span className="text-sm text-gray-600">({doc.speciality || translations.specialist})</span>
								</p>
								<p className="text-sm text-gray-700">
									{doc.hospital ? `${doc.hospital}, ` : ''}
									{doc.city || ''}
								</p>
								{doc.contact && (
									<p className="text-sm text-gray-700">
										<strong>{translations.contact}</strong> {doc.contact}
									</p>
								)}
								<a className="text-sm text-sky-700 underline" href={doc.mapUrl} target="_blank" rel="noreferrer">
									{translations.viewOnGoogleMaps}
								</a>
							</div>
						))}
					</div>
				</div>
			)}

			<div className="card">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-semibold">{translations.abnormalLabValues}</h3>
					{(disease.abnormalFindings || []).length > 0 && (
						<span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded">
							{(disease.abnormalFindings || []).length} {(disease.abnormalFindings || []).length === 1 ? translations.abnormality : translations.abnormalities}
						</span>
					)}
				</div>
				
				{(disease.abnormalFindings || []).length === 0 ? (
					<div className="text-center py-8 bg-green-50 rounded-lg border border-green-200">
						<svg className="w-12 h-12 mx-auto text-green-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<p className="text-green-700 font-medium">{translations.noAbnormalValues}</p>
						<p className="text-sm text-green-600 mt-1">{translations.allValuesNormal}</p>
					</div>
				) : (
					<div className="shadow-sm rounded-lg border border-gray-200">
						<table className="w-full divide-y divide-gray-200 table-fixed">
							<thead className="bg-gradient-to-r from-gray-50 to-gray-100">
								<tr>
									<th className="w-[18%] px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-300">
										<div className="flex items-center gap-1">
											<svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
											</svg>
											<span className="hidden sm:inline">{translations.testName}</span>
											<span className="sm:hidden">{translations.test}</span>
										</div>
									</th>
									<th className="w-[12%] px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-300">
										<div className="flex items-center gap-1">
											<svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
											</svg>
											{translations.value}
										</div>
									</th>
									<th className="w-[10%] px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-300">
										{translations.unit}
									</th>
									<th className="w-[18%] px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-300">
										<div className="flex items-center gap-1">
											<svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
											</svg>
											<span className="hidden md:inline">{translations.normalRange}</span>
											<span className="md:hidden">{translations.range}</span>
										</div>
									</th>
									<th className="w-[12%] px-3 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-300">
										<div className="flex items-center justify-center gap-1">
											<svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
											{translations.status}
										</div>
									</th>
									<th className="w-[30%] px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-300">
										<div className="flex items-center gap-1">
											<svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
											</svg>
											{translations.interpretation}
										</div>
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{(disease.abnormalFindings || []).map((f, i) => {
									const isHigh = /(high|elevated|above|critical|h)/i.test(f.flag || f.severity || '');
									const isLow = /(low|below|reduced|l)/i.test(f.flag || f.severity || '');
									
									// Parse reference range
									const parseReferenceRange = (rangeStr) => {
										if (!rangeStr || rangeStr === '—' || rangeStr === '' || rangeStr === null || rangeStr === undefined) {
											return { min: null, max: null, display: 'Not provided' };
										}
										
										const rangeStrClean = String(rangeStr).trim();
										const match = rangeStrClean.match(/(\d+\.?\d*)\s*[-–—to]\s*(\d+\.?\d*)/i);
										if (match) {
											return {
												min: parseFloat(match[1]),
												max: parseFloat(match[2]),
												display: rangeStrClean
											};
										}
										
										const singleMatch = rangeStrClean.match(/([<>≤≥])\s*(\d+\.?\d*)/i);
										if (singleMatch) {
											const value = parseFloat(singleMatch[2]);
											if (singleMatch[1] === '<' || singleMatch[1] === '≤') {
												return { min: null, max: value, display: rangeStrClean };
											} else {
												return { min: value, max: null, display: rangeStrClean };
											}
										}
										
										return { min: null, max: null, display: rangeStrClean || 'Not provided' };
									};
									
									const refRange = parseReferenceRange(f.referenceRange || f.reference_range || f.range || f.reference);
									
									return (
										<tr
											key={i}
											className={`hover:bg-gray-50 transition-colors ${
												isHigh ? 'bg-red-50/40 border-l-4 border-l-red-500' : isLow ? 'bg-amber-50/40 border-l-4 border-l-amber-500' : 'bg-white border-l-4 border-l-gray-300'
											}`}
										>
											{/* Test Name */}
											<td className="px-3 py-3 border-b border-gray-200">
												<div className="flex items-center gap-1.5">
													<div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
														isHigh ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-gray-400'
													}`}></div>
													<span className="text-xs font-semibold text-gray-900 break-words">
														{f.test || f.testName || 'Unknown Test'}
													</span>
												</div>
											</td>
											
											{/* Your Value */}
											<td className="px-3 py-3 border-b border-gray-200">
												<div className="flex items-center gap-1">
													<span className={`text-sm font-bold ${
														isHigh ? 'text-red-700' : isLow ? 'text-amber-700' : 'text-gray-900'
													}`}>
														{f.value || f.result || '—'}
													</span>
													{isHigh && (
														<svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
														</svg>
													)}
													{isLow && (
														<svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
														</svg>
													)}
												</div>
											</td>
											
											{/* Unit */}
											<td className="px-3 py-3 border-b border-gray-200">
												<span className="text-xs font-medium text-gray-600">
													{f.unit || '—'}
												</span>
											</td>
											
											{/* Normal Range */}
											<td className="px-3 py-3 border-b border-gray-200">
												<div className="flex flex-col gap-0.5">
													{refRange.display && refRange.display !== 'Not provided' ? (
														<span className="text-xs font-semibold text-gray-800 break-words">
															{refRange.display}
														</span>
													) : (
														<span className="text-xs text-gray-400 italic">
															{translations.notAvailable}
														</span>
													)}
													{refRange.min !== null && refRange.max !== null && (
														<div className="flex flex-wrap gap-1 text-[10px] text-gray-500">
															<span className="bg-gray-100 px-1.5 py-0.5 rounded">Min: {refRange.min}</span>
															<span className="bg-gray-100 px-1.5 py-0.5 rounded">Max: {refRange.max}</span>
														</div>
													)}
												</div>
											</td>
											
											{/* Status */}
											<td className="px-3 py-3 border-b border-gray-200 text-center">
												<span
													className={`inline-flex items-center gap-0.5 px-2 py-1 rounded text-[10px] font-bold ${
														isHigh
															? 'bg-red-100 text-red-800 border border-red-300'
															: isLow
															? 'bg-amber-100 text-amber-800 border border-amber-300'
															: 'bg-gray-100 text-gray-800 border border-gray-300'
													}`}
												>
													{isHigh ? (
														<>
															<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
															</svg>
															<span className="hidden sm:inline">{translations.high}</span>
														</>
													) : isLow ? (
														<>
															<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
															</svg>
															<span className="hidden sm:inline">{translations.low}</span>
														</>
													) : (
														<span className="text-[10px]">{f.flag || f.severity || (language === 'hi' ? 'असामान्य' : 'Abn')}</span>
													)}
												</span>
											</td>
											
											{/* Interpretation */}
											<td className="px-3 py-3 border-b border-gray-200">
												{(() => {
													const interpretation = f.interpretation || '';
													if (!interpretation) {
														return <span className="text-xs text-gray-400 italic">{translations.notAvailable}</span>;
													}
													
													// Split by common bullet point delimiters
													const bulletPoints = interpretation
														.split(/[•\-\*\|]/)
														.map(p => p.trim())
														.filter(p => p.length > 0)
														.slice(0, 4); // Limit to 4 bullet points max
													
													if (bulletPoints.length > 0) {
														return (
															<ul className="list-none space-y-0.5">
																{bulletPoints.map((point, idx) => (
																	<li key={idx} className="text-xs text-gray-700 flex items-start gap-1">
																		<span className="text-gray-500 mt-0.5 flex-shrink-0">•</span>
																		<span className="break-words">{point}</span>
																	</li>
																))}
															</ul>
														);
													}
													
													// If no bullet points found, show first 100 chars
													return (
														<span className="text-xs text-gray-700 break-words line-clamp-3">
															{interpretation.length > 100 ? interpretation.substring(0, 100) + '...' : interpretation}
														</span>
													);
												})()}
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				)}
			</div>

			{/* Global Statistics & Patient Impact Facts Section */}
			{(() => {
				// Use translated versions if available
				const statsToUse = globalStats || disease?.globalStatistics;
				const impactToUse = patientImpact || disease?.patientImpactFacts;
				
				// Debug: Log what we have
				console.log('🔍 Checking global statistics display:', {
					language,
					hasGlobalStatsObj: !!statsToUse,
					globalStatsType: typeof statsToUse,
					globalStatsObj: statsToUse,
					globalPrevalence: statsToUse?.globalPrevalence,
					incidenceRate: statsToUse?.incidenceRate,
					hasPatientImpactObj: !!impactToUse,
					patientImpactObj: impactToUse
				});
				
				// If globalStatistics exists but is empty object, try to get it from disease object directly
				if (statsToUse && typeof statsToUse === 'object' && Object.keys(statsToUse).length === 0) {
					console.warn('⚠️  globalStatistics is empty object, checking disease object directly');
				}
				
				// Check if globalStatistics object exists (even if empty)
				const hasGlobalStatsObj = statsToUse && typeof statsToUse === 'object';
				
				// Check if any field in globalStatistics has data
				const hasGlobalStats = hasGlobalStatsObj && (
					(statsToUse.globalPrevalence && statsToUse.globalPrevalence.trim() !== '') ||
					(statsToUse.incidenceRate && statsToUse.incidenceRate.trim() !== '') ||
					(statsToUse.mortalityRate && statsToUse.mortalityRate.trim() !== '') ||
					(statsToUse.ageGroups && statsToUse.ageGroups.trim() !== '') ||
					(statsToUse.genderDistribution && statsToUse.genderDistribution.trim() !== '') ||
					(statsToUse.economicImpact && statsToUse.economicImpact.trim() !== '') ||
					(statsToUse.trends && statsToUse.trends.trim() !== '') ||
					(statsToUse.caseDistribution && statsToUse.caseDistribution.trim() !== '') ||
					(Array.isArray(statsToUse.affectedRegions) && statsToUse.affectedRegions.length > 0)
				);
				
				// Check if patientImpactFacts object exists
				const hasPatientImpactObj = impactToUse && typeof impactToUse === 'object';
				
				// Check if any category in patientImpactFacts has data
				const hasPatientImpact = hasPatientImpactObj && (
					(Array.isArray(impactToUse.lifestyleImpact) && impactToUse.lifestyleImpact.length > 0) ||
					(Array.isArray(impactToUse.workImpact) && impactToUse.workImpact.length > 0) ||
					(Array.isArray(impactToUse.familyImpact) && impactToUse.familyImpact.length > 0) ||
					(Array.isArray(impactToUse.financialImpact) && impactToUse.financialImpact.length > 0) ||
					(Array.isArray(impactToUse.emotionalImpact) && impactToUse.emotionalImpact.length > 0) ||
					(Array.isArray(impactToUse.longTermOutlook) && impactToUse.longTermOutlook.length > 0) ||
					(Array.isArray(impactToUse.qualityOfLife) && impactToUse.qualityOfLife.length > 0) ||
					(Array.isArray(impactToUse.precautions) && impactToUse.precautions.length > 0)
				);
				
				console.log('🔍 Display check results:', {
					hasGlobalStatsObj,
					hasGlobalStats,
					hasPatientImpactObj,
					hasPatientImpact,
					willShow: hasGlobalStats || hasPatientImpact
				});
				
				if (!hasGlobalStats && !hasPatientImpact) {
					console.log('⚠️  No global statistics or patient impact facts to display');
					console.log('   Global stats object:', disease?.globalStatistics);
					console.log('   Patient impact object:', disease?.patientImpactFacts);
					return null;
				}
				
				return (
					<div className="card">
						<h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
							<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							Global Statistics & How This Affects You
						</h3>
					
					{/* Global Statistics */}
					{hasGlobalStatsObj && (
						<div className="mb-6">
							<h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
								<svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
								</svg>
								How Many People Are Diagnosed With This Disease Worldwide
							</h4>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{statsToUse.globalPrevalence && statsToUse.globalPrevalence.trim() !== '' && (
									<div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg shadow-sm">
										<div className="flex items-center justify-between mb-2">
											<p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">{translations.totalPeopleDiagnosed}</p>
											<svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
											</svg>
										</div>
										<p className="text-base font-bold text-gray-900 leading-tight">{statsToUse.globalPrevalence}</p>
									</div>
								)}
								{statsToUse.incidenceRate && statsToUse.incidenceRate.trim() !== '' && (
									<div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg shadow-sm">
										<div className="flex items-center justify-between mb-2">
											<p className="text-xs font-semibold text-green-700 uppercase tracking-wide">{translations.newDiagnosesPerYear}</p>
											<svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
											</svg>
										</div>
										<p className="text-base font-bold text-gray-900 leading-tight">{statsToUse.incidenceRate}</p>
									</div>
								)}
								{statsToUse.mortalityRate && statsToUse.mortalityRate.trim() !== '' && (
									<div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm">
										<div className="flex items-center justify-between mb-2">
											<p className="text-xs font-semibold text-red-700 uppercase tracking-wide">{translations.mortalityRate}</p>
											<svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
											</svg>
										</div>
										<p className="text-base font-bold text-gray-900 leading-tight">{statsToUse.mortalityRate}</p>
									</div>
								)}
								{statsToUse.ageGroups && statsToUse.ageGroups.trim() !== '' && (
									<div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-lg shadow-sm">
										<div className="flex items-center justify-between mb-2">
											<p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">{translations.mostAffectedAgeGroups}</p>
											<svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
										</div>
										<p className="text-base font-bold text-gray-900 leading-tight">{statsToUse.ageGroups}</p>
									</div>
								)}
								{statsToUse.genderDistribution && statsToUse.genderDistribution.trim() !== '' && (
									<div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg shadow-sm">
										<div className="flex items-center justify-between mb-2">
											<p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">{translations.genderDistribution}</p>
											<svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
											</svg>
										</div>
										<p className="text-base font-bold text-gray-900 leading-tight">{statsToUse.genderDistribution}</p>
									</div>
								)}
								{statsToUse.economicImpact && statsToUse.economicImpact.trim() !== '' && (
									<div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-lg shadow-sm">
										<div className="flex items-center justify-between mb-2">
											<p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">{translations.economicImpact}</p>
											<svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
										</div>
										<p className="text-base font-bold text-gray-900 leading-tight">{statsToUse.economicImpact}</p>
									</div>
								)}
								{statsToUse.trends && statsToUse.trends.trim() !== '' && (
									<div className="bg-teal-50 border-l-4 border-teal-500 p-4 rounded-lg shadow-sm md:col-span-2">
										<div className="flex items-center justify-between mb-2">
											<p className="text-xs font-semibold text-teal-700 uppercase tracking-wide">{translations.globalTrends}</p>
											<svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
											</svg>
										</div>
										<p className="text-base font-bold text-gray-900 leading-tight">{statsToUse.trends}</p>
									</div>
								)}
								{statsToUse.caseDistribution && statsToUse.caseDistribution.trim() !== '' && (
									<div className="bg-cyan-50 border-l-4 border-cyan-500 p-4 rounded-lg shadow-sm md:col-span-2">
										<div className="flex items-center justify-between mb-2">
											<p className="text-xs font-semibold text-cyan-700 uppercase tracking-wide">{translations.caseDistribution}</p>
											<svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
										</div>
										<p className="text-base font-bold text-gray-900 leading-tight">{statsToUse.caseDistribution}</p>
									</div>
								)}
								{statsToUse.affectedRegions && statsToUse.affectedRegions.length > 0 && (
									<div className="bg-gray-50 border-l-4 border-gray-500 p-4 rounded-lg shadow-sm md:col-span-2">
										<div className="flex items-center justify-between mb-2">
											<p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{translations.mostAffectedRegions}</p>
											<svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
										</div>
										<div className="flex flex-wrap gap-2">
											{disease.globalStatistics.affectedRegions.map((region, i) => (
												<span key={i} className="px-3 py-1.5 bg-white rounded-md text-sm font-semibold text-gray-700 border-2 border-gray-300 shadow-sm">
													{region}
												</span>
											))}
										</div>
									</div>
								)}
							</div>
						</div>
					)}
					
					{/* Patient Impact Facts */}
					{hasPatientImpactObj && (
						<div>
							<h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
								<svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
								</svg>
								{translations.howThisAffectsYou}
							</h4>
							<div className="space-y-4">
								{impactToUse.lifestyleImpact && impactToUse.lifestyleImpact.length > 0 && (
									<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
										<h5 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
											{translations.lifestyleImpact}
										</h5>
										<ul className="space-y-1">
											{impactToUse.lifestyleImpact.map((fact, i) => (
												<li key={i} className="text-sm text-gray-700 flex items-start gap-2">
													<span className="text-blue-500 mt-1">•</span>
													<span>{fact}</span>
												</li>
											))}
										</ul>
									</div>
								)}
								
								{impactToUse.workImpact && impactToUse.workImpact.length > 0 && (
									<div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
										<h5 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
											</svg>
											{translations.workEmployment}
										</h5>
										<ul className="space-y-1">
											{impactToUse.workImpact.map((fact, i) => (
												<li key={i} className="text-sm text-gray-700 flex items-start gap-2">
													<span className="text-purple-500 mt-1">•</span>
													<span>{fact}</span>
												</li>
											))}
										</ul>
									</div>
								)}
								
								{impactToUse.familyImpact && impactToUse.familyImpact.length > 0 && (
									<div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
										<h5 className="font-semibold text-pink-900 mb-2 flex items-center gap-2">
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
											</svg>
											{translations.familyConsiderations}
										</h5>
										<ul className="space-y-1">
											{impactToUse.familyImpact.map((fact, i) => (
												<li key={i} className="text-sm text-gray-700 flex items-start gap-2">
													<span className="text-pink-500 mt-1">•</span>
													<span>{fact}</span>
												</li>
											))}
										</ul>
									</div>
								)}
								
								{impactToUse.financialImpact && impactToUse.financialImpact.length > 0 && (
									<div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
										<h5 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
											{translations.financialImpact}
										</h5>
										<ul className="space-y-1">
											{impactToUse.financialImpact.map((fact, i) => (
												<li key={i} className="text-sm text-gray-700 flex items-start gap-2">
													<span className="text-amber-500 mt-1">•</span>
													<span>{fact}</span>
												</li>
											))}
										</ul>
									</div>
								)}
								
								{impactToUse.emotionalImpact && impactToUse.emotionalImpact.length > 0 && (
									<div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
										<h5 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
											</svg>
											{translations.emotionalMentalHealth}
										</h5>
										<ul className="space-y-1">
											{impactToUse.emotionalImpact.map((fact, i) => (
												<li key={i} className="text-sm text-gray-700 flex items-start gap-2">
													<span className="text-indigo-500 mt-1">•</span>
													<span>{fact}</span>
												</li>
											))}
										</ul>
									</div>
								)}
								
								{impactToUse.longTermOutlook && impactToUse.longTermOutlook.length > 0 && (
									<div className="bg-green-50 border border-green-200 rounded-lg p-4">
										<h5 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
											</svg>
											{translations.longTermOutlook}
										</h5>
										<ul className="space-y-1">
											{impactToUse.longTermOutlook.map((fact, i) => (
												<li key={i} className="text-sm text-gray-700 flex items-start gap-2">
													<span className="text-green-500 mt-1">•</span>
													<span>{fact}</span>
												</li>
											))}
										</ul>
									</div>
								)}
								
								{impactToUse.qualityOfLife && impactToUse.qualityOfLife.length > 0 && (
									<div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
										<h5 className="font-semibold text-teal-900 mb-2 flex items-center gap-2">
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
											{translations.qualityOfLife}
										</h5>
										<ul className="space-y-1">
											{impactToUse.qualityOfLife.map((fact, i) => (
												<li key={i} className="text-sm text-gray-700 flex items-start gap-2">
													<span className="text-teal-500 mt-1">•</span>
													<span>{fact}</span>
												</li>
											))}
										</ul>
									</div>
								)}
								
								{impactToUse.precautions && impactToUse.precautions.length > 0 && (
									<div className="bg-red-50 border border-red-200 rounded-lg p-4">
										<h5 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
											</svg>
											{translations.importantPrecautions}
										</h5>
										<ul className="space-y-1">
											{impactToUse.precautions.map((fact, i) => (
												<li key={i} className="text-sm text-gray-700 flex items-start gap-2">
													<span className="text-red-500 mt-1">•</span>
													<span>{fact}</span>
												</li>
											))}
										</ul>
									</div>
								)}
							</div>
						</div>
					)}
				</div>
				);
			})()}

		</div>
	);
}


