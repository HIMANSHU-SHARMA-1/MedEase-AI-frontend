import { useEffect, useState } from 'react';
import api from '../utils/api.js';

export default function AdminPanel() {
	const [pending, setPending] = useState([]);
	const [saving, setSaving] = useState(false);

	async function load() {
		const { data } = await api.get('/api/admin/pending');
		setPending(data);
	}

	useEffect(() => {
		load();
	}, []);

	async function approve(item) {
		setSaving(true);
		try {
			await api.post(`/api/admin/approve/${item._id}`, {
				aiSummary: item.aiSummary,
				pharmacyLinks: item.pharmacyLinks
			});
			await load();
		} finally {
			setSaving(false);
		}
	}

	return (
		<div className="space-y-4">
			<h2 className="text-2xl font-bold">Admin Panel</h2>
			<div className="grid md:grid-cols-2 gap-4">
				{pending.map((p) => (
					<div key={p._id} className="card">
						<h3 className="text-lg font-semibold mb-2">{p.name}</h3>
						<p className="text-sm text-gray-600 mb-2">Severity: {p.aiSummary?.severity || '—'}</p>
						<button className="btn-primary" disabled={saving} onClick={() => approve(p)}>
							Approve
						</button>
					</div>
				))}
				{pending.length === 0 && <p>No pending summaries.</p>}
			</div>
		</div>
	);
}


