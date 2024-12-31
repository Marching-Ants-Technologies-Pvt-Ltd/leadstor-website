'use client';

export function CheckUncheckAllRows (event) {
    console.log('Calling Check group');
    document.querySelectorAll('table.leadstor-table tbody input[type=checkbox]').forEach(box => box.checked = event.target.checked);
}