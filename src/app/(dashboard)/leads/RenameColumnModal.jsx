'use client';

import { useState, useEffect } from 'react';
import { xFetch } from '@/utility/xFetch';

export default function RenameColumnModal({ 
    isOpen, 
    onClose, 
    onRename, 
    columns = [] 
}) {
    const [renameField, setRenameField] = useState('');
    const [renameValue, setRenameValue] = useState('');
    const [renameColumns, setRenameColumns] = useState([]);
    const [isUpdating, setIsUpdating] = useState(false);

    // Fetch columns for rename modal when opened
    useEffect(() => {
        if (isOpen) {
            (async () => {
                try {
                    const data = await xFetch({ path: '/services/profile/columns' });
                    let columnsWithCustomNames = data;
                    
                    try {
                        const sessionData = JSON.parse(localStorage.getItem('CurrentSessionData') || '{}');
                        const corporateId = sessionData?.corporate?._id;
                        if (corporateId) {
                            const key = `leadTableColumnNames_${corporateId}`;
                            const customNames = JSON.parse(localStorage.getItem(key) || '{}');
                            columnsWithCustomNames = data.map(col =>
                                customNames[col.dataField]
                                    ? { ...col, fieldName: customNames[col.dataField] }
                                    : col
                            );
                        }
                    } catch {}
                    
                    setRenameColumns(columnsWithCustomNames);
                } catch {
                    setRenameColumns([]);
                }
            })();
        }
    }, [isOpen]);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setRenameField('');
            setRenameValue('');
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        if (!renameField || !renameValue) return;
        
        setIsUpdating(true);
        
        try {
            // 1. Update localStorage first
            const sessionData = JSON.parse(localStorage.getItem('CurrentSessionData') || '{}');
            const corporateId = sessionData?.corporate?._id;
            if (corporateId) {
                const key = `leadTableColumnNames_${corporateId}`;
                let customNames = {};
                try {
                    customNames = JSON.parse(localStorage.getItem(key) || '{}');
                } catch {}
                customNames[renameField] = renameValue;
                localStorage.setItem(key, JSON.stringify(customNames));
            }
            
            // 2. Update local modal state immediately
            setRenameColumns(prev => 
                prev.map(col => 
                    col.dataField === renameField 
                        ? { ...col, fieldName: renameValue }
                        : col
                )
            );
            
            // 3. Call parent callback IMMEDIATELY for optimistic update
            if (onRename) {
                onRename(renameField, renameValue);
            }
            
            // 4. Close modal and reset form
            onClose();
            
            // 5. Make API call in background (don't block UI)
            xFetch({
                method: 'POST',
                path: '/services/profile/updateLeadTableRename',
                payload: { dataField: renameField, newName: renameValue, corporateId }
            }).catch((error) => {
                console.warn('Background API call failed for rename:', error);
                // Don't show error toast as user already sees success
                // You could implement a retry mechanism here if needed
            });
            
        } catch (error) {
            console.error('Rename error:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl shadow-2xl relative w-[420px] flex flex-col">
                {/* Header */}
                <div className="flex-shrink-0 relative h-14 flex items-center justify-center border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800">Rename Column</h2>
                    <button
                        className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition focus:outline-none"
                        onClick={onClose}
                        aria-label="Close"
                        type="button"
                        disabled={isUpdating}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M10 8.586l4.95-4.95a1 1 0 111.414 1.414L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10l-4.95-4.95A1 1 0 115.05 3.636L10 8.586z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
                
                {/* Content */}
                <div className="flex-1 p-6 flex flex-col justify-center">
                    {(!renameColumns || renameColumns.length === 0) ? (
                        <div className="flex items-center justify-center text-gray-400 py-6">
                            <div className="spinner-simple w-5 h-5 mr-2 border-[2px]"></div>
                            Loading columns...
                        </div>
                    ) : (
                        <>
                            <select 
                                className="border rounded px-3 py-2 w-full mb-3 text-sm" 
                                value={renameField} 
                                onChange={e => setRenameField(e.target.value)}
                                disabled={isUpdating}
                            >
                                <option value="">Select column</option>
                                {renameColumns.map(col => (
                                    <option key={col.dataField} value={col.dataField}>
                                        {col.fieldName || col.text || col.dataField}
                                    </option>
                                ))}
                            </select>
                            
                            <input 
                                className="border rounded px-3 py-2 w-full mb-3 text-sm" 
                                placeholder="New name" 
                                value={renameValue} 
                                onChange={e => setRenameValue(e.target.value)}
                                disabled={isUpdating}
                            />
                            
                            <div className="flex justify-end gap-2 mt-2">
                                <button 
                                    className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium" 
                                    onClick={onClose} 
                                    type="button"
                                    disabled={isUpdating}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-60 flex items-center" 
                                    onClick={handleSubmit} 
                                    disabled={!renameField || !renameValue || isUpdating} 
                                    type="button"
                                >
                                    {isUpdating && <div className="spinner-simple w-4 h-4 mr-2 border-[2px] border-white"></div>}
                                    {isUpdating ? 'Renaming...' : 'Rename'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}