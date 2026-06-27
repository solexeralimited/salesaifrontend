'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { PageHeader, Button, Card } from '@/components/ui';
import { leadsApi } from '@/lib/api';

const stages = ['new', 'contacted', 'replied', 'meeting', 'quoted', 'won', 'lost'];

export default function NewLeadPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', company_name: '',
    quote_value: '', stage: 'new', notes: '',
  });

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const { data } = await leadsApi.create({
        ...form,
        quote_value: form.quote_value ? parseFloat(form.quote_value) : undefined,
      });
      router.push(`/leads/${data.id}`);
    } catch {
      alert('Failed to create lead. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader title="New lead" subtitle="Add a lead manually to your pipeline" />
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
          <Card>
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Contact details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">
                  Full name <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="jane@example.com"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  placeholder="+1 555 000 0000"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Company</label>
                <input
                  value={form.company_name}
                  onChange={e => set('company_name', e.target.value)}
                  placeholder="Acme Roofing"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Quote value ($)</label>
                <input
                  type="number"
                  min={0}
                  value={form.quote_value}
                  onChange={e => set('quote_value', e.target.value)}
                  placeholder="5000"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Pipeline</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Stage</label>
                <select
                  value={form.stage}
                  onChange={e => set('stage', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {stages.map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => set('notes', e.target.value)}
                  placeholder="Any initial context about this lead…"
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          </Card>

          <div className="flex gap-3">
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Creating…' : 'Create lead'}
            </Button>
            <Button type="button" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
