import React, { useState, useEffect } from 'react';
import { X, Check, FileText, Sparkles } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Loader from '../UI/Loader';
import SearchableDropdown from '../UI/SearchableDropdown';

const EventRegistrationModal = ({ isOpen, onClose, eventId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [schema, setSchema] = useState([]);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    if (isOpen && eventId) {
      fetchEventSchema();
    }
  }, [isOpen, eventId]);

  const fetchEventSchema = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/events/${eventId}`);
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
      onSuccess();
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
    <div className="modal-overlay-v3">
      <div className="modal-card-v3">
        {/* Header */}
        <div className="modal-header-v3">
          <div className="modal-header-left">
            <div className="modal-icon-v3">
              <FileText size={20} />
            </div>
            <div>
              <h3>Registration Form</h3>
              <p>Complete the fields below to register</p>
            </div>
          </div>
          <button className="modal-close-v3" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Divider */}
        <div className="modal-divider-v3" />

        {/* Body */}
        <div className="modal-body-v3">
          {loading ? (
            <div className="modal-loader-v3"><Loader /></div>
          ) : (
            <form onSubmit={handleSubmit}>
              {schema.map((field, idx) => (
                <div key={idx} className="form-field-v3">
                  <label className="form-label-v3">
                    <span className="field-number">{idx + 1}</span>
                    {field.label}
                  </label>

                  {field.type === 'text' && (
                    <div className="input-wrapper-v3">
                      <input
                        type="text"
                        className="form-input-v3"
                        required
                        placeholder={`Enter ${field.label.toLowerCase()}...`}
                        value={answers[field.label] || ""}
                        onChange={e => handleInputChange(field.label, e.target.value)}
                      />
                      <div className="input-focus-ring" />
                    </div>
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
                <div className="confirm-message-v3">
                  <Sparkles size={24} />
                  <p>Ready to join? Hit confirm to register for this event.</p>
                </div>
              )}

              <button
                type="submit"
                className="submit-btn-v3"
                disabled={loading}
              >
                {loading ? (
                  'Registering...'
                ) : (
                  <>
                    <Check size={18} />
                    <span>Confirm Registration</span>
                  </>
                )}
                <div className="btn-shimmer" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventRegistrationModal;  