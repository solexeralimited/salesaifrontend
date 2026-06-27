'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { MetricCard, Card, PageHeader } from '@/components/ui';
import { analyticsApi } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function AnalyticsPage() {
  const [dashboard, setDashboard] = useState<Record<string, Record<string, string | number>> | null>(null);
  const [weekData, setWeekData] = useState<{ week: string; count: number }[]>([]);
  const [channelData, setChannelData] = useState<{ channel: string; message_count: string }[]>([]);
  const [conversion, setConversion] = useState<{ won: string; total: string; rate: string } | null>(null);

  useEffect(() => {
    Promise.all([
      analyticsApi.dashboard(),
      analyticsApi.leadsByWeek(),
      analyticsApi.channelPerformance(),
      analyticsApi.conversionRate(),
    ]).then(([d, w, ch, cv]) => {
      setDashboard(d.data);
      setWeekData(w.data.map((r: { week: string; count: string }) => ({
        week: new Date(r.week).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        count: parseInt(r.count),
      })));
      setChannelData(ch.data);
      setConversion(cv.data);
    });
  }, []);

  const aiResolutionRate = dashboard
    ? Math.round((parseInt(dashboard.messages?.ai_sent as string || '0') / Math.max(1, parseInt(dashboard.messages?.total as string || '1'))) * 100)
    : 0;

  return (
    <AppLayout>
      <PageHeader title="Analytics" subtitle="Last 30 days" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="Conversion rate" value={`${conversion?.rate || 0}%`} delta={`${conversion?.won || 0} of ${conversion?.total || 0} leads`} deltaUp />
          <MetricCard label="AI resolution rate" value={`${aiResolutionRate}%`} delta="No rep needed" />
          <MetricCard label="Messages sent (AI)" value={dashboard?.messages?.ai_sent || 0} />
          <MetricCard label="Meetings completed" value={dashboard?.meetings?.completed || 0} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-sm font-medium text-gray-700 mb-4">Leads imported per week</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weekData}>
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <h3 className="text-sm font-medium text-gray-700 mb-4">Messages by channel</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={channelData}>
                <XAxis dataKey="channel" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="message_count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
