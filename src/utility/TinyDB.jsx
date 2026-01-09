// utility/TinyDB.js
'use client';

// Global in-memory cache (faster lookups after first access)
let LeadOwnersById = {};

// Load from localStorage on module import (client-side only)
if (typeof window !== 'undefined') {
  try {
    const storedOwners = localStorage.getItem('LeadOwnersById');
    if (storedOwners) {
      LeadOwnersById = JSON.parse(storedOwners);
      console.log('LeadOwnersById loaded from localStorage');
    }
  } catch (e) {
    console.error('Failed to parse LeadOwnersById from localStorage', e);
  }
}

// Session data (unchanged)
let CurrentSessionData = {};
if (typeof window !== 'undefined') {
  try {
    CurrentSessionData = JSON.parse(localStorage.getItem('CurrentSessionData') ?? '{}');
  } catch (e) {
    console.error('Unable to parse CurrentSessionData', e);
  }
}

export const Corporate = CurrentSessionData?.corporate;
export const Test = CurrentSessionData?.test;
export const User = CurrentSessionData?.user;
export const Owners = LeadOwnersById;

// Fetch owners ONLY if not already cached in localStorage
export const initializeLeadOwners = async () => {
  if (typeof window === 'undefined') return; // Server-side safety

  // Already loaded? Skip fetch
  if (Object.keys(LeadOwnersById).length > 0) {
    console.log('LeadOwnersById already initialized — skipping fetch');
    return;
  }

  try {
    const { xFetch } = await import('@/utility/xFetch');

    const data = await xFetch({
      path: '/services/profile/getUsers',
      payload: { basic: 1 }
    });

    // Store in localStorage
    localStorage.setItem('LeadOwnersById', JSON.stringify(data));

    // Update in-memory cache
    LeadOwnersById = data;

    console.log('LeadOwnersById fetched and cached successfully');
  } catch (error) {
    console.error('Failed to fetch LeadOwnersById:', error);
  }
};

// Lookup function — uses in-memory cache first
export function getLeadOwnerById(id) {
  if (!id || typeof id !== 'number') return '';

  const ownerName = LeadOwnersById[id];
  if (ownerName) return ownerName;

  // Fallback: if somehow not in cache, try to parse from storage
  try {
    const stored = localStorage.getItem('LeadOwnersById');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed[id] || '';
    }
  } catch (e) {
    // silent fail
  }

  return '';
}

export function getCurrentUserMobile() {
  try {
    const session = JSON.parse(localStorage.getItem('CurrentSessionData') ?? '{}');
    return session?.user?.mobile || '';
  } catch (e) {
    return '';
  }
}

export function getCurrentUserNameIfAdmin() {
  try {
    const session = JSON.parse(localStorage.getItem('CurrentSessionData') ?? '{}');
    if (session?.user && session.user._id === -1) {
      return session.user.name || '';
    }
  } catch (e) {
    return '';
  }
}

// Your existing tiny helpers (unchanged)
export const LeadsPerPage = {
  value: () => parseInt(localStorage.getItem('LeadsPerPage') ?? '50'),
  setValue: (value) => localStorage.setItem('LeadsPerPage', value)
};

export const TotalLeads = {
  value: () => parseInt(localStorage.getItem('TotalLeads') ?? '0'),
  setValue: (value) => localStorage.setItem('TotalLeads', value)
};

export const LeadsCurrentPage = {
  value: () => parseInt(localStorage.getItem('LeadsCurrentPage') ?? '1'),
  setValue: (value) => localStorage.setItem('LeadsCurrentPage', value)
};

export const LeadFilters = {
  value: () => JSON.parse(localStorage.getItem('LeadFilters') ?? '[]'),
  setValue: (value) => localStorage.setItem('LeadFilters', JSON.stringify(value)),
  reset: () => localStorage.setItem('LeadFilters', '[]')
};

export const LeadSearch = {
  value: () => localStorage.getItem('LeadSearch') ?? '',
  setValue: (value) => localStorage.setItem('LeadSearch', value),
  reset: () => localStorage.setItem('LeadSearch', '')
};