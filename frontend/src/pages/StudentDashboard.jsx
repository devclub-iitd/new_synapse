import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import api from '../api/axios';
import Loader from '../components/UI/Loader';
import { Star, MessageSquare, Calendar as CalendarIcon, Download } from 'lucide-react';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [feedbackNeeded, setFeedbackNeeded] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const calRes = await api.get('/user/calendar');
      
      const formattedEvents = calRes.data.map(event => ({
        title: event.name,
        start: event.date,
        backgroundColor: '#7c3aed',
        borderColor: '#7c3aed',
        extendedProps: { venue: event.venue }
      }));
      setCalendarEvents(formattedEvents);

      const recRes = await api.get('/events/recommendations');
      setRecommendations(recRes.data);

      const feedbackRes = await api.get('/user/feedback-pending'); 
      setFeedbackNeeded(feedbackRes.data);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadICS = () => {
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Synapse//Events//EN'];
    calendarEvents.forEach(evt => {
      const dt = new Date(evt.start);
      const stamp = dt.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
      lines.push('BEGIN:VEVENT');
      lines.push(`DTSTART:${stamp}`);
      lines.push(`SUMMARY:${(evt.title || '').replace(/[\r\n]/g, ' ')}`);
      if (evt.extendedProps?.venue) lines.push(`LOCATION:${evt.extendedProps.venue.replace(/[\r\n]/g, ' ')}`);
      lines.push(`UID:${stamp}-${Math.random().toString(36).slice(2)}@synapse`);
      lines.push('END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'synapse-calendar.ics';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <Loader />;

  return (
  <div className="container-fluid student-dashboard">
    <div className="row g-4">

      {/* LEFT: CALENDAR */}
      <div className="col-lg-8">
        <div className="widget-card h-100">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div className="dashboard-section-title" style={{marginBottom: 0}}>
              <CalendarIcon size={20} /> Your Calendar
            </div>
            <button className="btn-ics-download" onClick={downloadICS} title="Download .ics file">
              <Download size={15} /> Export .ics
            </button>
          </div>

          <div className="calendar-shell">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,listWeek'
              }}
              events={calendarEvents}
              height="520px"
            />
          </div>
        </div>
      </div>

      {/* RIGHT: SIDE WIDGETS */}
      <div className="col-lg-4 d-flex flex-column gap-4">

        {/* RECOMMENDATIONS */}
        <div className="widget-card">
          <h5 className="section-heading-sm mb-3">
            <Star size={18} className="text-warning" /> Recommended For You
          </h5>

          {recommendations.length > 0 ? (
            <div className="recommendation-list">
              {recommendations.slice(0, 3).map(event => (
                <div
                  key={event.id}
                  className="recommendation-item"
                  onClick={() => navigate(`/events/${event.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <h6 className="mb-1 fw-semibold">{event.name}</h6>
                  <span className="text-secondary small">
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-placeholder" style={{border: 'none', padding: '32px 16px'}}>
              <Star size={28} style={{opacity: 0.2}} />
              <p>No recommendations yet. Add interests in your profile!</p>
            </div>
          )}
        </div>

        {/* FEEDBACK */}
        <div className="widget-card">
          <h5 className="section-heading-sm mb-3">
            <MessageSquare size={18} className="text-info" /> Feedback Needed
          </h5>

          {feedbackNeeded.length > 0 ? (
            <div className="feedback-list">
              {feedbackNeeded.map(event => (
                <div key={event.id} className="feedback-item">
                  {event.name}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-placeholder" style={{border: 'none', padding: '32px 16px'}}>
              <MessageSquare size={28} style={{opacity: 0.2}} />
              <p>You're all caught up!</p>
            </div>
          )}
        </div>

      </div>
    </div>
  </div>
);

};

export default StudentDashboard;

