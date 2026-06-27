'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { ScorePill, Card, PageHeader, Button, Badge } from '@/components/ui';
import { leadsApi } from '@/lib/api';

interface Lead {
  id: string; name: string; email: string; phone: string; company_name: string;
  interest_score: number; score_tier: string; stage: string; ai_summary: string;
  ai_sentiment: string; ai_main_objection: string; ai_mode_active: boolean;
  assigned_name: string; notes: string; created_at: string; quotes: Array<{
    id: string; reference: string; value: number; status: string;
  }>;
}

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    leadsApi.get(id).then(({ data }) => setLead(data)).finally(() => setLoading(false));
  }, [id]);

  const updateStage = async (stage: string) => {
    setSaving(true);
    const { data } = await leadsApi.update(id, { stage });
    setLead((l) => l ? { ...l, stage: data.stage } : l);
    setSaving(false);
  };

  const toggleAI = async () => {
    if (!lead) return;
    const { data } = await leadsApi.update(id, { ai_mode_active: !lead.ai_mode_active });
    setLead((l) => l ? { ...l, ai_mode_active: data.ai_mode_active } : l);
  };

  if (loading) return <AppLayout><div className="flex items-center justify-center h-full text-gray-400">Loading…</div></AppLayout>;
  if (!lead) return <AppLayout><div className="flex items-center justify-center h-full text-gray-400">Lead not found</div></AppLayout>;

  const initials = lead.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <AppLayout>
      <PageHeader
        title={lead.name}
        subtitle={`${lead.company_name || ''} · Stage: ${lead.stage}`}
        actions={
          <>
            <Link href={`/conversations?leadId=${lead.id}`}>
              <Button size="sm">💬 Conversation</Button>
            </Link>
            <Button size="sm" variant={lead.ai_mode_active ? 'secondary' : 'primary'} onClick={toggleAI}>
              🤖 AI {lead.ai_mode_active ? 'on' : 'off'}
            </Button>
          </>
        }
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Profile */}
        <Card className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-lg">
            {initials}
          </div>
          <div className="flex-1">
            <div className="text-lg font-semibold text-gray-900">{lead.name}</div>
            <div className="text-sm text-gray-500 mt-0.5">{lead.company_name}</div>
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
              {lead.phone && <span>📱 {lead.phone}</span>}
              {lead.email && <span>✉ {lead.email}</span>}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">Interest score</div>
            <ScorePill score={lead.interest_score} />
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* AI Summary */}
          <Card className="lg:col-span-2">
            <h3 className="text-sm font-medium text-gray-700 mb-2">AI summary</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{lead.ai_summary || 'No summary available yet.'}</p>
            {lead.ai_main_objection && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-gray-400">Main objection:</span>
                <Badge label={lead.ai_main_objection} variant="warning" />
              </div>
            )}
            {lead.ai_sentiment && (
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs text-gray-400">Sentiment:</span>
                <Badge
                  label={lead.ai_sentiment}
                  variant={lead.ai_sentiment === 'positive' ? 'success' : lead.ai_sentiment === 'negative' ? 'danger' : 'default'}
                />
              </div>
            )}
          </Card>

          {/* Actions */}
          <Card>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Move stage</h3>
            <div className="flex flex-col gap-2">
              {['new','contacted','replied','meeting','quoted','won','lost'].map(s => (
                <button
                  key={s}
                  onClick={() => updateStage(s)}
                  disabled={saving || lead.stage === s}
                  className={`text-left px-3 py-2 text-xs rounded-lg border transition-colors capitalize ${
                    lead.stage === s
                      ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium'
                      : 'border-gray-200 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {s === 'won' ? '✅ ' : s === 'lost' ? '❌ ' : ''}{s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Quotes */}
        {lead.quotes?.length > 0 && (
          <Card>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Quotes</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                  <th className="pb-2">Reference</th>
                  <th className="pb-2">Value</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {lead.quotes.map(q => (
                  <tr key={q.id} className="border-b border-gray-50">
                    <td className="py-2 text-gray-700">{q.reference}</td>
                    <td className="py-2 font-medium">${Number(q.value).toLocaleString()}</td>
                    <td className="py-2">
                      <Badge
                        label={q.status}
                        variant={q.status === 'accepted' ? 'success' : q.status === 'declined' ? 'danger' : 'default'}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {lead.notes && (
          <Card>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Notes</h3>
            <p className="text-sm text-gray-600">{lead.notes}</p>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
