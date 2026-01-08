'use client';

import { useEffect, useState } from 'react';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
            const filteredColumns = data.filter(
                c => c.dataField !== 'action' && c.dataField !== 'altMobile'
            );

            setColumns(filteredColumns);
            setColumnOrder(filteredColumns.map(c => c.dataField));

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

    const handleDeleteSelected = async () => {
        if (selectedLeadIds.length === 0) return;

        if (!confirm(`Are you sure you want to delete ${selectedLeadIds.length} invite(s)? This cannot be undone.`)) {
            return;
        }
        try {
            const response = await xFetch({
                path: "/services/invite/deleteInvite",
                method: "POST",
                payload: { invitationIds: selectedLeadIds },
            });

            if (response) {
                toast.success(`Deleted ${selectedLeadIds.length} invite(s) successfully`);
                setSelectedLeadIds([]);
                window.tableRefresh?.();
            } else {
                toast.error("Failed to delete invites");
            }
        } catch (err) {
            console.error("Delete error:", err);
            toast.error("Error deleting invites");
        }
    };

    

    return (
        <div className="flex-1 overflow-hidden flex flex-col">
            <ToastContainer position="top-right" />
            
            {openAddLead ? (
                <AddLead onClose={() => setOpenAddLead(false)} />
            ) : (
                <>
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
                        onDeleteSelected={handleDeleteSelected}
                    />
                    {/* NORMAL LEADS TABLE */}
                    <div className="flex-1 flex flex-col px-4 gap-3 overflow-hidden">
                        <LeadsTable
                            columns={columns}
                            setColumns={setColumns}
                            columnOrder={columnOrder}
                            setColumnOrder={setColumnOrder}
                            leads={leads}
                            setLeads={setLeads}
                            selectedLeadIds={selectedLeadIds}
                            setSelectedLeadIds={setSelectedLeadIds}
                            onOpenAdvanceFilter={() => setDrawerOpen(true)}
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
                    </div>

                    {/* ADVANCE FILTER */}
                    <FilterDrawer
                        isOpen={isDrawerOpen}
                        onClose={() => setDrawerOpen(false)}
                        onApplyFilters={handleApplyFilters}
                        onOpenAdvanceFilter={() => setDrawerOpen(true)}
                    />
                </>
            )}
        </div>
    );
}
