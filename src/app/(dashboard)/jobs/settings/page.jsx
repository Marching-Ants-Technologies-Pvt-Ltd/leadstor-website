'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RiArrowDownSLine, RiArrowRightSLine } from 'react-icons/ri';
import JobProfileSettings from '@/components/dashboard/placement/JobProfileSettings';

export default function JobSettingsPage() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState('jobProfile');
  const [openMenus, setOpenMenus] = useState({ jobPosting: true });

  const menuStructure = useMemo(
    () => [
      {
        label: 'Job Posting',
        key: 'jobPosting',
        children: [{ key: 'jobProfile', label: 'Job Profile' }],
      },
    ],
    []
  );

  const renderContent = () => {
    switch (activeMenu) {
      case 'jobProfile':
        return <JobProfileSettings />;
      default:
        return <div className="text-gray-500">Select an item from the menu</div>;
    }
  };

  const toggleMenu = (key) => {
    setOpenMenus((prev) => ({ [key]: !prev[key] }));
  };

  return (
    <div className="flex h-full w-full border rounded-md shadow-sm overflow-hidden bg-white">
      <aside className="w-52 bg-gray-100 p-3 overflow-y-auto text-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-700">Settings</h3>

        <ul className="ml-3 mt-1 space-y-1 border-l pl-2 border-gray-300 text-sm">
          {menuStructure.map((menu) => (
            <li key={menu.key}>
              <div
                onClick={() => toggleMenu(menu.key)}
                className="cursor-pointer flex justify-between items-center px-2 py-1 hover:bg-gray-200 rounded"
              >
                <span>{menu.label}</span>
                {openMenus[menu.key] ? <RiArrowDownSLine /> : <RiArrowRightSLine />}
              </div>

              {openMenus[menu.key] && (
                <ul className="ml-4 mt-1 space-y-1 border-l pl-3 border-gray-300">
                  {menu.children.map((child) => (
                    <li
                      key={child.key}
                      onClick={() => setActiveMenu(child.key)}
                      className={`cursor-pointer px-2 py-1 rounded ${
                        activeMenu === child.key
                          ? 'bg-blue-100 text-blue-600 font-medium'
                          : 'hover:text-blue-600'
                      }`}
                    >
                      {child.label}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>

        <button
          onClick={() => router.push('/jobs')}
          className="w-full mt-3 px-2 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          ← Back
        </button>
      </aside>

      <section className="flex-1 p-4 bg-white overflow-y-auto text-sm">
        {renderContent()}
      </section>
    </div>
  );
}
