'use client'
import { useState, useEffect } from 'react';
import { xFetch } from '@/utility/xFetch';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Corporate, User } from '@/utility/TinyDB';
import CustomSelect from '@/components/CustomSelect';

export default function SendEmailModal({ isOpen, onClose, ids, emails = [] }) {
  const [templates, setTemplates] = useState([]);
  const [templateId, setTemplateId] = useState('');
  const [cc, setCc] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('Dear $firstName');
  const [attachment, setAttachment] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  // Reset all fields on open/close
  useEffect(() => {
    if (isOpen && Corporate?._id) {
      setIsLoadingTemplates(true);
      xFetch({
        method: 'GET',
        path: `/services/profile/getEmailTemplate?corporateId=${Corporate._id}`
      })
        .then((data) => {
          setTemplates([{ templateId: '', templateName: 'Select a template' }, ...(data || [])]);
        })
        .catch(() => {
          setTemplates([{ templateId: '', templateName: 'Select a template' }]);
        })
        .finally(() => setIsLoadingTemplates(false));
    }
    if (isOpen) {
      setCc('');
      setSubject('');
      setMessage('Dear $firstName');
      setAttachment(null);
      setTemplateId('');
    }
  }, [isOpen]);

  // Template selection logic - Fixed to handle both event objects and direct values
  const handleTemplateChange = async (valueOrEvent) => {
    // Handle both event objects (e.target.value) and direct values
    const tid = typeof valueOrEvent === 'object' && valueOrEvent?.target 
      ? valueOrEvent.target.value 
      : valueOrEvent;
    
    setTemplateId(tid);
    if (tid) {
      try {
        const data = await xFetch({
          method: 'GET',
          path: `/services/profile/selectTemplates?id=${tid}`
        });
        let templateData = Array.isArray(data) ? data[0] : data;
        if (templateData) {
          setSubject(templateData.subject || '');
          setMessage(templateData.htmlContent || 'Dear $firstName');
        }
      } catch {
        setSubject('');
        setMessage('Dear $firstName');
      }
    } else {
      setSubject('');
      setMessage('Dear $firstName');
    }
  };

  // Helper for focus and hover border color
  const [ccFocus, setCcFocus] = useState(false);
  const [ccHover, setCcHover] = useState(false);
  const [subjectFocus, setSubjectFocus] = useState(false);
  const [subjectHover, setSubjectHover] = useState(false);
  const inputBaseStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: 6,
    fontSize: 14,
    background: 'white',
    color: '#333',
    outline: 'none',
    transition: 'border-color 0.2s',
  };
  const inputFocusStyle = {
    border: '1.5px solid #222',
  };
  const inputHoverStyle = {
    border: '1.5px solid #bbb',
  };

  if (!isOpen) return null;

  // Compute if any candidates are selected
  const hasCandidates = (Array.isArray(ids) && ids.length > 0) || (Array.isArray(emails) && emails.length > 0);
  const allFieldsFilled = subject.trim() && message.trim() && hasCandidates;

  // Send email logic (matches legacy API)
  const handleSend = async () => {
    if (!allFieldsFilled) return;
    setIsSending(true);
    try {
      // Always use FormData for this endpoint, but use xFetch with isFormData like manualCandidate
      const formData = new FormData();
      formData.append('ids', Array.isArray(ids) ? ids.join(',') : ids);
      formData.append('type', 'Email');
      formData.append('ccEmail', cc);
      formData.append('content', message);
      formData.append('subject', subject);
      formData.append('corporateId', Corporate?._id || '');
      formData.append('userId', User?._id || '');
      if (attachment) formData.append('attachment', attachment);
      let response;
      try {
        response = await xFetch({
          method: 'POST',
          path: '/leadstorredirect/sendInviteNotification',
          payload: formData,
          isFormData: true
        });
      } catch (error) {
        // Defensive handling for invalid JSON or HTML error pages
        if (error instanceof SyntaxError || (typeof error.message === 'string' && error.message.includes('Unexpected token'))) {
          toast.error('Server error: Invalid response. Please contact support.');
          return;
        } else if (error.response && error.response.data) {
          toast.error(error.response.data.message || 'Failed to send Email');
          return;
        } else {
          toast.error(error.message || 'Failed to send Email');
          return;
        }
      }
      if (response && response.status === 'Failed') {
        toast.error(response.message || 'Failed to send Email');
      } else if (response && (response.status === 'OK' || response.sent > 0)) {
        toast.success('Email sent successfully to selected leads');
        setCc('');
        setSubject('');
        setMessage('Dear $firstName');
        setAttachment(null);
        setTemplateId('');
        onClose();
      } else {
        toast.error('Failed to send Email');
      }
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(error.response.data.message || 'Failed to send Email');
      } else {
        toast.error(error.message || 'Failed to send Email');
      }
    } finally {
      setIsSending(false);
    }
  };

  
  const drawerStyle = {
    position: 'fixed',
    top: 0,
    right: isOpen ? 0 : '-400px',
    width: 400,
    height: '100vh',
    background: 'white',
    zIndex: 1001,
    transition: 'right 0.3s ease',
    boxShadow: '-2px 0 20px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
  };
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
    opacity: isOpen ? 1 : 0,
    visibility: isOpen ? 'visible' : 'hidden',
    transition: 'all 0.3s ease',
  };

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <div style={overlayStyle} onClick={onClose}></div>
      <div style={drawerStyle}>
        <div style={{ padding: 20, borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fafafa' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#333', margin: 0 }}>Send Email to selected Candidates</h2>
          <button style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#666', padding: 0, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }} onClick={onClose} disabled={isSending}>×</button>
        </div>
        {/* Selected emails summary and warning */}
        <div style={{ padding: '16px 20px 0 20px' }}>
          {hasCandidates ? (
            <div style={{ marginBottom: 12, fontSize: 14, color: '#444' }}>
              <strong>Sending to:</strong>
              <div style={{ marginTop: 4, maxHeight: 60, overflowY: 'auto', wordBreak: 'break-all' }}>
                {emails && emails.length > 0 ? (
                  emails.map((email, i) => <span key={email} style={{ display: 'inline-block', marginRight: 8 }}>{email}{i < emails.length-1 ? ',' : ''}</span>)
                ) : (
                  <span style={{ color: '#888' }}>[IDs selected: {Array.isArray(ids) ? ids.length : 0}]</span>
                )}
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: 12, fontSize: 14, color: '#b71c1c', background: '#fff3f3', padding: 8, borderRadius: 4, border: '1px solid #f7caca' }}>
              <strong>No candidates selected.</strong> Please select at least one candidate to send an email.
            </div>
          )}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, marginRight: 3 }}>
          <div style={{ marginBottom: 24 }}>
              <CustomSelect
                options={templates.map(opt => opt.templateName)}
                value={templates.find(opt => opt.templateId === templateId)?.templateName || ''}
                onChange={name => {
                  const selected = templates.find(opt => opt.templateName === name);
                  setTemplateId(selected?.templateId || '');
                  if (selected?.templateId) handleTemplateChange(selected.templateId);
                }}
                placeholder="Select a template"
                disabled={isLoadingTemplates || isSending}
                className="email-modal-select"
              />
            </div>
          <div style={{ marginBottom: 24 }}>
            <input
              style={ccFocus ? { ...inputBaseStyle, ...inputFocusStyle } : ccHover ? { ...inputBaseStyle, ...inputHoverStyle } : inputBaseStyle}
              type="text"
              placeholder="Enter CC email-ids (semicolon/comma separated)"
              value={cc}
              onChange={e => setCc(e.target.value)}
              disabled={isSending}
              onFocus={() => setCcFocus(true)}
              onBlur={() => setCcFocus(false)}
              onMouseEnter={() => setCcHover(true)}
              onMouseLeave={() => setCcHover(false)}
              />
            </div>
          <div style={{ marginBottom: 24 }}>
              <input
              style={subjectFocus ? { ...inputBaseStyle, ...inputFocusStyle } : subjectHover ? { ...inputBaseStyle, ...inputHoverStyle } : inputBaseStyle}
                type="text"
                placeholder="Enter Subject"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                disabled={isSending}
              onFocus={() => setSubjectFocus(true)}
              onBlur={() => setSubjectFocus(false)}
              onMouseEnter={() => setSubjectHover(true)}
              onMouseLeave={() => setSubjectHover(false)}
              />
            </div>
          <div style={{ marginBottom: 24 }}>
              <textarea
              style={{ width: '100%', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, padding: '10px 12px', minHeight: 180, color: '#333', background: 'white', resize: 'vertical', outline: 'none', fontFamily: 'system-ui, -apple-system, sans-serif' }}
                rows={10}
              placeholder="Message"
              value={message}
              onChange={e => setMessage(e.target.value)}
                disabled={isSending}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontWeight: 600, color: '#222', fontSize: 15, marginBottom: 8, display: 'block' }}>Attachment</label>
                  <input
                    type="file"
              onChange={e => setAttachment(e.target.files[0])}
                    disabled={isSending}
                  />
          </div>
        </div>
        <div style={{ padding: 20, borderTop: '1px solid #eee', display: 'flex', gap: 12, background: '#fafafa' }}>
          <button
            type="button"
            onClick={onClose}
            style={{ padding: '10px 20px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: 'pointer', background: '#f8f9fa', color: '#666', flex: 1 }}
            disabled={isSending}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSend}
            style={{ padding: '10px 20px', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: isSending || !allFieldsFilled ? 'not-allowed' : 'pointer', background: '#007bff', color: 'white', flex: 1, opacity: isSending || !allFieldsFilled ? 0.6 : 1 }}
            disabled={isSending || !allFieldsFilled}
            title={!hasCandidates ? 'No candidates selected' : (!allFieldsFilled ? 'Fill all fields' : '')}
          >
            {isSending ? 'Sending...' : 'Email'}
          </button>
        </div>
      </div>
      
    </>
  );
}