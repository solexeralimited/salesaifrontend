'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { PageHeader, Button, Card } from '@/components/ui';
import { companyApi } from '@/lib/api';

interface Company {
  name: string; industry: string; timezone: string; primary_channel: string;
  ai_persona_name: string; ai_escalation_threshold: number; ai_max_messages: number;
  from_email: string;
}

interface User { id: string; name: string; email: string; role: string; last_login_at: string; }

export default function SettingsPage() {
  const [company, setCompany] = useState<Company | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([companyApi.get(), companyApi.users()]).then(([c, u]) => {
      setCompany(c.data);
      setUsers(u.data);
    });
  }, []);

  const save = async () => {
    if (!company) return;
    setSaving(true);
    try {
      await companyApi.update(company as unknown as Record<string, unknown>);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally { setSaving(false); }
  };

  const set = (key: keyof Company, value: string | number) =>
    setCompany(c => c ? { ...c, [key]: value } : c);

  const integrations = [
    { name: 'WhatsApp Business API', status: 'configured', icon: '📱' },
    { name: 'SendGrid (email)', status: 'configured', icon: '✉️' },
    { name: 'Google Calendar', status: 'not configured', icon: '📅' },
    { name: 'Slack (alerts)', status: 'not configured', icon: '📣' },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Settings"
        actions={
          <Button variant="primary" size="sm" onClick={save} disabled={saving}>
            {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save changes'}
          </Button>
        }
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-3xl">
        {company && (
          <>
            <Card>
              <h3 className="text-sm font-semibold text-gray-800 mb-4">Company</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['Company name', 'name', 'text'],
                  ['Industry', 'industry', 'text'],
                  ['From email', 'from_email', 'email'],
                  ['Timezone', 'timezone', 'text'],
                ].map(([label, key, type]) => (
                  <div key={key}>
                    <label className="block text-xs text-gray-500 mb-1">{label}</label>
                    <input
                      type={type}
                      value={(company[key as keyof Company] as string) || ''}
                      onChange={(e) => set(key as keyof Company, e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="text-sm font-semibold text-gray-800 mb-4">AI configuration</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">AI persona name</label>
                  <input value={company.ai_persona_name || ''} onChange={(e) => set('ai_persona_name', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Escalation threshold (score)</label>
                  <input type="number" min={0} max={100} value={company.ai_escalation_threshold}
                    onChange={(e) => set('ai_escalation_threshold', parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  <p className="text-xs text-gray-400 mt-1">Escalate to rep if score falls below this</p>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Max AI messages before escalation</label>
                  <input type="number" min={1} max={50} value={company.ai_max_messages}
                    onChange={(e) => set('ai_max_messages', parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Primary channel</label>
                  <select value={company.primary_channel}
                    onChange={(e) => set('primary_channel', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>
            </Card>
          </>
        )}

        <Card>
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Integrations</h3>
          <div className="space-y-3">
            {integrations.map(int => (
              <div key={int.name} className="flex items-center gap-3 py-2">
                <span className="text-xl">{int.icon}</span>
                <span className="text-sm text-gray-700 flex-1">{int.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${int.status === 'configured' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {int.status}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">Configure integration credentials in your .env file on the backend server.</p>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Team members</h3>
          <div className="space-y-2">
            {users.map(u => (
              <div key={u.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium text-xs">
                  {u.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{u.name}</div>
                  <div className="text-xs text-gray-400">{u.email}</div>
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded capitalize">{u.role}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
