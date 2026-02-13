 'use client'
import { useEffect, useState, useMemo } from 'react';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import * as XLSX from 'xlsx';
import DatePicker from 'react-datepicker';       
import 'react-datepicker/dist/react-datepicker.css';
import { xFetch } from '@/utility/xFetch';         
import { Corporate } from '@/utility/TinyDB';
import ExpenseTable from './table';
import ExpenseFormModal from '@/components/expense/ExpenseFormModal';

export default function ExpenseManagement({}) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date()); 
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  const [modalOpen, setModalOpen] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const corporateId = Corporate?._id;
  const totalExpense = useMemo(() => {
    return expenses.reduce((sum, row) => sum + (Number(row.amount || 0) + Number(row.variableAmount || 0)), 0);
  }, [expenses]);

  const reloadExpenses = async () => {
    setLoading(true);
    try {
      const start = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
      const end   = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);

      const data = await xFetch({
        path: '/services/expense/getExpenses',
        payload: {
          corporateId,
          startDate: start.toISOString().split('T')[0],
          endDate:   end.toISOString().split('T')[0],
        },
      });

      setExpenses(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadExpenses();
  }, [selectedMonth]);

  // Filter (client-side search)
  const filtered = useMemo(() => {
    if (!search.trim()) return expenses;
    const term = search.toLowerCase();
    return expenses.filter(e =>
      (e.expenseHead   || '').toLowerCase().includes(term) ||
      (e.expenseType   || '').toLowerCase().includes(term) ||
      (e.expenseTowards|| '').toLowerCase().includes(term) ||
      (e.remarks       || '').toLowerCase().includes(term)
    );
  }, [expenses, search]);

  const totalRows    = filtered.length;
  const pageSize     = 10;
  const totalPages   = Math.ceil(totalRows / pageSize);
  const [page, setPage] = useState(1);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  // Delete bulk
  const handleDelete = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Delete ${selectedIds.length} expense(s)?`)) return;

    try {
      for (const id of selectedIds) {
        await xFetch({
          path: `/services/expense/deleteExpense`,
          method: 'POST',
          payload: { id },
        });
      }
      toast.success('Deleted successfully');
      setSelectedIds([]);
      reloadExpenses();
    } catch {
      toast.error('Delete failed');
    }
  };

  // Export
  const exportToExcel = () => {
    if (!filtered.length) return toast.warn('No data');

    const sheet = filtered.map(e => ({
      'Expense Head'     : e.expenseHead,
      'Frequency'        : e.frequency,
      'Expense'          : e.expenseType,
      'Towards'          : e.expenseTowards,
      'Amount'           : e.amount,
      'Variable Amount'  : e.variableAmount,
      'Date'             : e.expenseDate,
      'Remarks'          : e.remarks,
      'Paid Status'      : e.paidStatus === 1 ? 'Paid' : e.paidStatus === 2 ? 'Not Paid' : '-',
    }));

    const ws = XLSX.utils.json_to_sheet(sheet);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Expenses');
    XLSX.writeFile(wb, `expenses_${selectedMonth.toLocaleString('default', { month: 'short', year: 'numeric' })}.xlsx`);
  };

  const openModal = (mode, expense = null) => {
    setSelectedExpense(expense);
    setModalOpen(mode);
  };

  const handleSuccess = () => {
    setModalOpen(null);
    setSelectedExpense(null);
    reloadExpenses();
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <ToastContainer theme="light" transition={Bounce} position="top-right" autoClose={2200} />

      {/* Toolbar */}
      <div className="bg-white border-b px-5 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <DatePicker
            selected={selectedMonth}
            onChange={setSelectedMonth}
            dateFormat="MMM yyyy"
            showMonthYearPicker
            className="border border-gray-300 rounded px-3 py-2 text-sm w-32 cursor-pointer font-medium"
          />

          <div className="text-lg font-semibold text-gray-800">
            Total Expense: <span className="text-blue-700">₹{totalExpense.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            placeholder="Search expenses..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            onClick={() => openModal('add')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded shadow hover:bg-blue-700"
          >
            <i className="ri-add-line"></i> Add Expense
          </button>

          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded shadow hover:bg-emerald-700"
          >
            <i className="ri-download-2-line"></i> Export
          </button>

          <button
            onClick={handleDelete}
            disabled={!selectedIds.length}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded shadow ${
              selectedIds.length
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <i className="ri-delete-bin-line"></i>
            Delete {selectedIds.length ? `(${selectedIds.length})` : ''}
          </button>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 overflow-hidden px-5 pb-5 flex flex-col">
        <div className="flex-1 overflow-auto border border-gray-200 rounded bg-white shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center h-full text-gray-500">Loading expenses...</div>
          ) : (
            <ExpenseTable
              rows={paginated}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              onEdit={row => openModal('edit', row)}
            />
          )}
        </div>

        {/* Pagination */}
        {!loading && totalRows > 0 && (
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <div>
              Showing <strong>{(page - 1) * pageSize + 1}</strong>–
              <strong>{Math.min(page * pageSize, totalRows)}</strong> of <strong>{totalRows}</strong>
            </div>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
              >
                Prev
              </button>
              <span className="px-4 py-2 font-medium">{page} / {totalPages}</span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <ExpenseFormModal
          mode={modalOpen}
          corporateId={corporateId}
          expense={selectedExpense}
          onClose={() => {
            setModalOpen(null);
            setSelectedExpense(null);
          }}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}