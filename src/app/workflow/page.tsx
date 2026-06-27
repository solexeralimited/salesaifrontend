'use client';
import { useEffect, useState } from 'react';
import { Zap, Plus, Pause, Play } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { PageHeader, Button, Card, Badge, EmptyState } from '@/components/ui';
import { workflowsApi } from '@/lib/api';

interface Workflow {
  id: string; name: string; description: string; status: string;
  trigger_type: string; nodes: { type: string; config?: Record<string, string> }[];
  updated_at: string;
}

const triggerLabels: Record<string, string> = {
  lead_imported: '📥 Lead imported',
  score_dropped: '📉 Score drops below threshold',
  meeting_booked: '📅 Meeting booked',
  quote_declined: '❌ Quote declined',
  inbound_message: '💬 Inbound message received',
};

const nodeLabels: Record<string, string> = {
  send_whatsapp: '📱 Send WhatsApp',
  send_email: '✉️ Send email',
  notify_slack: '📣 Slack alert',
  update_stage: '🔀 Update stage',
  wait: '⏱ Wait',
};

export default function WorkflowPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', trigger_type: 'lead_imported' });

  const fetchWorkflows = () => workflowsApi.list().then(({ data }) => setWorkflows(data));
  useEffect(() => { fetchWorkflows(); }, []);

  const createWorkflow = async () => {
    await workflowsApi.create({
      ...form,
      nodes: [
        { type: 'send_whatsapp', config: { message: 'Hi {{name}}, following up on your roofing quote!' } },
      ],
      status: 'draft',
    });
    setCreating(false);
    setForm({ name: '', description: '', trigger_type: 'lead_imported' });
    fetchWorkflows();
  };

  const toggleStatus = async (wf: Workflow) => {
    const newStatus = wf.status === 'active' ? 'paused' : 'active';
    await workflowsApi.update(wf.id, { status: newStatus });
    fetchWorkflows();
  };

  return (
    <AppLayout>
      <PageHeader
        title="Workflows"
        subtitle="Automated sequences triggered by lead events"
        actions={<Button variant="primary" size="sm" onClick={() => setCreating(true)}><Plus className="w-3.5 h-3.5" />New workflow</Button>}
      />
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-5">
        {creating && (
          <Card>
            <h3 className="text-sm font-medium text-gray-700 mb-3">New workflow</h3>
            <div className="space-y-3">
              <input placeholder="Workflow name" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500" />
              <input placeholder="Description (optional)" value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500" />
              <select value={form.trigger_type} onChange={e => setForm(f => ({...f, trigger_type: e.target.value}))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500">
                {Object.entries(triggerLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <div className="flex gap-2">
                <Button variant="primary" size="sm" onClick={createWorkflow}>Create workflow</Button>
                <Button size="sm" onClick={() => setCreating(false)}>Cancel</Button>
              </div>
            </div>
          </Card>
        )}

        {workflows.length === 0 && !creating ? (
          <EmptyState icon={<Zap className="w-10 h-10" />} title="No workflows yet" description="Create automated sequences to engage leads without manual intervention." />
        ) : (
          workflows.map(wf => (
            <Card key={wf.id}>
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900 text-sm">{wf.name}</h3>
                    <Badge
                      label={wf.status}
                      variant={wf.status === 'active' ? 'success' : wf.status === 'paused' ? 'warning' : 'default'}
                    />
                  </div>
                  {wf.description && <p className="text-xs text-gray-500 mb-2">{wf.description}</p>}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                      {triggerLabels[wf.trigger_type] || wf.trigger_type}
                    </span>
                    <span className="text-gray-300">→</span>
                    {wf.nodes?.map((n, i) => (
                      <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                        {nodeLabels[n.type] || n.type}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <Button size="sm" onClick={() => toggleStatus(wf)}>
                    {wf.status === 'active' ? <><Pause className="w-3.5 h-3.5" />Pause</> : <><Play className="w-3.5 h-3.5" />Activate</>}
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </AppLayout>
  );
}
