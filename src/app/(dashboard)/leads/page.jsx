'use client';

import LeadsTable from './table';
import LeadsMenu from './menu';
import LeadsTablePagination from './pagination';
import FilterDrawer from './advanceFilter';

import Spinner from '@/components/elements/Spinner';
import { xFetch } from '@/utility/xFetch';

import { useEffect, useState } from 'react';

export default function Leads() {
    const [ready, setReady] = useState(false);
    const [columns, setColumns] = useState([]);
    const [columnOrder, setColumnOrder] = useState([]);
    const [showPerPageDropdown, setShowPerPageDropdown] = useState(false);
    const [isDrawerOpen, setDrawerOpen] = useState(false);
    const [leads, setLeads] = useState([]);
    const [selectedLeadIds, setSelectedLeadIds] = useState([]);

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

    // Get filter params and columns
    useEffect(() => {
        xFetch({
            path: '/services/profile/getUsers',
            payload: { basic: 1 }
        })
            .then(data => {
                localStorage.setItem('LeadOwnersById', JSON.stringify(data));
                setReady(true);
                fetchAndSetColumns();
            })
            .catch(error => {
                console.error(`An error occurred while fetching leads`, error);
                toast.error(`Something went wrong! Please refresh the tab!`);
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

    return (
        <div className="w-full h-full bg-white rounded-md shadow-md flex flex-col">
            {(!ready)
                ? <Spinner />
                : <>
                    <LeadsMenu onOpenAdvanceFilter={() => setDrawerOpen(true)} leads={leads} selectedLeadIds={selectedLeadIds} setSelectedLeadIds={setSelectedLeadIds} />
                    <LeadsTable columns={columns} setColumns={setColumns} columnOrder={columnOrder} setColumnOrder={setColumnOrder} leads={leads} setLeads={setLeads} selectedLeadIds={selectedLeadIds} setSelectedLeadIds={setSelectedLeadIds} />
                    <LeadsTablePagination columns={columns} setColumns={setColumns} columnOrder={columnOrder} setColumnOrder={handleReorder} fetchAndSetColumns={fetchAndSetColumns} showPerPageDropdown={showPerPageDropdown} setShowPerPageDropdown={setShowPerPageDropdown} />
                    <FilterDrawer isOpen={isDrawerOpen} onClose={() => setDrawerOpen(false)} onApplyFilters={handleApplyFilters} />
                </>
            }
        </div>
    );
}