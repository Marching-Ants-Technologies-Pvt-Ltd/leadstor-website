'use client';

import { useState, useEffect } from 'react';
import { xFetch } from '@/utility/xFetch';

export default function ReorderColumnModal({ 
    isOpen, 
    onClose, 
    onReorder, 
    columns = [], 
    columnOrder = [] 
}) {
    const [reorderList, setReorderList] = useState([]);
    const [modalColumns, setModalColumns] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // Fetch latest columns from backend when opening modal
    useEffect(() => {
        if (isOpen) {
            fetchColumns();
        }
    }, [isOpen]);

    const fetchColumns = async () => {
        setIsLoading(true);
        try {
            const sessionData = JSON.parse(localStorage.getItem('CurrentSessionData') || '{}');
            const corporateId = sessionData?.corporate?._id;
            if (!corporateId) throw new Error('Corporate ID not found');
            
            const data = await xFetch({
                method: 'GET',
                path: '/services/profile/getLeadTableReorder',
                payload: { 
                    corporateId,
                    corporateType: sessionData?.corporate?.type
                }
            });

            // Apply custom column names from localStorage
            let columnsWithCustomNames = data;
            try {
                const key = `leadTableColumnNames_${corporateId}`;
                const customNames = JSON.parse(localStorage.getItem(key) || '{}');
                columnsWithCustomNames = data.map(col =>
                    customNames[col.dataField]
                        ? { ...col, fieldName: customNames[col.dataField] }
                        : col
                );
            } catch {}
            
            if (Array.isArray(columnsWithCustomNames) && columnsWithCustomNames.length > 0) {
                // Extract column order and set modal columns
                const fetchedColumnOrder = columnsWithCustomNames.map(item => item.dataField).filter(field => field !== 'action');
                setReorderList(fetchedColumnOrder);
                setModalColumns(columnsWithCustomNames);
            } else {
                // Fallback to current props if backend returns empty data
                setReorderList(Array.isArray(columnOrder) ? [...columnOrder] : []);
                setModalColumns(columns || []);
            }
            
        } catch (error) {
            console.error('Error fetching column order:', error);
            // Fallback to current props
            setReorderList(Array.isArray(columnOrder) ? [...columnOrder] : []);
            setModalColumns(columns || []);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReorder = (from, to) => {
        if (to < 0 || to >= reorderList.length) return;
        const updated = [...reorderList];
        const [moved] = updated.splice(from, 1);
        updated.splice(to, 0, moved);
        setReorderList(updated);
    };
    
    const handleSubmit = async () => {
        setIsUpdating(true);
        
        try {
            const sessionData = JSON.parse(localStorage.getItem('CurrentSessionData') || '{}');
            const corporateId = sessionData?.corporate?._id;
            if (!corporateId) throw new Error('Corporate ID not found');
            
            // 1. Call parent callback FIRST for immediate optimistic update
            if (onReorder) {
                onReorder([...reorderList]);
            }
            
            // 3. Close modal
            onClose();
            
            // 4. Prepare payload for API call
            const payload = {
                corporateId,
                data: reorderList.map(colKey => {
                    const col = modalColumns.find(c => c.dataField === colKey);
                    return col;
                })
            };
            
            // 5. Make API call in background (don't block UI)
            xFetch({
                method: 'POST',
                path: '/services/profile/updateLeadTableReorder',
                payload
            }).catch((error) => {
                console.warn('Background API call failed for reorder:', error);
                // Don't show error toast as user already sees success
                // You could implement a retry mechanism here if needed
            });
            
        } catch (err) {
            // Don't show error toast as user already sees success
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
                    <h2 className="text-lg font-bold text-gray-800">Reorder Columns</h2>
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
                    {isLoading ? (
                        <div className="text-gray-400 text-sm py-4 flex items-center justify-center">
                            <div className="spinner-simple w-5 h-5 mr-2 border-[2px]"></div>
                            Loading columns...
                        </div>
                    ) : Array.isArray(modalColumns) && Array.isArray(reorderList) && modalColumns.length && reorderList.length ? (
                        <ul className="mb-4">
                            {reorderList.map((col, idx) => (
                                <li key={col} className="flex items-center justify-between py-2 border-b last:border-b-0">
                                    <span className="text-gray-700 text-sm">
                                        {modalColumns.find(c => c.dataField === col)?.fieldName || col}
                                    </span>
                                    <span>
                                        <button 
                                            className="px-2 text-gray-500 hover:text-blue-600 disabled:opacity-50" 
                                            disabled={idx === 0 || isUpdating} 
                                            onClick={() => handleReorder(idx, idx-1)}
                                        >
                                            &uarr;
                                        </button>
                                        <button 
                                            className="px-2 text-gray-500 hover:text-blue-600 disabled:opacity-50" 
                                            disabled={idx === reorderList.length-1 || isUpdating} 
                                            onClick={() => handleReorder(idx, idx+1)}
                                        >
                                            &darr;
                                        </button>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-gray-400 text-sm py-4">No columns to reorder.</div>
                    )}
                    
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
                            disabled={isLoading || isUpdating} 
                            type="button"
                        >
                            {isUpdating && <div className="spinner-simple w-4 h-4 mr-2 border-[2px] border-white"></div>}
                            {isUpdating ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}