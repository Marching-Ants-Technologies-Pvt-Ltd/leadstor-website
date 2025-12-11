'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Corporate, User, Test, LeadFilters } from '@/utility/TinyDB';

// Progress bar component inline
function DownloadProgressBar({ isVisible, progress, message, onCancel }) {
    if (!isVisible) return null;

    return (
        <div className="fixed top-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-w-sm w-full">
            {/* Progress bar at top */}
            <div className="h-1 bg-gray-100 rounded-t-lg overflow-hidden">
                <div 
                    className="h-full bg-blue-600 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
            
            {/* Content */}
            <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                    {/* Icon and content */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Download icon */}
                        <div className="flex items-center justify-center w-8 h-8 bg-[#F1BBEA] rounded-full flex-shrink-0 mt-0.5">
                            <i className="ri-download-line text-black-600"></i>
                        </div>
                        
                        {/* Message and progress */}
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 mb-1 truncate">
                                Excel Export
                            </div>
                            <div className="text-xs text-gray-600 mb-2 break-words">
                                {message || 'Preparing download...'}
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">{progress}% complete</span>
                                <span className="text-gray-400">
                                    {progress < 100 ? 'In progress...' : 'Completed'}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Close button */}
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-md transition-colors flex-shrink-0"
                            title="Cancel download"
                        >
                            <i className="ri-close-line text-sm"></i>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ExportEnquiriesModal({ isOpen, onClose, totalLeads = 0, onDownloadStart, onDownloadProgress, onDownloadEnd, onDownloadCancel, setCancelExportFunction }) {
    const [selectedLimit, setSelectedLimit] = useState(50);
    const [isCustomRange, setIsCustomRange] = useState(false);
    const [fromRow, setFromRow] = useState(0);
    const [tillRow, setTillRow] = useState(100);
    const [isExporting, setIsExporting] = useState(false);
    const [currentWorker, setCurrentWorker] = useState(null);

    // Provide the cancel function to parent component
    useEffect(() => {
        if (setCancelExportFunction) {
            setCancelExportFunction(() => handleCancelProgress);
        }
        return () => {
            if (setCancelExportFunction) {
                setCancelExportFunction(null);
            }
        };
    }, [setCancelExportFunction]);

    // Cleanup worker on component unmount
    useEffect(() => {
        return () => {
            if (currentWorker) {
                currentWorker.terminate();
                setCurrentWorker(null);
            }
        };
    }, [currentWorker]);

    const exportOptions = [
        { value: 50, label: '50' },
        { value: 100, label: '100' },
        { value: 500, label: '500' },
        { value: 1000, label: '1000' },
        { value: 'ALL', label: 'All' }
    ];

    const resetProgress = () => {
        if (currentWorker) {
            currentWorker.terminate();
            setCurrentWorker(null);
        }
    };

    const handleCancelProgress = () => {
        if (currentWorker) {
            currentWorker.terminate();
            setCurrentWorker(null);
        }
        setIsExporting(false);
        onDownloadCancel?.();
        toast.info('Export cancelled');
    };

    const handleExport = async (limit = selectedLimit, offset = 0) => {
        try {
            setIsExporting(true);
            resetProgress();
            
            // Calculate actual limits
            const actualTotalRows = totalLeads || 0;
            let exportLimit = limit === 'ALL' ? actualTotalRows : Math.min(limit, actualTotalRows);
            
            if (isCustomRange) {
                offset = Math.max(0, fromRow);
                exportLimit = Math.min(tillRow - fromRow, actualTotalRows - offset);
                if (exportLimit <= 0) {
                    toast.error('Invalid range specified. Please check your From and Till row values.');
                    return;
                }
            }

            if (exportLimit > actualTotalRows) {
                toast.error(`Cannot export more than ${actualTotalRows} available leads.`);
                return;
            }

            // Show Save As dialog first
            if (!window.showSaveFilePicker) {
                toast.error('File system access not supported in this browser');
                return;
            }

            const defaultFileName = `leads_export_${new Date().toISOString().split('T')[0]}.xlsx`;
            const fileHandle = await window.showSaveFilePicker({
                suggestedName: defaultFileName,
                types: [{
                    description: 'Excel files',
                    accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] }
                }]
            });

            // Get current filters and session data
            const appliedFilters = LeadFilters.value();
            const corporateId = Corporate?._id;
            const corporateType = Corporate?.type;
            const testId = Test?._id;
            const testType = Test?.type;
            const testName = Test?.name;

            if (!corporateId || !testId) {
                toast.error('Missing required parameters');
                return;
            }

            // Check if we need to use worker (for large datasets)
            const useWorker = exportLimit > 500;

            if (useWorker) {
                // Close modal and start progress tracking
                onClose();
                onDownloadStart?.(`Exporting ${exportLimit.toLocaleString()} enquiries...`);

                // Create worker from inline code
                const worker = new Worker("/js/lead-export-worker.js");
                setCurrentWorker(worker);

                const exportParams = {
                    testId: testId,
                    testName: testName || '',
                    testType: testType || '',
                    corporateId: corporateId,
                    corporateType: corporateType || '',
                    offset: offset,
                    limit: exportLimit,
                    filters: appliedFilters,
                    apiBaseUrl: process.env.NEXT_PUBLIC_LEADSTOR_REST
                };

                // Set up worker message handler
                worker.onmessage = (e) => {
                    const { type, progress, processed, total, message, totalProcessed } = e.data;

                    if (type === 'progress') {
                        onDownloadProgress?.(progress, processed, total);
                    } else if (type === 'done') {
                        setCurrentWorker(null);
                        setIsExporting(false);
                        setTimeout(() => {
                            onDownloadEnd?.();
                        }, 2000);
                        
                        toast.success(`Excel export completed! ${totalProcessed} records exported.`);
                        URL.revokeObjectURL(worker);
                    } else if (type === 'error') {
                        setCurrentWorker(null);
                        setIsExporting(false);
                        onDownloadEnd?.();
                        toast.error(`Export failed: ${message}`);
                        URL.revokeObjectURL(worker);
                    }
                };

                worker.onerror = (error) => {
                    console.error('Worker error:', error);
                    setCurrentWorker(null);
                    setIsExporting(false);
                    onDownloadEnd?.();
                    toast.error('Export failed due to worker error');
                    URL.revokeObjectURL(worker);
                };

                // Start worker
                worker.postMessage({ fileHandle, exportParams, token: localStorage.getItem('access_token') });
                return;
            }

            // For small datasets, export directly
            const queryParams = new URLSearchParams({
                testId: testId,
                testName: testName || '',
                testType: testType || '',
                corporateId: corporateId,
                corporateType: corporateType || '',
                offset: offset,
                limit: exportLimit,
                time: new Date().getTime()
            });

            // Add filters to query params
            appliedFilters.forEach(filter => {
                if (filter.field && filter.value) {
                    const fieldMapping = {
                        'status': 'status',
                        'source': 'source',
                        'course': 'course',
                        'location': 'location',
                        'owner': 'owner',
                        'leadProbability': 'leadProbability',
                        'qualification': 'qualification'
                    };
                    
                    const apiField = fieldMapping[filter.field] || filter.field;
                    
                    if (filter.field === 'course') {
                        queryParams.append(apiField, btoa(filter.value));
                    } else {
                        queryParams.append(apiField, filter.value);
                    }
                }
            });

            const token = localStorage.getItem('access_token');
            if (!token) {
                toast.error('Authentication token not found');
                return;
            }

            const apiUrl = `${process.env.NEXT_PUBLIC_LEADSTOR_REST}/services/invite/export?${queryParams.toString()}`;
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,application/octet-stream,*/*'
                }
            });

            if (!response.ok) {
                throw new Error(`Export failed: ${response.statusText}`);
            }

            // Write the file directly for small datasets
            const blob = await response.blob();
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();

            toast.success(`Successfully exported ${exportLimit.toLocaleString()} enquiries to Excel!`);
            onClose();

        } catch (error) {
            console.error('Export error:', error);
            if (error.name === 'AbortError') {
                toast.info('Export cancelled by user');
            } else {
                toast.error(`Export failed: ${error.message}`);
            }
            onDownloadEnd?.();
        } finally {
            setIsExporting(false);
        }
    };

    const handleCustomExport = () => {
        if (fromRow < 0 || tillRow <= fromRow) {
            toast.error('Please enter a valid range. Till Row must be greater than From Row.');
            return;
        }
        if (tillRow - fromRow > totalLeads) {
            toast.error(`Range exceeds available leads. Maximum available: ${totalLeads}`);
            return;
        }
        handleExport(tillRow - fromRow, fromRow);
    };

    // Show progress bar if exporting
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[32rem] mx-auto border border-gray-200">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                    <h2 className="text-2xl font-medium text-gray-500">Export Enquiries</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 focus:outline-none border-none bg-transparent"
                        style={{ color: '#9ca3af', background: 'transparent', border: 'none', boxShadow: 'none', outline: 'none', transition: 'none' }}
                        disabled={isExporting}
                        aria-label="Close"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" style={{ color: '#9ca3af', background: 'transparent', transition: 'none' }}>
                            <path fillRule="evenodd" d="M10 8.586l4.95-4.95a1 1 0 111.414 1.414L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10l-4.95-4.95A1 1 0 115.05 3.636L10 8.586z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-5 space-y-6">
                    {/* Quick Export Options */}
                    <div>
                        <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-1">Quick Export</h4>
                            <p className="text-xs text-gray-600">Export a specific number of most recent enquiries with predefined options</p>
                        </div>
                        <div className="grid grid-cols-5 gap-2 mb-3">
                            {exportOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        setSelectedLimit(option.value);
                                        setIsCustomRange(false);
                                    }}
                                    disabled={isExporting}
                                    className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                                        selectedLimit === option.value && !isCustomRange
                                            ? 'bg-[#F1BBEA] text-black border-gray-300'
                                            : 'bg-white hover:bg-gray-50 border-gray-300 text-gray-700 hover:border-gray-400'
                                    } disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#F1BBEA] focus:ring-offset-2`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                        {selectedLimit && !isCustomRange && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-sm text-green-800">
                                        Ready to export {selectedLimit === 'ALL' ? 'all' : selectedLimit} {selectedLimit === 'ALL' ? `(${totalLeads.toLocaleString()})` : ''} most recent enquiries
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Custom Range */}
                    <div>
                        <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-1">Custom Range Export</h4>
                            <p className="text-xs text-gray-600">Export a specific range of enquiries by defining start and end row numbers</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">From Row</label>
                                <input
                                    type="number"
                                    min="1"
                                    max={totalLeads}
                                    value={fromRow === 0 ? 1 : fromRow + 1}
                                    onChange={(e) => {
                                        const value = Math.max(1, parseInt(e.target.value) || 1);
                                        setFromRow(value - 1);
                                        setIsCustomRange(true);
                                        setSelectedLimit(null);
                                    }}
                                    disabled={isExporting}
                                    className={`w-full px-3 py-2 border rounded-md text-sm transition-colors ${
                                        isCustomRange
                                            ? 'border-[#F1BBEA] focus:border-[#F1BBEA] focus:ring-2 focus:ring-gray-200'
                                            : 'border-gray-300 focus:border-gray-400 focus:ring-2 focus:ring-gray-200'
                                    } focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed`}
                                    placeholder="1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">To Row</label>
                                <input
                                    type="number"
                                    min="1"
                                    max={totalLeads}
                                    value={tillRow}
                                    onChange={(e) => {
                                        const value = Math.max(1, parseInt(e.target.value) || 1);
                                        setTillRow(value);
                                        setIsCustomRange(true);
                                        setSelectedLimit(null);
                                    }}
                                    disabled={isExporting}
                                    className={`w-full px-3 py-2 border rounded-md text-sm transition-colors ${
                                        isCustomRange
                                            ? 'border-[#F1BBEA] focus:border-[#F1BBEA] focus:ring-2 focus:ring-gray-200'
                                            : 'border-gray-300 focus:border-gray-400 focus:ring-2 focus:ring-gray-200'
                                    } focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed`}
                                    placeholder="100"
                                />
                            </div>
                        </div>
                        {isCustomRange && (
                            <div className="p-3 bg-[#F1BBEA] border border-[#F1BBEA] rounded-md">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-black-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-sm text-black-800">
                                        Will export rows {fromRow + 1} to {tillRow} ({Math.max(0, tillRow - fromRow).toLocaleString()} total rows)
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Total leads info */}
                    {totalLeads > 0 && (
                        <div className="pt-4 border-t border-gray-200">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>Total available enquiries: <span className="font-semibold text-gray-900">{totalLeads.toLocaleString()}</span></span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                    <button
                        onClick={onClose}
                        disabled={isExporting}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Cancel
                    </button>
                    
                    {!isCustomRange && selectedLimit ? (
                        <button
                            onClick={() => handleExport()}
                            disabled={isExporting}
                            className="px-4 py-2 text-sm font-medium bg-[#F1BBEA] text-black border border-[#F1BBEA] rounded-md hover:bg-[#F1BBEA] focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                        >
                            {isExporting ? (
                                <>
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Export {selectedLimit === 'ALL' ? 'All' : selectedLimit} Records
                                </>
                            )}
                        </button>
                    ) : isCustomRange ? (
                        <button
                            onClick={handleCustomExport}
                            disabled={isExporting}
                            className="px-4 py-2 text-sm font-medium bg-[#F1BBEA] text-black border border-[#F1BBEA] rounded-md hover:bg-[#F1BBEA] focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                        >
                            {isExporting ? (
                                <>
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Export Rows {fromRow + 1}-{tillRow}
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            disabled
                            className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-200 border border-gray-300 rounded-md cursor-not-allowed flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Select Export Option
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
