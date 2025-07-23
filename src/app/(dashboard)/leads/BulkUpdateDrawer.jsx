import React, { useState, useEffect } from 'react';
import CustomSelect from '@/components/CustomSelect';

export default function BulkUpdateDrawer({ 
  open, 
  onClose, 
  onUpdate, 
  sourceOptions = [], 
  ownerOptions = [], 
  courseOptions = [], 
  statusOptions = [], 
  selectedIds = [] 
}) {
  // State management
  const [selectedSource, setSelectedSource] = useState('');
  const [selectedOwner, setSelectedOwner] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(false);

  
  useEffect(() => {
    if (!open) {
      setSelectedSource('');
      setSelectedOwner('');
      setSelectedCourse('');
      setSelectedStatus('');
    }
  }, [open]);

  
  if (!open) return null;

  
  const handleUpdate = async () => {
    const hasSelection = selectedSource || selectedOwner || selectedCourse || selectedStatus;
    if (!hasSelection) return;

    setLoading(true);
    try {
      await onUpdate({
        source: selectedSource,
        owner: selectedOwner,
        course: selectedCourse,
        status: selectedStatus
      }, selectedIds);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  
  const isUpdateDisabled = loading || (!selectedSource && !selectedOwner && !selectedCourse && !selectedStatus);

  
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.4)',
    zIndex: 1000,
    opacity: open ? 1 : 0,
    visibility: open ? 'visible' : 'hidden',
    transition: 'all 0.3s ease',
  };

  const drawerStyle = {
    position: 'fixed',
    top: 0,
    right: open ? 0 : '-420px',
    width: '420px',
    height: '100vh',
    background: '#ffffff',
    zIndex: 1001,
    transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.12)',
    display: 'flex',
    flexDirection: 'column',
    borderLeft: '1px solid #e5e7eb'
  };

  const headerStyle = {
    padding: '24px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#ffffff',
    minHeight: '72px'
  };

  const titleStyle = {
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
    lineHeight: '28px'
  };

  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '8px',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    transition: 'all 0.2s ease',
    ':hover': {
      background: '#f3f4f6',
      color: '#374151'
    }
  };

  const contentStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '32px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '28px'
  };

  const fieldGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  };

  const labelStyle = {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    lineHeight: '20px'
  };

  const footerStyle = {
    padding: '24px',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    gap: '12px',
    background: '#fafbfc'
  };

  const cancelButtonStyle = {
    padding: '12px 20px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: loading ? 'not-allowed' : 'pointer',
    background: '#ffffff',
    color: '#374151',
    flex: 1,
    transition: 'all 0.2s ease',
    opacity: loading ? 0.6 : 1,
    ':hover': !loading ? {
      background: '#f9fafb',
      borderColor: '#9ca3af'
    } : {}
  };

  const updateButtonStyle = {
    padding: '12px 20px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: isUpdateDisabled ? 'not-allowed' : 'pointer',
    background: isUpdateDisabled ? '#d1d5db' : '#10b981',
    color: '#ffffff',
    flex: 1,
    transition: 'all 0.2s ease',
    ':hover': !isUpdateDisabled ? {
      background: '#059669'
    } : {}
  };

  return (
    <>
      {/* Overlay */}
      <div style={overlayStyle} onClick={onClose} />
      
      {/* Drawer */}
      <div style={drawerStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h2 style={titleStyle}>Bulk Update Leads</h2>
          <button 
            style={closeButtonStyle} 
            onClick={onClose}
            onMouseEnter={(e) => {
              e.target.style.background = '#f3f4f6';
              e.target.style.color = '#374151';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'none';
              e.target.style.color = '#6b7280';
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={contentStyle}>
          {/* Source Field */}
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Source</label>
            <CustomSelect
              options={sourceOptions}
              value={selectedSource}
              onChange={setSelectedSource}
              placeholder="Select Source"
            />
          </div>

          {/* Owner Field */}
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Owner</label>
            <CustomSelect
              options={ownerOptions}
              value={selectedOwner}
              onChange={setSelectedOwner}
              placeholder="Select Owner"
            />
          </div>

          {/* Course Field */}
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Course</label>
            <CustomSelect
              options={courseOptions}
              value={selectedCourse}
              onChange={setSelectedCourse}
              placeholder="Select Course"
            />
          </div>

          {/* Status Field */}
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Status</label>
            <CustomSelect
              options={statusOptions}
              value={selectedStatus}
              onChange={setSelectedStatus}
              placeholder="Select Status"
            />
          </div>
        </div>

        {/* Footer */}
        <div style={footerStyle}>
          <button
            style={cancelButtonStyle}
            onClick={onClose}
            disabled={loading}
            type="button"
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.background = '#f9fafb';
                e.target.style.borderColor = '#9ca3af';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.background = '#ffffff';
                e.target.style.borderColor = '#d1d5db';
              }
            }}
          >
            Cancel
          </button>
          <button
            style={updateButtonStyle}
            onClick={handleUpdate}
            disabled={isUpdateDisabled}
            type="button"
            onMouseEnter={(e) => {
              if (!isUpdateDisabled) {
                e.target.style.background = '#059669';
              }
            }}
            onMouseLeave={(e) => {
              if (!isUpdateDisabled) {
                e.target.style.background = '#10b981';
              }
            }}
          >
            {loading ? 'Updating...' : 'Update'}
          </button>
        </div>
      </div>
    </>
  );
}