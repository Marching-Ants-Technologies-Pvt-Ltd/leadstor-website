'use client';

import { useEffect, useState } from 'react';
import LeadsTable from '@/components/dashboard/Lead/LeadTable';
import LeadsMenu from '@/components/dashboard/Lead/LeadMenu';
import LeadsTablePagination from '@/components/dashboard/Lead/Pagination';
import FilterDrawer from '@/components/dashboard/Lead/AdvanceFilter';
import { xFetch } from '@/utility/xFetch';
import AddLead from '@/components/dashboard/Lead/AddLead';

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

    // ⭐ NEW STATE: WILL CONTROL ADD LEAD PANEL
    const [openAddLead, setOpenAddLead] = useState(false);

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

    // Initial Load
    useEffect(() => {
        xFetch({
            path: '/services/profile/getUsers',
            payload: { basic: 1 }
        })
        .then(data => {
            if (typeof window !== "undefined") {
                localStorage.setItem("LeadOwnersById", JSON.stringify(data));
            }
            fetchAndSetColumns();
        })
        .catch(error => {
            console.error(`An error occurred while fetching leads`, error);
        });

        const filters = JSON.parse(localStorage.getItem('LeadFilters') || '[]');
        const needsCleanup = filters.some(f => typeof f.value === 'object');
        if (needsCleanup) {
            localStorage.removeItem('LeadFilters');
        }
    }, []);

    // Handler for reordering columns
    const handleReorder = (newOrder) => {
        setColumnOrder(newOrder);
        fetchAndSetColumns();
    };

    // APPLY FILTER FROM DRAWER
    const handleApplyFilters = (filters) => {
        setDrawerOpen(false);
    };

    // DOWNLOAD EVENTS
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
            progress,
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
        if (cancelExportFunction) {
            cancelExportFunction();
        } else {
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
        <div className="w-full bg-white rounded-md shadow-md flex flex-col"
            style={{
                height: "calc(100vh - var(--header-height))",
            }}
        >
            {/* ⭐ CONDITIONAL RENDERING */}
            {openAddLead ? (
                
                // SHOW ADD LEAD INLINE REPLACING TABLE
                <AddLead
                    onClose={() => setOpenAddLead(false)}
                />

            ) : (
                <>
                <div className="bg-white py-2 pt-1 rounded-b-xl shadow-sm">
                    {/* TOP MENU */}
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
                        setOpenAddLead={setOpenAddLead}
                    />
                </div>
                    {/* NORMAL LEADS TABLE */}
                    <LeadsTable
                        columns={columns}
                        setColumns={setColumns}
                        columnOrder={columnOrder}
                        setColumnOrder={setColumnOrder}
                        leads={leads}
                        setLeads={setLeads}
                        selectedLeadIds={selectedLeadIds}
                        setSelectedLeadIds={setSelectedLeadIds}
                    />

                    {/* PAGINATION */}
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

                    {/* ADVANCE FILTER */}
                    <FilterDrawer
                        isOpen={isDrawerOpen}
                        onClose={() => setDrawerOpen(false)}
                        onApplyFilters={handleApplyFilters}
                    />
                </>
            )}
        </div>
    );
}
