'use client';

import LeadsTable from './table';
import LeadsMenu from './menu';
import LeadsTablePagination from './pagination';

import Spinner from '@/components/elements/Spinner';
import { xFetch } from '@/utility/xFetch';

import { useEffect, useState } from 'react';

export default function Leads() {
    const [ready, setReady] = useState(false);
    const [columns, setColumns] = useState([]);
    const [columnOrder, setColumnOrder] = useState([]);

    // Fetch and apply custom column names and order
    const fetchAndSetColumns = async () => {
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
            setColumns(columnsWithCustomNames);
            let _columnOrder = columnsWithCustomNames.map((item) => item.dataField);
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

    return (
        <div className="w-full h-full bg-white rounded-md shadow-md flex flex-col">
            {(!ready)
                ? <Spinner />
                : <>
                    <LeadsMenu />
                    <LeadsTable columns={columns} setColumns={setColumns} columnOrder={columnOrder} setColumnOrder={setColumnOrder} />
                    <LeadsTablePagination columns={columns} setColumns={setColumns} columnOrder={columnOrder} setColumnOrder={handleReorder} fetchAndSetColumns={fetchAndSetColumns} />
                </>
            }
        </div>
    );
}