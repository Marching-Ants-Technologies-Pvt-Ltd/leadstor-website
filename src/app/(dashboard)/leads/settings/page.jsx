'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import CourseAndFee from '@/components/dashboard/Lead/Settings/CourseAndFee';
import Sources from '@/components/dashboard/Lead/Settings/Sources';
import Statuses from '@/components/dashboard/Lead/Settings/Statuses';

export default function Settings() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState("courses");

  const menuItems = [
    { key: "courses", label: "Courses and Fee" },
    { key: "sources", label: "Sources" },
    { key: "statuses", label: "Statuses" },
    { key: "team", label: "My Team" },
    { key: "currency", label: "Currency" },
    { key: "reorder", label: "Table Reorder" },
    { key: "mapping", label: "Field Mapping" },
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case "courses":
        return <CourseAndFee />;
      case "sources":
        return <Sources />;
      case "statuses":
        return <Statuses />;
      // Add other cases later...
      default:
        return <div className="text-gray-500">Select an item from the menu</div>;
    }
  };

  return (
    <div className="flex h-full border rounded-md overflow-hidden shadow-sm">
      {/* Sidebar */}
      <aside className="w-52 bg-gray-100 p-4 flex flex-col justify-between">
        <div>
          <h3 className="mb-4 text-lg font-semibold text-gray-700">Settings</h3>
          <ul className="space-y-3 text-gray-600">
            {menuItems.map((item) => (
              <li
                key={item.key}
                onClick={() => setActiveMenu(item.key)}
                className={`cursor-pointer px-2 py-1 rounded 
                  ${
                    activeMenu === item.key
                      ? "bg-blue-100 text-blue-600 font-medium"
                      : "hover:text-blue-600"
                  }`}
              >
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        {/* Back Button */}
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
      <section className="flex-1 p-6 bg-white">{renderContent()}</section>
    </div>
  );
}
