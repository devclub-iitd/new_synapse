import React, { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { capitalize, orgDisplayName } from '../../utils/capitalize';

const CalendarPopup = ({ event, isOpen, onClose }) => {
  const popupRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) onClose();
    };
    setTimeout(() => document.addEventListener('mousedown', handleClickOutside), 10);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen || !event) return null;

  const eventName = capitalize(event.name || '');
  const orgName = orgDisplayName(event.organization?.name) || '';
  const venue = event.venue || '';
  const description = event.description || '';

  // Parse the event date into a proper Date object
  const parseDate = (str) => {
    if (!str) return null;
    const s = str.endsWith('Z') ? str : `${str}Z`;
    return new Date(s);
  };

  const startDate = parseDate(event.date);
  // Default duration: 2 hours
  const endDate = startDate ? new Date(startDate.getTime() + 2 * 60 * 60 * 1000) : null;

  if (!startDate) return null;

  // Format for Google Calendar: 20260413T153000Z
  const toGoogleDate = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  // Format for .ics file (Apple/Outlook download): 20260413T153000Z
  const toICSDate = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  const fullDescription = `${description}${orgName ? `\n\nOrganized by: ${orgName}` : ''}`;

  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventName)}&dates=${toGoogleDate(startDate)}/${toGoogleDate(endDate)}&details=${encodeURIComponent(fullDescription)}&location=${encodeURIComponent(venue)}`;

  const outlookUrl = `https://outlook.live.com/calendar/0/action/compose?subject=${encodeURIComponent(eventName)}&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}&body=${encodeURIComponent(fullDescription)}&location=${encodeURIComponent(venue)}`;

  const yahooUrl = `https://calendar.yahoo.com/?v=60&title=${encodeURIComponent(eventName)}&st=${toGoogleDate(startDate)}&et=${toGoogleDate(endDate)}&desc=${encodeURIComponent(fullDescription)}&in_loc=${encodeURIComponent(venue)}`;

  // Generate .ics file content for Apple Calendar / download
  const generateICS = () => {
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Synapse//Event//EN',
      'BEGIN:VEVENT',
      `DTSTART:${toICSDate(startDate)}`,
      `DTEND:${toICSDate(endDate)}`,
      `SUMMARY:${eventName}`,
      `DESCRIPTION:${fullDescription.replace(/\n/g, '\\n')}`,
      `LOCATION:${venue}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${eventName.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onClose();
  };

  const platforms = [
    {
      name: 'Google Calendar',
      color: '#4285F4',
      url: googleUrl,
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      ),
    },
    {
      name: 'Apple Calendar',
      color: '#FF3B30',
      action: generateICS,
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
        </svg>
      ),
    },
    {
      name: 'Outlook',
      color: '#0078D4',
      url: outlookUrl,
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <path d="M24 7.387v10.478c0 .23-.08.424-.238.576-.158.154-.352.23-.582.23h-8.4v-6.9l1.6 1.218c.08.06.178.09.293.09s.213-.03.293-.09L24 7.387zm-.24-.156L17.566 12.42 10.78 7.11A.472.472 0 0110.543 7H23.18c.23 0 .424.078.58.231zM8.88 7.89c0-.174.02-.36.06-.558L1.2 13.2v-5.16c0-.78.275-1.446.826-1.998S3.26 5.22 4.04 5.22h5.04c-.134.31-.2.724-.2 1.242v11.37c0 .518.066.93.2 1.234H4.04c-.78 0-1.447-.275-1.998-.826S1.22 16.98 1.22 16.2v-1.56l7.66-5.73V7.89zm1.2 0v9.942c0 .504.156.918.468 1.242s.692.486 1.14.486.826-.162 1.134-.486.462-.738.462-1.242V7.89c0-.504-.154-.918-.462-1.242S12.13 6.162 11.688 6.162s-.828.162-1.14.486-.468.738-.468 1.242z"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="share-popup-overlay">
      <div className="share-popup-card" ref={popupRef}>
        <div className="share-popup-header">
          <h4>Add to Calendar</h4>
          <button className="share-popup-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="cal-popup-event-info">
          <div className="cal-popup-event-name">{eventName}</div>
          <div className="cal-popup-event-meta">
            {new Intl.DateTimeFormat('en-IN', {
              timeZone: 'Asia/Kolkata',
              day: '2-digit', month: 'short', year: 'numeric',
              hour: 'numeric', minute: '2-digit', hour12: true,
            }).format(startDate)}
            {venue ? ` · ${venue}` : ''}
          </div>
        </div>

        <div className="cal-popup-grid">
          {platforms.map((p) => (
            <button
              key={p.name}
              className="cal-popup-btn"
              title={p.name}
              onClick={() => {
                if (p.action) {
                  p.action();
                } else {
                  window.open(p.url, '_blank', 'noopener,noreferrer');
                  onClose();
                }
              }}
              style={{ '--platform-color': p.color }}
            >
              <div className="cal-popup-icon">
                {p.icon}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarPopup;
