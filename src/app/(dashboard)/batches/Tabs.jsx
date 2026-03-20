'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import LabelController from './label/labelController';
import BatchController from './batch/batchController';
import AttendanceController from './attendance/attendanceController';
import { User } from '@/utility/TinyDB';

export default function BatchesTabs() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('batches');

  // Restrict Finance role from accessing Batches page
  useEffect(() => {
    const checkRole = async () => {
      const session = await getSession();
      if (session?.user?.role === 'Finance') {
        toast.error('You do not have access to Batches page');
        router.push('/payments');
      }
    };
    checkRole();
  }, [router]);

  // Trainer or Telecaller → show only Attendance Management (no tabs)
  if (User?.role === 'Trainer' || User?.role === 'Telecaller') {
    return (
      <div className="h-full flex flex-col bg-slate-50">
        <div className="flex-1 overflow-hidden">
          <AttendanceController />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Tabs */}
      <div className="bg-white px-6 border-b shadow-sm">
        <div className="max-w-7xl mx-full flex gap-8 text-sm">
          <button
            onClick={() => setActiveTab('labels')}
            className={`py-4 border-b-2 transition ${
              activeTab === 'labels'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Course Management
          </button>

          <button
            onClick={() => setActiveTab('batches')}
            className={`py-4 border-b-2 transition ${
              activeTab === 'batches'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Batch Management
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'labels' && <LabelController />}
        {activeTab === 'batches' && <BatchController />}
      </div>
    </div>
  );
}
