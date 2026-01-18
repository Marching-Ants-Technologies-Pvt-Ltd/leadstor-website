'use client';

import { useState } from 'react';
import LabelController from './label/labelController';
import BatchController from './batch/batchController';

export default function BatchesTabs() {
  const [activeTab, setActiveTab] = useState('labels');

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Tabs */}
      <div className="bg-white px-6 border-b shadow-sm">
        <div className="max-w-7xl mx-auto flex gap-8 text-sm">
          <button
            onClick={() => setActiveTab('labels')}
            className={`py-4 border-b-2 transition ${
              activeTab === 'labels'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Label Management
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
