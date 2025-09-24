'use client';

// Make sure this utility can only be called from session
let CurrentSessionData = {};
let LeadOwnersById = {};
try{
    CurrentSessionData = JSON.parse(localStorage.getItem('CurrentSessionData') ?? '{}');
    LeadOwnersById = JSON.parse(localStorage.getItem('LeadOwnersById') ?? '{}');
}catch(e){
    console.error(`Unable to parse current state of user`, e);
}

export const Corporate = CurrentSessionData?.corporate;
export const Test = CurrentSessionData?.test;
export const User = CurrentSessionData?.user;
export const Owners = LeadOwnersById;

export function getLeadOwnerById(id){

    if(!id || typeof id !== 'number') return '';
    if(!LeadOwnersById[id]) return '';
    
    return LeadOwnersById[id];
}

export function getCurrentUserMobile() {
    try {
        const session = JSON.parse(localStorage.getItem('CurrentSessionData') ?? '{}');
        return session?.user?.mobile || '';
    } catch (e) {
        // ignore
    }
    return '';
}

export function getCurrentUserNameIfAdmin() {
    try {
        const session = JSON.parse(localStorage.getItem('CurrentSessionData') ?? '{}');
        if (session?.user && session.user._id === -1) {
            return session.user.name || '';
        }
    } catch (e) {
        // ignore
    }
    return '';
}

export const LeadsPerPage = {
    value: () => parseInt(localStorage.getItem('LeadsPerPage') ?? '50'),
    setValue: (value) => localStorage.setItem('LeadsPerPage', value)
}
export const TotalLeads = {
    value: () => parseInt(localStorage.getItem('TotalLeads') ?? '0'),
    setValue: (value) => localStorage.setItem('TotalLeads', value)
}

export const LeadsCurrentPage = {
    value: () => parseInt(localStorage.getItem('LeadsCurrentPage') ?? '1'),
    setValue: (value) => localStorage.setItem('LeadsCurrentPage', value)
}

export const LeadsLastPage = {
    value: () => parseInt(localStorage.getItem('LeadsLastPage') ?? '1'),
    setValue: (value) => localStorage.setItem('LeadsLastPage', value)
}

export const LeadFilters = {
    value: () => JSON.parse(localStorage.getItem('LeadFilters') ?? '[]'),
    setValue: (value) => localStorage.setItem('LeadFilters', JSON.stringify(value)),
    reset: () => localStorage.setItem('LeadFilters', '[]'),
}