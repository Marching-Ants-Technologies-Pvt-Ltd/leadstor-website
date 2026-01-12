import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import CustomSelect from '@/components/CustomSelect';
import { UseFilterOptionsStore } from '@/utility/UseFilterOptionsStore';
import { User } from '@/utility/TinyDB';
import { xFetch } from '@/utility/xFetch';

export default function BulkUpdateDrawer({
  open,
  onClose,
  selectedIds
}) {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedOwner, setSelectedOwner] = useState('');
  const [selectedProbability, setSelectedProbability] = useState('');
  const [loading, setLoading] = useState(false);
  const {
    status,
    owner,
    fetchFilterOptions,
  } = UseFilterOptionsStore();

  useEffect(() => {
      fetchFilterOptions();
  }, [fetchFilterOptions]);

  // Reset fields when drawer closes
  useEffect(() => {
    if (!open) {
      setSelectedOwner('');
      setSelectedStatus('');
      setSelectedProbability('');
    }
  }, [open]);

  if (!open) return null;

  const handleUpdate = async () => {
    const hasSelection =
      selectedOwner || selectedStatus || selectedProbability;

    if (!hasSelection) {
      toast.warn('Please select at least one field to update', {
        position: 'top-center',
      });
      return;
    }

    if (selectedIds.length === 0) {
      toast.warn('No leads selected for update', {
        position: 'top-center',
      });
      return;
    }

    setLoading(true);

    let payload = {
      invitationId: selectedIds,
      status: selectedStatus,
      owner: selectedOwner,
      leadstatus: selectedProbability,
      updatedBy: User?._id,
    };
    
    xFetch({
      path: `/services/invite/updateInvitestatus`,
      method:  'POST',
      payload,
    })
    .then((data) => {
      toast.success('Successfully updated');
      setLoading(false);
      window.tableRefresh?.();
      onClose();
    })
    .catch((error) => {
      console.error('Bulk update error:', error);
      toast.error('Failed to update leads. Please try again.', {
        position: 'top-center',
      });
    })
    .finally(() => {
    });
  };

  const isUpdateDisabled = loading || (!selectedOwner && !selectedStatus && !selectedProbability);

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000] transition-opacity duration-300"
        style={{ opacity: open ? 1 : 0, visibility: open ? 'visible' : 'hidden' }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 w-[420px] h-full bg-white z-[1001] shadow-2xl transition-transform duration-500 ease-in-out flex flex-col
          ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-200 flex items-center justify-between lead-header">
          <h2 className="text-lg font-medium text-gray-800">Bulk Update Leads</h2>
          <button
            className="text-gray-600 hover:text-gray-800 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {/* Status */}
          <div className="mb-6">
            <label className="block font-medium text-gray-700 mb-2 text-sm">Status</label>
            <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-800 
                          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none 
                          transition shadow-sm hover:border-blue-400"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">-- Select Status --</option>
                {status.map((opt, index) => (
                    <option 
                      key={index} 
                      value={opt.key || opt.value}
                      disabled={opt.disabled || false}
                    >
                      {opt.value || opt.label}
                    </option>
                  ))}
              </select>
          </div>

          {/* Owner */}
            <div className="mb-6">
              <label className="block font-medium text-gray-700 mb-2 text-sm">Owner</label>
         
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-800 
                          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none 
                          transition shadow-sm hover:border-blue-400"
                value={selectedOwner}
                onChange={(e) => setSelectedOwner(e.target.value)}
              >
                <option value="">-- Select Owner --</option>
                {owner.map((opt, index) => (
                    <option 
                      key={index} 
                      value={opt.key || opt.value}
                      disabled={opt.disabled || false}
                    >
                      {opt.label}
                    </option>
                  ))}
              </select>
          </div>

          {/* Probability */}
          <div className="mb-6">
              <label className="block font-medium text-gray-700 mb-2 text-sm">Probability</label>
              <select
                value={selectedProbability}
                onChange={(e) => setSelectedProbability(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
              >
                <option value="">Select Probability</option>
                <option value="20">Low</option>
                <option value="55">Medium</option>
                <option value="85">High</option>
              </select>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-200 bg-white flex gap-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 px-6 border border-gray-300 rounded-xl text-gray-700 font-medium 
                     hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>

          <button
            onClick={handleUpdate}
            disabled={isUpdateDisabled}
            className={`flex-1 py-3 px-6 rounded-xl text-white font-medium transition btn-primary-crm
              ${isUpdateDisabled 
                ? 'cursor-not-allowed' 
                : 'hover:bg-emerald-700 active:bg-emerald-800'
              }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Updating...
              </span>
            ) : (
              'Update Leads'
            )}
          </button>
        </div>
      </div>
    </>
  );
}