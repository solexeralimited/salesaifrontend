'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { ScorePill, Badge, PageHeader, Button, EmptyState } from '@/components/ui';
import { leadsApi } from '@/lib/api';

interface Lead {
  id: string; name: string; email: string; phone: string; company_name: string;
  interest_score: number; score_tier: string; stage: string;
  quote_value: number; assigned_name: string; updated_at: string;
}

const stageLabel: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' }> = {
  new: { label: 'New', variant: 'info' },
  contacted: { label: 'Contacted', variant: 'default' },
  replied: { label: 'Replied', variant: 'info' },
  meeting: { label: 'Meeting booked', variant: 'success' },
  quoted: { label: 'Quoted', variant: 'warning' },
  won: { label: 'Won', variant: 'success' },
  lost: { label: 'Lost', variant: 'danger' },
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (tierFilter) params.tier = tierFilter;
      const { data } = await leadsApi.list(params);
      setLeads(data.leads);
      setTotal(data.total);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchLeads(); }, [search, tierFilter]);

  const handleCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const { data } = await leadsApi.importCsv(file);
      alert(`Imported ${data.imported} leads, skipped ${data.skipped}`);
      fetchLeads();
    } catch { alert('Import failed'); }
    finally { setImporting(false); e.target.value = ''; }
  };

  return (
    <AppLayout>
      <PageHeader
        title={`Leads ${total ? `(${total})` : ''}`}
        actions={
          <>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCsvImport} />
            <Button onClick={() => fileRef.current?.click()} disabled={importing} size="sm">
              {importing ? 'Importing...' : '⬆ Import CSV'}
            </Button>
            <Link href="/leads/new">
              <Button variant="primary" size="sm">+ New lead</Button>
            </Link>
          </>
        }
      />

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Filters */}
        <div className="px-6 py-3 border-b border-gray-100 bg-white flex items-center gap-3 flex-shrink-0">
          <input
            type="text"
            placeholder="Search name, company, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 max-w-xs px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {['', 'green', 'amber', 'red'].map((t) => (
            <button key={t}
              onClick={() => setTierFilter(t)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${tierFilter === t ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:border-gray-400'}`}
            >
              {t ? t.charAt(0).toUpperCase() + t.slice(1) : 'All'}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-gray-400">Loading leads…</div>
          ) : leads.length === 0 ? (
            <EmptyState icon="👥" title="No leads yet" description="Import a CSV or add your first lead to get started." />
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  {['Name', 'Company', 'Quote', 'Score', 'Stage', 'Assigned', 'Updated'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => window.location.href = `/leads/${lead.id}`}>
                    <td className="px-4 py-3 font-medium text-gray-900">{lead.name}</td>
                    <td className="px-4 py-3 text-gray-500">{lead.company_name || '—'}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {lead.quote_value ? `$${Number(lead.quote_value).toLocaleString()}` : '—'}
                    </td>
                    <td className="px-4 py-3"><ScorePill score={lead.interest_score} /></td>
                    <td className="px-4 py-3">
                      <Badge label={stageLabel[lead.stage]?.label || lead.stage} variant={stageLabel[lead.stage]?.variant} />
                    </td>
                    <td className="px-4 py-3 text-gray-500">{lead.assigned_name || '—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(lead.updated_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
