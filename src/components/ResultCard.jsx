export default function ResultCard({ disease, summary }) {
	if (!disease) return null;
	const s = summary || disease.aiSummary || {};
	return (
		<div className="grid md:grid-cols-2 gap-4">
			<div className="card">
				<h3 className="text-lg font-semibold mb-2">Cause</h3>
				<p className="text-gray-700 whitespace-pre-wrap">{s.cause || '—'}</p>
			</div>
			<div className="card">
				<h3 className="text-lg font-semibold mb-2">Symptoms</h3>
				<ul className="list-disc list-inside text-gray-700">
					{(s.symptoms || []).map((it, i) => (
						<li key={i}>{it}</li>
					))}
				</ul>
			</div>
			<div className="card">
				<h3 className="text-lg font-semibold mb-2">Prevention</h3>
				<ul className="list-disc list-inside text-gray-700">
					{(s.prevention || []).map((it, i) => (
						<li key={i}>{it}</li>
					))}
				</ul>
			</div>
			<div className="card">
				<h3 className="text-lg font-semibold mb-2">Treatments</h3>
				<ul className="list-disc list-inside text-gray-700">
					{(s.treatments || []).map((it, i) => (
						<li key={i}>{it}</li>
					))}
				</ul>
			</div>
			<div className="card">
				<h3 className="text-lg font-semibold mb-2">Medications</h3>
				<ul className="list-disc list-inside text-gray-700">
					{(s.medications || []).map((it, i) => (
						<li key={i}>{it}</li>
					))}
				</ul>
			</div>
			{s.medicationDetails?.length ? (
				<div className="card md:col-span-2">
					<h3 className="text-lg font-semibold mb-3">Medication Details</h3>
					<div className="space-y-4">
						{s.medicationDetails.map((med, idx) => (
							<div key={idx} className="border rounded p-3 bg-gray-50">
								<p className="font-semibold text-gray-800">{med.name}</p>
								<p className="text-sm text-gray-600">
									{med.rxCUI ? `RxCUI: ${med.rxCUI}` : 'RxCUI unavailable'}
									{med.sources?.length ? ` • Sources: ${med.sources.join(', ')}` : ''}
								</p>
								{med.brandNames?.length ? (
									<p className="text-sm text-gray-700 mt-1">
										<strong>Brand names:</strong> {med.brandNames.join(', ')}
									</p>
								) : null}
								{med.effect ? (
									<div className="mt-2">
										<p className="text-sm font-semibold text-gray-800 mb-1">What it does:</p>
										<ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
											{med.effect.split(' | ')
												.filter(point => point.trim().length > 10)
												.slice(0, 6)
												.map((point, idx) => {
													const cleaned = point.trim();
													return <li key={idx}>{cleaned}</li>;
												})}
										</ul>
									</div>
								) : null}
								{med.fdaWarnings?.length ? (
									<div className="mt-2">
										<p className="text-sm font-semibold text-red-700">Warnings / Precautions</p>
										<ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
											{med.fdaWarnings.slice(0, 3).map((warning, warningIdx) => (
												<li key={warningIdx}>{warning}</li>
											))}
										</ul>
									</div>
								) : null}
								{med.fdaAdverseReactions?.length ? (
									<div className="mt-2">
										<p className="text-sm font-semibold text-amber-700">Common adverse reactions</p>
										<ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
											{med.fdaAdverseReactions.slice(0, 3).map((reaction, reactionIdx) => (
												<li key={reactionIdx}>{reaction}</li>
											))}
										</ul>
									</div>
								) : null}
								{med.drugBank?.mechanism ? (
									<p className="text-sm text-gray-700 mt-2">
										<strong>Mechanism:</strong> {med.drugBank.mechanism}
									</p>
								) : null}
								{med.pharmacyLinks?.length ? (
									<div className="mt-3">
										<p className="text-sm font-semibold text-gray-800">Buy from verified stores</p>
										<ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
											{med.pharmacyLinks.map((link, linkIdx) => (
												<li key={linkIdx}>
													<a
														className="text-sky-700 underline"
														href={link.url}
														target="_blank"
														rel="noreferrer"
													>
														{link.name}
													</a>
												</li>
											))}
										</ul>
									</div>
								) : null}
							</div>
						))}
					</div>
				</div>
			) : null}
			<div className="card">
				<h3 className="text-lg font-semibold mb-2">Emergency Home Remedy</h3>
				<ul className="list-disc list-inside text-gray-700">
					{(s.emergencyRemedies || []).length === 0 && <li>Seek professional care for emergencies.</li>}
					{(s.emergencyRemedies || []).map((it, i) => (
						<li key={i}>{it}</li>
					))}
				</ul>
				<p className="text-xs text-gray-500 mt-2">
					Temporary guidance only. Contact medical services for urgent symptoms.
				</p>
			</div>
			<div className="card">
				<h3 className="text-lg font-semibold mb-2">Duration & Severity</h3>
				<p className="text-gray-700">
					<strong>Typical Duration: </strong>
					{s.typicalDuration || '—'}
				</p>
				<p className="text-gray-700">
					<strong>Severity: </strong>
					{s.severity || '—'}
				</p>
			</div>
		</div>
	);
}


