'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

export default function Settings() {
  const router = useRouter();

  return (
    <div className="flex h-full border rounded-md overflow-hidden shadow-sm">
      {/* Sidebar */}
      <aside className="w-48 bg-gray-100 p-4 flex flex-col justify-between">
        <div>
          <h3 className="mb-4 text-lg font-semibold text-gray-700">Settings</h3>
          <ul className="space-y-3 text-gray-600">
            <li className="hover:text-blue-600 cursor-pointer">Courses and Fee</li>
            <li className="hover:text-blue-600 cursor-pointer">Sources</li>
            <li className="hover:text-blue-600 cursor-pointer">Statuses</li>
            <li className="hover:text-blue-600 cursor-pointer">Admission Status</li>
            <li className="hover:text-blue-600 cursor-pointer">Currency</li>
            <li className="hover:text-blue-600 cursor-pointer">Table Reorder</li>
            <li className="hover:text-blue-600 cursor-pointer">Field Mapping</li>
          </ul>
        </div>

        {/* Back Button at Bottom */}
        <div>
          <button
            onClick={() => router.push('/leads')}
            className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            ← Back
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <section className="flex-1 p-6 bg-white">
        <h2 className="text-2xl font-bold text-gray-800">Settings Panel</h2>
        <p className="mt-4 text-gray-600">Select a setting from the left to view or edit details here.</p>
      </section>
    </div>
  );
}
