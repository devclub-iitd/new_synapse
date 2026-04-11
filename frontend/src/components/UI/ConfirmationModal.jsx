import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-card p-4 rounded-4" style={{ background: 'var(--bg-elevated)', width: '90vw', maxWidth: '400px', border: '1px solid rgba(239, 68, 68, 0.3)' }} onClick={e => e.stopPropagation()}>
        
        <div className="d-flex align-items-center gap-3 mb-3">
          <div className="bg-danger bg-opacity-25 p-2 rounded-circle text-danger">
            <AlertTriangle size={24} />
          </div>
          <h5 className="fw-bold m-0" style={{color: 'var(--text-primary)'}}>{title || "Confirm Action"}</h5>
          <button className="btn ms-auto p-0" style={{color: 'var(--text-secondary)'}} onClick={onClose}><X size={20} /></button>
        </div>

        <p style={{color: 'var(--text-secondary)'}} className="mb-4">{message || "Are you sure you want to proceed? This action cannot be undone."}</p>

        <div className="d-flex gap-2 justify-content-end">
          <button className="btn btn-outline-secondary" onClick={onClose} disabled={isLoading}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;