'use client';

import { useState } from 'react';
import ExpenseController from './expenseManagement/controller';
import ExpenseFormFieldConntroller from './expenseFormManagement/controller';

export default function ExpensesTabs() {
  const [activeTab, setActiveTab] = useState('expenseManagement');

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Tabs */}
      <div className="bg-white px-6 border-b shadow-sm">
        <div className="max-w-7xl mx-auto flex gap-8 text-sm">
          <button
            onClick={() => setActiveTab('expenseManagement')}
            className={`py-4 border-b-2 transition ${
              activeTab === 'expenseManagement'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Expense Management
          </button>

          <button
            onClick={() => setActiveTab('expenseFormManagement')}
            className={`py-4 border-b-2 transition ${
              activeTab === 'expenseFormManagement'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Expense Form Management
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'expenseManagement' && <ExpenseController />}
        {activeTab === 'expenseFormManagement' && <ExpenseFormFieldConntroller />}
      </div>
    </div>
  );
}
