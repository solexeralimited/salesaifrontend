'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { MetricCard, Card, PageHeader } from '@/components/ui';
import { analyticsApi } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function DashboardPage() {
  const [stats, setStats] = useState<Record<string, Record<string, string | number>> | null>(null);
  const [funnel, setFunnel] = useState<{ stage: string; count: string }[]>([]);
  const [weekData, setWeekData] = useState<{ week: string; count: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsApi.dashboard(),
      analyticsApi.stageFunnel(),
      analyticsApi.leadsByWeek(),
    ]).then(([d, f, w]) => {
      setStats(d.data);
      setFunnel(f.data);
      setWeekData(w.data.map((r: { week: string; count: string }) => ({
        week: new Date(r.week).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        count: parseInt(r.count),
      })));
    }).finally(() => setLoading(false));
  }, []);

  const tierData = stats ? [
    { name: 'Green (>80)', value: parseInt(stats.leads?.green as string || '0'), color: '#16a34a' },
    { name: 'Amber (40-79)', value: parseInt(stats.leads?.amber as string || '0'), color: '#d97706' },
    { name: 'Red (<40)', value: parseInt(stats.leads?.red as string || '0'), color: '#dc2626' },
  ] : [];

  const stageColors: Record<string, string> = {
    new: '#60a5fa', contacted: '#34d399', replied: '#fbbf24',
    meeting: '#a78bfa', quoted: '#f97316', won: '#22c55e', lost: '#94a3b8',
  };

  return (
    <AppLayout>
      <PageHeader title="Dashboard" subtitle="Overview of your sales pipeline" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-400">Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard label="Total leads" value={stats?.leads?.total || 0} delta={`+${stats?.leads?.new_this_week || 0} this week`} deltaUp />
              <MetricCard label="Green (engaged)" value={stats?.leads?.green || 0} delta={`${Math.round(parseInt(stats?.leads?.green as string || '0') / parseInt(stats?.leads?.total as string || '1') * 100)}% of pipeline`} deltaUp />
              <MetricCard label="Meetings (30d)" value={stats?.meetings?.total || 0} />
              <MetricCard label="AI messages (30d)" value={stats?.messages?.ai_sent || 0} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h3 className="text-sm font-medium text-gray-700 mb-4">Leads by stage</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={funnel}>
                    <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {funnel.map((f) => (
                        <Cell key={f.stage} fill={stageColors[f.stage] || '#60a5fa'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card>
                <h3 className="text-sm font-medium text-gray-700 mb-4">Interest score distribution</h3>
                <div className="flex items-center gap-6">
                  <PieChart width={160} height={160}>
                    <Pie data={tierData} cx={75} cy={75} innerRadius={45} outerRadius={70} dataKey="value">
                      {tierData.map((t, i) => <Cell key={i} fill={t.color} />)}
                    </Pie>
                  </PieChart>
                  <div className="space-y-2">
                    {tierData.map((t) => (
                      <div key={t.name} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                        <span className="text-gray-600">{t.name}</span>
                        <span className="font-medium ml-auto">{t.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            <Card>
              <h3 className="text-sm font-medium text-gray-700 mb-4">Leads per week</h3>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={weekData}>
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  );
}
