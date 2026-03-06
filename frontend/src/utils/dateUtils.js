/**
 * Central date/time utilities for Synapse frontend.
 * All display formatting uses IST (Asia/Kolkata) explicitly,
 * so the output is consistent regardless of browser timezone.
 */

const IST_OPTIONS = { timeZone: 'Asia/Kolkata' };

/** Format date as "06 Mar 2026" */
export const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const str = dateStr.endsWith('Z') ? dateStr : `${dateStr}Z`;
    return new Date(str).toLocaleDateString('en-IN', {
        ...IST_OPTIONS,
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

/** Format date+time as "06 Mar 2026, 5:30 PM" */
export const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    const str = dateStr.endsWith('Z') ? dateStr : `${dateStr}Z`;
    return new Date(str).toLocaleString('en-IN', {
        ...IST_OPTIONS,
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
};

/** Check if a date string is in the past (IST-aware comparison) */
export const isPast = (dateStr) => {
    if (!dateStr) return false;
    const str = dateStr.endsWith('Z') ? dateStr : `${dateStr}Z`;
    return new Date(str) < new Date();
};
