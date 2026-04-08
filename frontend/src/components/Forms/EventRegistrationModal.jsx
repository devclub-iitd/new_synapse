import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Loader from '../UI/Loader';
import SearchableDropdown from '../UI/SearchableDropdown';

const EventRegistrationModal = ({ isOpen, onClose, eventId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [schema, setSchema] = useState([]); // The questions
  const [answers, setAnswers] = useState({}); // The user's input

  useEffect(() => {
    if (isOpen && eventId) {
      fetchEventSchema();
    }
  }, [isOpen, eventId]);

  const fetchEventSchema = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/events/${eventId}`);
      // The backend returns custom_form_schema in the event detail
      console.log("Fetched Event Schema:", res.data.custom_form_schema);
      setSchema(res.data.custom_form_schema || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load registration form");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post(`/events/${eventId}/register`, answers);
      toast.success("Successfully Registered!");
      onSuccess(); // Refresh parent list
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (label, value) => {
    setAnswers(prev => ({ ...prev, [label]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="glass-card p-4 rounded-4" style={{ background: 'var(--bg-elevated)', width: '500px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold m-0" style={{color: 'var(--text-primary)'}}>Confirm Registration</h4>
          <button className="btn p-0" style={{color: 'var(--text-primary)'}} onClick={onClose}><X size={24} /></button>
        </div>

        {loading ? <Loader /> : (
          <form onSubmit={handleSubmit}>
            {/* Dynamic Fields */}
            {schema.map((field, idx) => (
              <div key={idx} className="mb-3">
                <label className="form-label text-secondary small text-uppercase">{field.label}</label>
                
                {field.type === 'text' && (
                 <input
  type="text"
  className="form-control bg-dark text-white border-secondary"
  required
  value={answers[field.label] || ""}
  onChange={e => handleInputChange(field.label, e.target.value)}
/>

                )}

                {field.type === 'radio' && field.options && (
                  <SearchableDropdown
                    options={field.options}
                    value={answers[field.label] || ""}
                    onChange={val => handleInputChange(field.label, val)}
                    placeholder="Select option..."
                    searchable={field.options.length > 5}
                  />
                )}
              </div>
            ))}

            {schema.length === 0 && (
              <p className="mb-4" style={{color: 'var(--text-primary)'}}>Are you sure you want to register for this event?</p>
            )}

            <button type="submit" className="btn btn-purple w-100 mt-3 d-flex align-items-center justify-content-center gap-2" disabled={loading}>
              {loading ? 'Registering...' : <><Check size={18} /> Confirm</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default EventRegistrationModal;  