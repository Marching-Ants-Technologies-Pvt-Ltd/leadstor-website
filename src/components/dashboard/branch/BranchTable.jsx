'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, RefreshCw, Mail, Phone, CheckCircle, Ban, Users, CreditCard, Lock, Unlock } from 'lucide-react';

export default function BranchTable({ branches, loading, corporateType, onSwitch, onEnableDisableLogin }) {
  const router = useRouter();

  const handleChildClick = (branch) => {
    // Navigate to leads page with the child corporate ID and test info
    router.push(`/leads?corporateId=${branch.id}&testId=${branch.testId}&testType=${branch.testType}`);
  };

  const handleViewAdmission = (branch) => {
    // Navigate to payments page with the child corporate ID and test info
    router.push(`/payments?corporateId=${branch.id}&testId=${branch.testId}&testType=${branch.testType}`);
  };

  const handleViewLeads = (branch) => {
    // Navigate to leads page with the child corporate ID and test info
    router.push(`/leads?corporateId=${branch.id}&testId=${branch.testId}&testType=${branch.testType}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        <div className="animate-spin mr-3">
          <RefreshCw size={24} />
        </div>
        Loading branches...
      </div>
    );
  }

  if (branches.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <Building2 size={48} className="mx-auto mb-4 text-gray-300" />
        No branches found
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow border overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Mobile
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {branches.map((branch) => (
            <tr key={branch.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                {corporateType === 1 ? (
                  <button
                    onClick={() => onSwitch(branch.id, 'child')}
                    className="text-indigo-600 hover:text-indigo-900 font-medium"
                  >
                    {branch.name}
                  </button>
                ) : (
                  <button
                    onClick={() => handleChildClick(branch)}
                    className="text-indigo-600 hover:text-indigo-900 font-medium flex items-center gap-1"
                    title="View leads for this branch"
                  >
                    <Users size={14} />
                    {branch.name}
                  </button>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {branch.email || '—'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {branch.mobile || '—'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleViewLeads(branch)}
                    title="View leads"
                    className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded"
                  >
                    <Users size={18} />
                  </button>
                  <button
                    onClick={() => handleViewAdmission(branch)}
                    title="View admission/payment"
                    className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                  >
                    <CreditCard size={18} />
                  </button>
                  {branch.loginDisabled == "1" ? (
                    <button
                      onClick={() => onEnableDisableLogin(branch.id, true)}
                      title="Enable login"
                      className="text-orange-600 hover:text-orange-900 p-1 hover:bg-orange-50 rounded"
                    >
                      <Lock size={18} />
                    </button>
                  ) : (
                    <button
                      onClick={() => onEnableDisableLogin(branch.id, false)}
                      title="Disable login"
                      className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                    >
                      <Unlock size={18} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}