'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Calendar as CalendarIcon, Clock, AlertTriangle } from 'lucide-react';

export default function CalendarPage() {
  const { getToken, user, isDemo, signOut } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        if (isDemo) {
          // Provide mock events for demo users
          setEvents([
            {
              id: '1',
              summary: 'Team Sync',
              start: { dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() },
              end: { dateTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString() }
            },
            {
              id: '2',
              summary: 'Project Review',
              start: { dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() },
              end: { dateTime: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString() }
            }
          ]);
          setLoading(false);
          return;
        }

        const token = await getToken();
        if (!token) throw new Error("No access token available. Please sign in again with Google to view your calendar.");

        const timeMin = new Date().toISOString();
        const timeMax = new Date();
        timeMax.setDate(timeMax.getDate() + 7);

        const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax.toISOString()}&singleEvents=true&orderBy=startTime`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.status === 401) {
          throw new Error('Your session has expired. Please sign out and sign in again with Google.');
        }
        if (!res.ok) {
          throw new Error('Failed to fetch calendar events. You may need to grant Calendar permissions.');
        }

        const data = await res.json();
        setEvents(data.items || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCalendar();
    }
  }, [user, getToken]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Syncing with Google Calendar...</div>;
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-indigo-600" />
            Your Schedule
          </h1>
          <p className="text-slate-500 text-sm mt-1">Upcoming events for the next 7 days</p>
        </div>
        <button className="px-4 py-2 bg-indigo-50 text-indigo-700 font-semibold rounded-lg text-sm hover:bg-indigo-100 transition-colors">
          Optimize Schedule
        </button>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="mb-2">{error}</p>
            {error.includes('No access token available') || error.includes('session has expired') ? (
              <button onClick={() => {
                signOut();
              }} className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg font-medium transition-colors">
                Sign Out & Re-authenticate
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {events.length === 0 ? (
            <div className="text-center text-slate-400 py-12">No upcoming events found.</div>
          ) : (
            events.map((event) => {
              const start = event.start.dateTime || event.start.date;
              const end = event.end.dateTime || event.end.date;
              const isAllDay = !event.start.dateTime;
              
              const startDate = new Date(start);
              const endDate = new Date(end);
              
              return (
                <div key={event.id} className="flex gap-4 p-4 rounded-xl border border-slate-200 hover:border-indigo-200 hover:shadow-sm transition-all bg-white group">
                  <div className="w-16 flex flex-col items-center justify-center border-r border-slate-100 pr-4 shrink-0">
                    <span className="text-xs font-bold text-indigo-600 uppercase">
                      {startDate.toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <span className="text-2xl font-black text-slate-900">
                      {startDate.getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-bold text-slate-900 truncate">{event.summary || 'Untitled Event'}</h4>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {isAllDay ? 'All Day' : `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
