'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { PageHeader, Button } from '@/components/ui';
import { calendarApi } from '@/lib/api';

interface Meeting {
  id: string; title: string; lead_name: string; scheduled_at: string;
  duration_minutes: number; status: string; assigned_name: string;
}

export default function CalendarPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString();
    const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).toISOString();
    calendarApi.meetings(start, end).then(({ data }) => setMeetings(data));
  }, [currentMonth]);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const today = new Date();

  const getMeetingsForDay = (day: number) => {
    return meetings.filter(m => {
      const d = new Date(m.scheduled_at);
      return d.getDate() === day && d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
    });
  };

  const statusColor: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-500',
    no_show: 'bg-red-100 text-red-800',
  };

  return (
    <AppLayout>
      <PageHeader
        title={currentMonth.toLocaleDateString('en', { month: 'long', year: 'numeric' })}
        actions={
          <>
            <Button size="sm" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>‹</Button>
            <Button size="sm" onClick={() => setCurrentMonth(new Date())}>Today</Button>
            <Button size="sm" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>›</Button>
          </>
        }
      />
      <div className="flex-1 overflow-y-auto p-3 md:p-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-7 border-b border-gray-100">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} className="py-2 text-center text-[10px] md:text-xs font-medium text-gray-500">
                <span className="hidden sm:inline">{d}</span>
                <span className="sm:hidden">{d[0]}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="border-b border-r border-gray-100 min-h-[48px] md:min-h-[100px] p-1 md:p-2 bg-gray-50" />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const dayMeetings = getMeetingsForDay(day);
              const isToday = today.getDate() === day && today.getMonth() === currentMonth.getMonth() && today.getFullYear() === currentMonth.getFullYear();
              return (
                <div key={day} className={`border-b border-r border-gray-100 min-h-[48px] md:min-h-[100px] p-1 md:p-2 ${isToday ? 'bg-blue-50' : ''}`}>
                  <div className={`text-xs md:text-sm font-medium mb-0.5 md:mb-1 ${isToday ? 'text-blue-700' : 'text-gray-700'}`}>{day}</div>
                  {dayMeetings.map(m => (
                    <div key={m.id} className={`text-[9px] md:text-[10px] px-1 md:px-1.5 py-0.5 rounded mb-0.5 truncate ${statusColor[m.status] || 'bg-blue-100 text-blue-800'}`}>
                      <span className="hidden sm:inline">{new Date(m.scheduled_at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })} </span>
                      {m.lead_name}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming list */}
        {meetings.filter(m => new Date(m.scheduled_at) >= new Date() && m.status === 'scheduled').length > 0 && (
          <div className="mt-4 md:mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Upcoming meetings</h3>
            <div className="space-y-2">
              {meetings
                .filter(m => new Date(m.scheduled_at) >= new Date() && m.status === 'scheduled')
                .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
                .map(m => (
                  <div key={m.id} className="bg-white border border-gray-200 rounded-lg px-3 md:px-4 py-3 flex items-start md:items-center gap-3 md:gap-4">
                    <div className="text-xl md:text-2xl mt-0.5 md:mt-0">📅</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900">{m.title}</div>
                      <div className="text-xs text-gray-500">{m.lead_name} · {m.assigned_name}</div>
                      <div className="text-xs text-gray-600 mt-0.5 md:hidden">
                        {new Date(m.scheduled_at).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                        {' at '}
                        {new Date(m.scheduled_at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className="hidden md:block text-sm text-gray-600 flex-shrink-0">
                      {new Date(m.scheduled_at).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                      {' at '}
                      {new Date(m.scheduled_at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
