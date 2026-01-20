'use client';

import { useState } from 'react';
import './style.css'
const candidates = [
  {
    id: 1,
    name: 'Preeti Mishra',
    email: 'sumeshbalram@gmail.com',
    mobile: '9096449886',
    qualification: '-',
    city: 'Pune',
    profile: 'HR Manager',
    status: 'Placed',
    resume: 'Essay Topics.docx',
    course: '-',
    startDate: '-',
  },
  {
    id: 2,
    name: 'Test',
    email: 'vikrant.fmi@gmail.com',
    mobile: '8888835288',
    qualification: 'BE',
    city: '-',
    profile: 'HR Executive',
    status: 'Placed',
    resume: 'Pankaj Dwivedi.pdf',
    course: 'RHCSA',
    startDate: '08 Jan 2024',
  },
];

export default function PlacementManagement() {
  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button className="icon-btn">
            <i className="ri-add-line" />
          </button>
          <button className="icon-btn">
            <i className="ri-delete-bin-6-line" />
          </button>
          <button className="icon-btn">
            <i className="ri-filter-3-line" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search"
            className="input-sm"
          />
          <button className="icon-btn">
            <i className="ri-refresh-line" />
          </button>
          <button className="icon-btn">
            <i className="ri-layout-grid-line" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="th"><input type="checkbox" /></th>
              <th className="th">Name</th>
              <th className="th">Email</th>
              <th className="th">Mobile</th>
              <th className="th">Qualification</th>
              <th className="th">Current City</th>
              <th className="th">Job Profiles</th>
              <th className="th">Placement Status</th>
              <th className="th">Resume</th>
              <th className="th">Course</th>
              <th className="th">Course Start Date</th>
            </tr>
          </thead>

          <tbody>
            {candidates.map((c) => (
              <tr
                key={c.id}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="td">
                  <input type="checkbox" />
                </td>

                <td className="td flex items-center gap-1 text-blue-600 cursor-pointer">
                  <i className="ri-pencil-line text-[14px]" />
                  {c.name}
                </td>

                <td className="td">{c.email}</td>
                <td className="td">{c.mobile}</td>
                <td className="td">{c.qualification}</td>
                <td className="td">{c.city}</td>
                <td className="td">{c.profile}</td>

                <td className="td">
                  <span
                    className={`px-2 py-[2px] rounded text-[12px] border
                      ${
                        c.status === 'Placed'
                          ? 'border-green-300 text-green-700'
                          : 'border-blue-300 text-blue-700'
                      }`}
                  >
                    {c.status}
                  </span>
                </td>

                <td className="td text-blue-600 cursor-pointer flex items-center gap-1">
                  <i className="ri-download-2-line" />
                  {c.resume}
                </td>

                <td className="td">{c.course}</td>
                <td className="td">{c.startDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 text-[12px] text-gray-600">
        <div>
          Showing 1 to 10 of 92 rows
          <select className="ml-2 border rounded px-1 py-[2px]">
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </select>
          rows per page
        </div>

        <div className="flex items-center gap-1">
          <button className="page-btn">1</button>
          <button className="page-btn">2</button>
          <button className="page-btn">3</button>
          <button className="page-btn">...</button>
        </div>
      </div>
    </div>
  );
}
