'use client';

import { useEffect, useState } from 'react';
import LeadsTable from '@/components/dashboard/Lead/LeadTable';
import LeadsMenu from '@/components/dashboard/Lead/LeadMenu';
import LeadsTablePagination from '@/components/dashboard/Lead/Pagination';
import FilterDrawer from '@/components/dashboard/Lead/AdvanceFilter';
import { xFetch } from '@/utility/xFetch';

export default function Leads() {
    const [columns, setColumns] = useState([]);
    const [columnOrder, setColumnOrder] = useState([]);
    const [showPerPageDropdown, setShowPerPageDropdown] = useState(false);
    const [isDrawerOpen, setDrawerOpen] = useState(false);
    const [leads, setLeads] = useState([]);
    const [selectedLeadIds, setSelectedLeadIds] = useState([]);
    
    // Download notification state
    const [downloadNotification, setDownloadNotification] = useState({
        hasActiveDownload: false,
        progress: 0,
        message: '',
        showCard: false
    });

    // Store reference to the cancel function from ExportEnquiriesModal
    const [cancelExportFunction, setCancelExportFunction] = useState(null);

    // Fetch and apply custom column names and order
    const fetchAndSetColumns = async () => {
        try {
            const data = await xFetch({ path: '/services/profile/columns' });
            setColumns(data);
            let _columnOrder = data.map((item) => item.dataField);
            _columnOrder = _columnOrder.filter(item => item !== 'action');
            setColumnOrder(_columnOrder);
        } catch (error) {
            setColumns([]);
        }
    };

    // Get filter params and columns - but don't block UI rendering
    useEffect(() => {
        xFetch({
            path: '/services/profile/getUsers',
            payload: { basic: 1 }
        })
            .then(data => {
                localStorage.setItem('LeadOwnersById', JSON.stringify(data));
                fetchAndSetColumns();
            })
            .catch(error => {
                console.error(`An error occurred while fetching leads`, error);
                // Don't show toast error on initial load, let components handle their own loading states
            });
    }, []);

    // Handler for reordering columns (optimistic update)
    const handleReorder = (newOrder) => {
        setColumnOrder(newOrder); // Optimistically update UI
        if (typeof fetchAndSetColumns === 'function') {
            fetchAndSetColumns();
        }
    };

    // Handler for applying filters from the drawer
    const handleApplyFilters = (filters) => {
        // TODO: Use filters in your leads table logic
        setDrawerOpen(false);
    };

    // Download notification handlers
    const handleDownloadStart = (message) => {
        setDownloadNotification({
            hasActiveDownload: true,
            progress: 0,
            message: message || 'Starting download...',
            showCard: false
        });
    };

    const handleDownloadProgress = (progress, processed, total) => {
        setDownloadNotification(prev => ({
            ...prev,
            progress: progress,
            message: `Processing ${processed?.toLocaleString()} of ${total?.toLocaleString()} records...`
        }));
    };

    const handleDownloadEnd = () => {
        setDownloadNotification({
            hasActiveDownload: false,
            progress: 0,
            message: '',
            showCard: false
        });
    };

    const handleDownloadCancel = () => {
        // Call the actual cancel function from ExportEnquiriesModal if available
        if (cancelExportFunction) {
            cancelExportFunction();
        } else {
            // Fallback: just reset the notification state
            setDownloadNotification({
                hasActiveDownload: false,
                progress: 0,
                message: '',
                showCard: false
            });
        }
    };

    const toggleDownloadCard = () => {
        setDownloadNotification(prev => ({
            ...prev,
            showCard: !prev.showCard
        }));
    };

    return (
        <div className="w-full h-full bg-white rounded-md shadow-md flex flex-col">
            <LeadsMenu 
                onOpenAdvanceFilter={() => setDrawerOpen(true)} 
                leads={leads} 
                selectedLeadIds={selectedLeadIds} 
                setSelectedLeadIds={setSelectedLeadIds}
                onDownloadStart={handleDownloadStart}
                onDownloadProgress={handleDownloadProgress}
                onDownloadEnd={handleDownloadEnd}
                onDownloadCancel={handleDownloadCancel}
                setCancelExportFunction={setCancelExportFunction}
            />
            <LeadsTable columns={columns} setColumns={setColumns} columnOrder={columnOrder} setColumnOrder={setColumnOrder} leads={leads} setLeads={setLeads} selectedLeadIds={selectedLeadIds} setSelectedLeadIds={setSelectedLeadIds} />
            <LeadsTablePagination
                columns={columns}
                setColumns={setColumns}
                columnOrder={columnOrder}
                setColumnOrder={handleReorder}
                fetchAndSetColumns={fetchAndSetColumns}
                showPerPageDropdown={showPerPageDropdown}
                setShowPerPageDropdown={setShowPerPageDropdown}
                downloadNotification={downloadNotification}
                toggleDownloadCard={toggleDownloadCard}
                onDownloadCancel={handleDownloadCancel}
            />
            <FilterDrawer isOpen={isDrawerOpen} onClose={() => setDrawerOpen(false)} onApplyFilters={handleApplyFilters} />
        </div>
    );
}