// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import FullCalendar from '@fullcalendar/react';
// import dayGridPlugin from '@fullcalendar/daygrid';
// import timeGridPlugin from '@fullcalendar/timegrid';
// import listPlugin from '@fullcalendar/list';
// import interactionPlugin from '@fullcalendar/interaction';
// import api from '../api/axios';
// import Loader from '../components/UI/Loader';
// import { Star, MessageSquare, Calendar as CalendarIcon, Download } from 'lucide-react';
// import { formatDate } from '../utils/dateUtils';

// const StudentDashboard = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(true);
//   const [calendarEvents, setCalendarEvents] = useState([]);
//   const [recommendations, setRecommendations] = useState([]);
//   const [feedbackNeeded, setFeedbackNeeded] = useState([]);

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     try {
//       setLoading(true);
//       const calRes = await api.get('/user/calendar');

//       const formattedEvents = calRes.data.map(event => ({
//         title: event.name,
//         start: event.date?.endsWith('Z') ? event.date : `${event.date}Z`,
//         backgroundColor: '#7c3aed',
//         borderColor: '#7c3aed',
//         extendedProps: { venue: event.venue }
//       }));
//       setCalendarEvents(formattedEvents);

//       const recRes = await api.get('/events/recommendations');
//       setRecommendations(recRes.data);

//       const feedbackRes = await api.get('/user/feedback-pending');
//       setFeedbackNeeded(feedbackRes.data);

//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const downloadICS = () => {
//     const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Synapse//Events//EN'];
//     calendarEvents.forEach(evt => {
//       const dt = new Date(evt.start);
//       const stamp = dt.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
//       lines.push('BEGIN:VEVENT');
//       lines.push(`DTSTART:${stamp}`);
//       lines.push(`SUMMARY:${(evt.title || '').replace(/[\r\n]/g, ' ')}`);
//       if (evt.extendedProps?.venue) lines.push(`LOCATION:${evt.extendedProps.venue.replace(/[\r\n]/g, ' ')}`);
//       lines.push(`UID:${stamp}-${Math.random().toString(36).slice(2)}@synapse`);
//       lines.push('END:VEVENT');
//     });
//     lines.push('END:VCALENDAR');
//     const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = 'synapse-calendar.ics';
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   if (loading) return <Loader />;

//   return (
//     <div className="container-fluid student-dashboard">
//       <div className="row g-4">

//         {/* LEFT: CALENDAR */}
//         <div className="col-lg-8">
//           <div className="widget-card h-100">
//             <div className="d-flex align-items-center justify-content-between mb-2">
//               <div className="dashboard-section-title" style={{ marginBottom: 0 }}>
//                 <CalendarIcon size={20} /> Your Calendar
//               </div>
//               <button className="btn-ics-download" onClick={downloadICS} title="Download .ics file">
//                 <Download size={15} /> Export .ics
//               </button>
//             </div>

//             <div className="calendar-shell">
//               <FullCalendar
//                 plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
//                 initialView="dayGridMonth"
//                 headerToolbar={{
//                   left: 'prev,next today',
//                   center: 'title',
//                   right: 'dayGridMonth,listWeek'
//                 }}
//                 events={calendarEvents}
//                 height="520px"
//               />
//             </div>
//           </div>
//         </div>

//         {/* RIGHT: SIDE WIDGETS */}
//         <div className="col-lg-4 d-flex flex-column gap-4">

//           {/* RECOMMENDATIONS */}
//           <div className="widget-card">
//             <h5 className="section-heading-sm mb-3">
//               <Star size={18} className="text-warning" /> Recommended For You
//             </h5>

//             {recommendations.length > 0 ? (
//               <div className="recommendation-list">
//                 {recommendations.slice(0, 3).map(event => (
//                   <div
//                     key={event.id}
//                     className="recommendation-item"
//                     onClick={() => navigate(`/events/${event.id}`)}
//                     style={{ cursor: 'pointer' }}
//                   >
//                     <h6 className="mb-1 fw-semibold">{event.name}</h6>
//                     <span className="text-secondary small">
//                       {formatDate(event.date)}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="empty-placeholder" style={{ border: 'none', padding: '32px 16px' }}>
//                 <Star size={28} style={{ opacity: 0.2 }} />
//                 <p>No recommendations yet. Add interests in your profile!</p>
//               </div>
//             )}
//           </div>

//           {/* FEEDBACK */}
//           <div className="widget-card">
//             <h5 className="section-heading-sm mb-3">
//               <MessageSquare size={18} className="text-info" /> Feedback Needed
//             </h5>

//             {feedbackNeeded.length > 0 ? (
//               <div className="feedback-list">
//                 {feedbackNeeded.map(event => (
//                   <div key={event.id} className="feedback-item">
//                     {event.name}
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="empty-placeholder" style={{ border: 'none', padding: '32px 16px' }}>
//                 <MessageSquare size={28} style={{ opacity: 0.2 }} />
//                 <p>You're all caught up!</p>
//               </div>
//             )}
//           </div>

//         </div>
//       </div>
//     </div>
//   );

// };

// export default StudentDashboard;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import api from '../api/axios';
import Loader from '../components/UI/Loader';
import { Star, MessageSquare, Calendar as CalendarIcon, Download, Link, Trash2, Copy, Check, X } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';
import FeedbackCard from '../components/Events/FeedbackCard';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [feedbackNeeded, setFeedbackNeeded] = useState([]);
  const [recsLoading, setRecsLoading] = useState(true);
  const [feedbackLoading, setFeedbackLoading] = useState(true);

  const [syncLink, setSyncLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);

  // Load calendar first (primary content), then side panels independently
  useEffect(() => {
    fetchCalendar();
    fetchRecommendations();
    fetchFeedback();
  }, []);

  const fetchCalendar = async () => {
    try {
      setLoading(true);
      const calRes = await api.get('/user/calendar');
      const formattedEvents = calRes.data.map(event => ({
        title: event.name,
        start: event.date?.endsWith('Z') ? event.date : `${event.date}Z`,
        backgroundColor: '#7c3aed',
        borderColor: '#7c3aed',
        extendedProps: { venue: event.venue }
      }));
      setCalendarEvents(formattedEvents);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      setRecsLoading(true);
      const recRes = await api.get('/events/recommendations');
      setRecommendations(recRes.data);
    } catch (err) { console.error(err); }
    finally { setRecsLoading(false); }
  };

  const fetchFeedback = async () => {
    try {
      setFeedbackLoading(true);
      const feedbackRes = await api.get('/user/feedback-pending');
      setFeedbackNeeded(feedbackRes.data);
    } catch (err) { console.error(err); }
    finally { setFeedbackLoading(false); }
  };

  const fetchDashboardData = () => {
    fetchCalendar();
    fetchRecommendations();
    fetchFeedback();
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
    a.href = url; a.download = 'synapse-calendar.ics'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateSyncLink = async () => {
    try {
      setSyncLoading(true);
      const res = await api.post('/calendar/generate-link');
      const fullUrl = `${window.location.protocol}//${window.location.host}/api/v1/calendar/${res.data.share_token}.ics`;
      setSyncLink(fullUrl);
      toast.success("Calendar link generated!");
    } catch (err) {
      toast.error("Failed to generate link");
    } finally {
      setSyncLoading(false);
    }
  };

  const handleRevokeSyncLink = async () => {
    try {
      setSyncLoading(true);
      await api.post('/calendar/revoke-link');
      setSyncLink('');
      toast.success("Calendar links revoked");
    } catch (err) {
      toast.error("Failed to revoke links");
    } finally {
      setSyncLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(syncLink);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <Loader />;

  return (
    <div className="container-fluid student-dashboard">
      <div className="row g-4">

        {/* LEFT: CALENDAR */}
        <div className="col-12 col-lg-8">
          <div className="widget-card h-100">

            {/* Header: title left, buttons right */}
            <div className="d-flex align-items-center justify-content-between mb-3 dashboard-calendar-header">
              <div className="dashboard-section-title mb-0">
                <CalendarIcon size={20} /> Your Calendar
              </div>

              <div className="d-flex gap-2 flex-wrap justify-content-end">
                <button
                  className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                  onClick={() => setShowSyncModal(true)}
                >
                  <Link size={14} />
                  <span className="d-none d-sm-inline">Sync Calendar</span>
                </button>

                <button className="btn-ics-download" onClick={downloadICS}>
                  <Download size={15} />
                  <span className="d-none d-sm-inline">Export .ics</span>
                </button>
              </div>
            </div>

            <div className="calendar-shell">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: 'prev,next',
                  center: 'title',
                  right: 'dayGridMonth,listWeek'
                }}
                buttonText={{
                  today: 'Today',
                  month: 'Month',
                  listWeek: 'List'
                }}
                events={calendarEvents}
                height="auto"
                aspectRatio={1.2}
                dayMaxEvents={2}
              />
            </div>

          </div>
        </div>

        {/* RIGHT: SIDE WIDGETS */}
        <div className="col-12 col-lg-4 d-flex flex-column gap-4">

          {/* RECOMMENDATIONS */}
          <div className="widget-card">
            <h5 className="section-heading-sm mb-3">
              <Star size={18} className="text-warning" /> Recommended For You
            </h5>
            {recsLoading ? (
              <div className="d-flex justify-content-center py-4"><Loader /></div>
            ) : recommendations.length > 0 ? (
              <div className="recommendation-list">
                {recommendations.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    className="recommendation-item"
                    onClick={() => navigate(`/events/${event.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <h6 className="mb-1 fw-semibold">{event.name}</h6>
                    <span className="text-secondary small">{formatDate(event.date)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-placeholder" style={{ border: 'none', padding: '32px 16px' }}>
                <Star size={28} style={{ opacity: 0.2 }} />
                <p>No recommendations yet. Add interests in your profile!</p>
              </div>
            )}
          </div>

          {/* FEEDBACK */}
          <div className="widget-card">
            <h5 className="section-heading-sm mb-3">
              <MessageSquare size={18} className="text-info" /> Feedback Needed
            </h5>
            {feedbackLoading ? (
              <div className="d-flex justify-content-center py-4"><Loader /></div>
            ) : feedbackNeeded.length > 0 ? (
              <div className="feedback-list">
                {feedbackNeeded.map(event => (
                  <FeedbackCard
                    key={event.id}
                    eventId={event.id}
                    eventName={event.name}
                    onFeedbackSubmitted={fetchDashboardData}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-placeholder" style={{ border: 'none', padding: '32px 16px' }}>
                <MessageSquare size={28} style={{ opacity: 0.2 }} />
                <p>You're all caught up!</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* SYNC CALENDAR MODAL */}
      {showSyncModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowSyncModal(false)}
          style={{ position:'fixed', top:0, left:0, right:0, bottom:0, backgroundColor:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1050 }}
        >
          <div
            className="modal-content glass-panel p-4"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth:'420px', width:'90%', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.1)' }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="m-0 d-flex align-items-center gap-2 text-white">
                <Link size={18} className="text-primary" /> Sync Calendar
              </h5>
              <button className="btn btn-link text-secondary p-0 border-0" onClick={() => setShowSyncModal(false)}>
                <X size={20} />
              </button>
            </div>

            <p className="small text-secondary mb-4">
              Auto-sync your Synapse events with Google Calendar, Outlook, or Apple Calendar.
            </p>

            {!syncLink ? (
              <button
                className="btn btn-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                onClick={handleGenerateSyncLink}
                disabled={syncLoading}
              >
                <Link size={16} />
                {syncLoading ? 'Generating Link...' : 'Generate Sync Link'}
              </button>
            ) : (
              <div className="sync-link-container">
                <div
                  className="d-flex align-items-center gap-2 mb-3 p-3 rounded"
                  style={{ backgroundColor:'rgba(0,0,0,0.2)', wordBreak:'break-all', border:'1px solid rgba(255,255,255,0.1)' }}
                >
                  <span className="small text-white" style={{ fontSize:'0.85rem' }}>{syncLink}</span>
                </div>
                <div className="d-flex gap-2 mb-3">
                  <button
                    className="btn btn-primary flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                    onClick={copyToClipboard}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied' : 'Copy Link'}
                  </button>
                  <button
                    className="btn btn-outline-danger d-flex align-items-center justify-content-center px-3"
                    onClick={handleRevokeSyncLink}
                    disabled={syncLoading}
                    title="Revoke access"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div
                  className="alert alert-info py-2 px-3 mt-3 mb-0 border-0"
                  style={{ fontSize:'0.8rem', backgroundColor:'rgba(13,110,253,0.1)', color:'#8bb4f3' }}
                >
                  <strong>How to use:</strong><br />
                  1. Open Google / Apple Calendar.<br />
                  2. Select "Add calendar from URL".<br />
                  3. Paste this link.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentDashboard;