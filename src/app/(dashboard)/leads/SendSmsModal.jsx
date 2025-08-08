import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { xFetch } from '@/utility/xFetch';
import { Corporate, User, Test } from '@/utility/TinyDB';

export default function SendSmsDrawer({ isOpen, onClose = () => {}, mobiles = [], ids = [], corporateId }) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [mobileList, setMobileList] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [sessionData, setSessionData] = useState({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const data = { corporate: Corporate, user: User, test: Test };
      setSessionData(data);
    }
  }, []);

  // Update mobile list when mobiles prop changes
  useEffect(() => {
    setMobileList(mobiles);
  }, [mobiles]);

  // Remove a mobile number
  const removeMobile = (index) => {
    setMobileList(mobileList.filter((_, i) => i !== index));
  };

  // Add a mobile number
  const addMobile = (e) => {
    e.preventDefault();
    const value = inputValue.trim();
    if (value && !mobileList.includes(value)) {
      setMobileList([...mobileList, value]);
    }
    setInputValue('');
  };

  // Handle input key press
  const handleInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addMobile(e);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || mobileList.length === 0) {
      toast.error('Please add mobile numbers and enter a message');
      return;
    }

    const api_token =
      sessionData?.token ||
      sessionData?.api_token ||
      (typeof window !== 'undefined' ? localStorage.getItem('access_token') : undefined);

    setIsSending(true);
    try {
      const response = await xFetch({
        method: 'POST',
        path: '/leadstorredirect/sendInviteNotification',
        payload: {
          api_token,
          ids,
          type: 'SMS',
          content: message.trim(),
        }
      });
      if (response && (response.status === 'OK' || response.sent > 0)) {
        toast.success('SMS sent successfully to selected leads');
        setMessage('');
        setMobileList([]);
        if (typeof onClose === 'function') onClose();
      } else {
        toast.error(response?.message || 'Failed to send SMS');
      }
    } catch (e) {
      toast.error(e?.message || 'Failed to send SMS');
    } finally {
      setIsSending(false);
    }
  };

  // Drawer close on overlay click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Drawer and overlay styles (matching advanceFilter.jsx)
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
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 0,
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
      <div style={overlayStyle} onClick={handleOverlayClick}></div>
      <div className="SendSmsModal" style={drawerStyle}>
        <div style={{ padding: 20, borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fafafa' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#333' }}>Send SMS</h2>
          <button style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#666', padding: 0, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }} onClick={onClose} disabled={isSending}>×</button>
        </div>
        {/* Styled mobile number box */}
        <div style={{ margin: '24px 20px 20px 20px' }}>
          <label style={{
            display: 'block',
            fontWeight: 500,
            color: '#333',
            marginBottom: 8,
            fontSize: 14
          }}>
            Mobile
          </label>
          <div className="mobile-multi-box" style={{
            minHeight: 36,
            border: '1px solid #ddd',
            borderRadius: 6,
            padding: '6px 10px',
            background: 'white',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            cursor: 'text',
            gap: 4
          }}>
            {mobileList.map((mobile, idx) => (
              <div key={idx} style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: '#e6e6e6',
                borderRadius: 16,
                padding: '4px 8px',
                margin: '2px 2px 2px 0',
                fontSize: 14
              }}>
                <span>{mobile}</span>
                <span
                  onClick={() => removeMobile(idx)}
                  style={{
                    marginLeft: 8,
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  ×
                </span>
              </div>
            ))}
            <input
              name="mobileInput"
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyPress={handleInputKeyPress}
              placeholder={mobileList.length === 0 ? "Add mobile numbers..." : ""}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: 12,
                minWidth: 60,
                flex: 1,
                background: 'transparent',
                borderRadius: 6,
                padding: '2px 4px',
                height: '18px',
              }}
              disabled={isSending}
              autoComplete="off"
            />
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 20 }}>
          <div style={{ flex: 1, marginBottom: 24 }}>
            <label style={{ display: 'block', fontWeight: 500, color: '#333', marginBottom: 8, fontSize: 14 }}>Message</label>
            <textarea
              style={{ width: '100%', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, padding: '10px 12px', minHeight: 120, color: '#333', background: 'white', resize: 'vertical', outline: 'none', fontFamily: 'system-ui, -apple-system, sans-serif' }}
              rows={6}
              placeholder="Write your SMS message here..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              disabled={isSending}
              required
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, borderTop: '1px solid #eee', paddingTop: 16 }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '10px 20px', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: 'pointer', background: '#f8f9fa', color: '#666', border: '1px solid #ddd' }}
              disabled={isSending}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSend}
              style={{ padding: '10px 20px', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: (isSending || !message || mobileList.length === 0) ? 'not-allowed' : 'pointer', background: '#007bff', color: 'white', opacity: (isSending || !message || mobileList.length === 0) ? 0.6 : 1 }}
              disabled={isSending || !message || mobileList.length === 0}
            >
              {isSending ? 'Sending...' : 'Send SMS'}
            </button>
          </div>
        </div>
      </div>
      <style jsx global>{`
        .SendSmsModal input:focus,
        .SendSmsModal textarea:focus,
        .SendSmsModal select:focus {
          border: 1px solid #bbb !important;
          box-shadow: none !important;
          outline: none !important;
        }
      `}</style>
    </>
  );
}

// Demo component to test the drawer
function App() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [initialMobiles] = useState(['+1234567890', '+0987654321']);

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <h1>SMS Drawer Demo</h1>
      <button 
        onClick={() => setIsDrawerOpen(true)}
        style={{
          padding: '10px 20px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 500
        }}
      >
        Open SMS Drawer
      </button>
      
      <SendSmsDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        mobiles={initialMobiles}
      />
    </div>
  );
}