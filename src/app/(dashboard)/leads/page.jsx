'use client';

import LeadsTable from './table';
import LeadsMenu from './menu';
import LeadsTablePagination from './pagination';

import Spinner from '@/components/elements/Spinner';
import { xFetch } from '@/utility/xFetch';

import { useEffect, useState } from 'react';

export default function Leads() {

    const [ready, setReady] = useState(false);

    // Get filter params
    useEffect(() => {
        xFetch({
            path: '/services/profile/getUsers',
            payload: { basic: 1 }
        })
            .then(data => {
                localStorage.setItem('LeadOwnersById', JSON.stringify(data));
                setReady(true);
            })
            .catch(error => {
                console.error(`An error occurred while fetching leads`, error);
                toast.error(`Something went wrong! Please refresh the tab!`);
            });
    }, []);

    return (
        <div className="w-full h-full bg-white rounded-md shadow-md flex flex-col">
            {(!ready)
                ? <Spinner />
                : <>
                    <LeadsMenu />
                    <LeadsTable />
                    <LeadsTablePagination />
                </>
            }
        </div>
    );
}