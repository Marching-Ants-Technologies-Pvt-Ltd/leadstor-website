'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BarChart3,
  Building2,
  Mail,
  Phone,
  RefreshCw,
  Search,
  Users,
  Ban,
  CheckCircle,
} from 'lucide-react';
import { xFetch } from '@/utility/xFetch';
import { Corporate } from '@/utility/TinyDB';
import { toast } from 'react-toastify';
import BranchTable from '@/components/dashboard/branch/BranchTable';
import AnalyticsChart from '@/components/dashboard/branch/AnalyticsChart';

export default function BranchesPage() {
  const router = useRouter();

  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [corporateId, setCorporateId] = useState(null);
  const [corporateType, setCorporateType] = useState(null);
  const [isSwitchedAccount, setIsSwitchedAccount] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsDateRange, setAnalyticsDateRange] = useState({
    from: '',
    to: '',
  });

  // Load initial corporate info (you might get this from auth context or cookie/localStorage)
  useEffect(() => {
    const cid = Corporate?._id;
    const ctype = Number(localStorage.getItem('corporateType') || '1');
    const switched = localStorage.getItem('isSwitchedAccount') === 'true';

    setCorporateId(cid);
    setCorporateType(ctype);
    setIsSwitchedAccount(switched);

    if (cid) loadBranches(cid);
  }, []);

  const loadBranches = async (cid) => {
    setLoading(true);
    try {
      const data = await xFetch({
        path: '/services/hierarchy/getBranches',
        payload: { corporateId: cid },
      });
      setBranches(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load branches');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchCorporate = async (targetId, level) => {
    if (!confirm(`Switch to ${level === 'parent' ? 'main' : 'child'} account?`)) return;

    try {
      const res = await xFetch({
        path: '/services/switchCorporate/switchCorporate',
        method: 'POST',
        payload: {
          targetCorporateId: targetId,
          hierachyLevel: level,
        },
      });

      if (res?.new_token) {
        localStorage.setItem('access_token', res.new_token);
        // Update other localStorage values if needed
        localStorage.setItem('corporateId', targetId);
        localStorage.setItem('isSwitchedAccount', level === 'child' ? 'true' : 'false');
        window.location.reload();
      } else {
        toast.error(res?.error || 'Switch failed');
      }
    } catch (err) {
      toast.error('Failed to switch account');
    }
  };

  const filteredBranches = branches.filter(
    (b) =>
      b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.mobile?.includes(searchTerm)
  );

  const handleEnableDisableLogin = async (branchId, enable) => {
      const action = enable ? 'enable' : 'disable';
      if (!confirm(`Are you sure you want to ${action} login for this branch?`)) return;
  
      try {
        const res = await xFetch({
          path: '/services/hierarchy/enableDisableLogin',
          method: 'GET',
          payload: {
            corporateId: branchId,
          },
        });
  
        // API returns: { status: 0, message: "Login is enabled" } or { status: 1, message: "Login is disabled" }
        if (res?.status === 0) {
          // Login is enabled successfully
          toast.success('Login is enabled');
          loadBranches(corporateId);
        } else if (res?.status === 1) {
          // Login is disabled successfully
          toast.success('Login is disabled');
          loadBranches(corporateId);
        } else {
          toast.error(res?.message || 'Operation failed');
        }
      } catch (err) {
        toast.error('Failed to update login status');
        console.error('Login toggle error:', err);
      }
    };

  if (!corporateId) return <div className="p-8 text-center">Loading organization...</div>;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Organization Hierarchy</h1>
              {/* <p className="text-sm text-gray-500">Corporate ID: {corporateId}</p> */}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* {isSwitchedAccount && (
              <button
                onClick={() => handleSwitchCorporate(corporateId, 'parent')}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium"
              >
                Switch to Main Account
              </button>
            )} */}

              <button
                onClick={() => setShowAnalytics(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
              >
                <BarChart3 size={16} />
                View Collections Analytics
              </button>
            

            <div className="relative">
              <input
                type="text"
                placeholder="Search branches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            <button
              onClick={() => loadBranches(corporateId)}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
              title="Refresh"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <BranchTable
          branches={filteredBranches}
          loading={loading}
          corporateType={corporateType}
          onSwitch={handleSwitchCorporate}
          onEnableDisableLogin={handleEnableDisableLogin}
        />
      </div>

      {/* Analytics Modal / Section */}
      {showAnalytics && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
            <div className="bg-indigo-600 text-white px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h2 className="text-lg font-semibold">Branch-wise Collections Report</h2>
              <button
                onClick={() => setShowAnalytics(false)}
                className="text-white hover:bg-indigo-700 p-2 rounded-full"
              >
                ×
              </button>
            </div>

            <div className="p-6 flex-1 overflow-auto">
              <AnalyticsChart
                corporateId={corporateId}
                onClose={() => setShowAnalytics(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}