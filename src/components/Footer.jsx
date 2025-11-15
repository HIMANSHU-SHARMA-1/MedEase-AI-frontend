export default function Footer() {
	return (
		<footer className="border-t bg-white dark:bg-gray-900 dark:border-gray-700">
			<div className="container mx-auto px-4 py-6">
				{/* Disclaimer - Middle */}
				<div className="text-center mb-6">
					<p className="text-sm text-gray-600 dark:text-gray-400">
						<strong className="dark:text-gray-300">Disclaimer:</strong> This information is for educational purposes only and not a substitute
						for professional medical advice.
					</p>
				</div>
				
				{/* Bottom Row - Contact Us (Left) and Copyright (Right) */}
				<div className="flex flex-col md:flex-row justify-between items-center gap-4">
					{/* Contact Us - Bottom Left */}
					<div className="text-center md:text-left">
						<a
							href="mailto:himanshusharma20969@gmail.com?subject=MedEase Inquiry"
							className="text-sm text-sky-700 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 hover:underline transition-colors"
							onClick={(e) => {
								window.location.href = 'mailto:himanshusharma20969@gmail.com?subject=MedEase Inquiry';
							}}
						>
							<strong>Contact Us</strong> 
						</a>
					</div>
					
					{/* Copyright - Bottom Right */}
					<div className="text-center md:text-right">
						<p className="text-sm text-gray-600 dark:text-gray-400">
							&copy; {new Date().getFullYear()} MedEase. All rights reserved.
						</p>
					</div>
				</div>
			</div>
		</footer>
	);
}


