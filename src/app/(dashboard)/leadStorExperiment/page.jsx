'use client';
import React, { useState, useMemo } from 'react';

// Single-file React component using Tailwind CSS classes.
// Paste this into a Next.js or Create React App project that has Tailwind configured.

export default function Lead() {
  const initialLeads = Array.from({ length: 20 }).map((_, i) => ({
    id: i + 1,
    name: `Lead ${i + 1}`,
    email: `lead${i + 1}@example.com`,
    phone: `+1-555-01${String(i + 1).padStart(2, '0')}`,
    company: `Company ${i + 1}`,
    status: ['Converted', 'Pending', 'Invited'][Math.floor(Math.random() * 3)],
    source: ['Referral', 'Email', 'Social Media', 'Website'][Math.floor(Math.random() * 4)],
  }));

  const [leads, setLeads] = useState(initialLeads);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter(l =>
      l.name.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      l.company.toLowerCase().includes(q) ||
      l.phone.toLowerCase().includes(q) ||
      l.source.toLowerCase().includes(q)
    );
  }, [leads, query]);

  const pageCount = Math.ceil(filtered.length / pageSize) || 1;
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  function toggleSelect(id) {
    const s = new Set(selected);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    setSelected(s);
  }

  function toggleSelectAllOnPage() {
    const s = new Set(selected);
    const allOnPage = pageData.every(d => s.has(d.id));
    if (allOnPage) {
      pageData.forEach(d => s.delete(d.id));
    } else {
      pageData.forEach(d => s.add(d.id));
    }
    setSelected(s);
  }

  function deleteSelected() {
    if (selected.size === 0) return;
    setLeads(prev => prev.filter(l => !selected.has(l.id)));
    setSelected(new Set());
  }

  function convertSelected() {
    if (selected.size === 0) return;
    setLeads(prev => prev.map(l => selected.has(l.id) ? { ...l, status: 'Converted' } : l));
    setSelected(new Set());
  }

  function badge(status) {
    const base = 'inline-block text-xs px-3 py-1 rounded-full font-medium';
    if (status === 'Converted') return <span className={`${base} bg-green-100 text-green-800`}>Converted</span>;
    if (status === 'Pending') return <span className={`${base} bg-yellow-100 text-yellow-800`}>Pending</span>;
    return <span className={`${base} bg-blue-100 text-blue-800`}>Invited</span>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex text-gray-800">
      {/* Left sidebar (dark) */}
      <aside className="w-16 md:w-20 lg:w-56 bg-gray-900 text-gray-100 p-4 hidden md:block">
        <div className="h-full flex flex-col justify-between">
          <div>
            <div className="mb-8 text-2xl font-bold text-center">☰</div>
            <nav className="space-y-4">
              <div className="px-3 py-2 rounded-lg bg-gray-800">Dashboard</div>
              <div className="px-3 py-2 rounded-lg hover:bg-gray-800">Leads</div>
              <div className="px-3 py-2 rounded-lg hover:bg-gray-800">Reports</div>
              <div className="px-3 py-2 rounded-lg hover:bg-gray-800">Settings</div>
            </nav>
          </div>
          <div className="text-xs text-center opacity-60">v1.0</div>
        </div>
      </aside>

      {/* Main area */}
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header / Hero */}
          <div className="rounded-lg overflow-hidden shadow-md mb-6">
            <div className="bg-gradient-to-r from-blue-800 to-blue-500 p-6 text-white flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold">Welcome to LeadStor</h1>
                <p className="mt-1 opacity-90">Manage your leads effectively and grow your business.</p>
                <div className="mt-4 flex gap-3">
                  <div className="bg-white/10 px-3 py-2 rounded-md">New Leads <span className="ml-2 font-semibold">24</span></div>
                  <div className="bg-white/10 px-3 py-2 rounded-md">Converted <span className="ml-2 font-semibold">12</span></div>
                  <div className="bg-white/10 px-3 py-2 rounded-md">Pending <span className="ml-2 font-semibold">8</span></div>
                </div>
              </div>

              <div className="mt-4 md:mt-0 flex gap-3 items-center">
                <button className="bg-orange-400 hover:bg-orange-500 px-4 py-2 rounded-md font-semibold">Add Lead</button>
                <button className="bg-white text-gray-800 px-4 py-2 rounded-md shadow">Import Leads</button>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <input
                value={query}
                onChange={e => { setQuery(e.target.value); setPage(1); }}
                placeholder="Search leads..."
                className="px-3 py-2 border rounded-md w-64 bg-white"
              />
              <div className="bg-yellow-50 px-4 py-2 rounded-md text-sm">{selected.size} selected</div>
              <div className="ml-2 space-x-2">
                <button onClick={deleteSelected} className="px-3 py-1 border rounded-md">Delete</button>
                <button onClick={convertSelected} className="px-3 py-1 border rounded-md">Convert</button>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="px-3 py-1 border rounded-md">Filter</button>
              <button className="px-3 py-1 border rounded-md">Export</button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-md shadow">
            <table className="min-w-full table-auto text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      onChange={toggleSelectAllOnPage}
                      checked={pageData.every(d => selected.has(d.id)) && pageData.length > 0}
                    />
                  </th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th className="px-4 py-3 text-left">Company</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Lead Source</th>
                </tr>
              </thead>
              <tbody>
                {pageData.map(lead => (
                  <tr key={lead.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.has(lead.id)} onChange={() => toggleSelect(lead.id)} />
                    </td>
                    <td className="px-4 py-3">{lead.name}</td>
                    <td className="px-4 py-3 text-gray-600">{lead.email}</td>
                    <td className="px-4 py-3 text-gray-600">{lead.phone}</td>
                    <td className="px-4 py-3">{lead.company}</td>
                    <td className="px-4 py-3">{badge(lead.status)}</td>
                    <td className="px-4 py-3">{lead.source}</td>
                  </tr>
                ))}

                {pageData.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">No leads found.</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination footer */}
            <div className="px-4 py-3 flex items-center justify-between border-t">
              <div className="text-sm">Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, filtered.length)} of {filtered.length}</div>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1 border rounded disabled:opacity-50"
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >Previous</button>
                <div className="text-sm">Page {page} of {pageCount}</div>
                <button
                  className="px-3 py-1 border rounded disabled:opacity-50"
                  disabled={page === pageCount}
                  onClick={() => setPage(p => Math.min(pageCount, p + 1))}
                >Next</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
