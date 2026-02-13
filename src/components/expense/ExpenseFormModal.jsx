'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';
import { xFetch } from '@/utility/xFetch';


export default function ExpenseFormModal({
  mode,
  corporateId,
  expense,
  onClose,
  onSuccess,
}) {
  const isEdit = mode === 'edit';

    const initialForm = {
        id: isEdit ? (expense?.id || expense?._id || '-1') : '-1',   // ← Add this line
        expenseDate: isEdit ? expense?.expenseDate || '' : new Date().toISOString().split('T')[0],
        expenseHead: isEdit ? expense?.expenseHead || '' : '',
        expenseType: isEdit ? String(expense?.expenseTypeId || expense?.expenseType || '') : '',
        expenseTowards: isEdit ? expense?.expenseTowards || '' : '',
        amount: isEdit ? String(expense?.amount || 0) : '',
        variableAmount: isEdit ? String(expense?.variableAmount || 0) : '',
        remarks: isEdit ? expense?.remarks || '' : '',
        paidStatus: isEdit ? String(expense?.paidStatus || '2') : '2',
        userId: isEdit ? String(expense?.userId || '-1') : '-1',
    };

  const [form, setForm] = useState(initialForm);
  const [expenseHeads, setExpenseHeads] = useState([]);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [expenseTowardsList, setExpenseTowardsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTowards, setShowTowards] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const heads = await xFetch({
          path: '/services/expense/getExpenseHeads',
          payload: { corporateId },
        });
        setExpenseHeads(Array.isArray(heads) ? heads : []);

        const towards = await xFetch({
          path: '/services/expense/getExpenseTowards',
          payload: { corporateId },
        });
        setExpenseTowardsList(Array.isArray(towards) ? towards : []);

        if (isEdit && expense?.expenseHead) {
          loadExpenseTypes(expense.expenseHead);
          if (expense.expenseHead === 'Salaries Expense') {
            setShowTowards(true);
          }
        }
      } catch (err) {
        toast.error('Failed to load master data');
      }
    };

    loadData();
  }, []);

  const loadExpenseTypes = async (head) => {
    if (!head) return;
    try {
      const types = await xFetch({
        path: '/services/expense/getExpenseTypes',
        payload: { corporateId, expenseHead: head },
      });
      setExpenseTypes(Array.isArray(types) ? types : []);
    } catch {
      toast.error('Failed to load expense types');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'expenseHead') {
      setForm((prev) => ({ ...prev, [name]: value, expenseType: '' }));
      loadExpenseTypes(value);

      const selectedHead = expenseHeads.find(h => h.expenseHead === value);
      const isSalary = selectedHead?.expenseHead === 'Salaries Expense';
      setShowTowards(isSalary);

      if (!isSalary) {
        setForm((prev) => ({ ...prev, expenseTowards: '', userId: '' }));
      }
    } else if (name === 'expenseTowards') {
      const selected = expenseTowardsList.find(p => p.name === value);
      setForm((prev) => ({
        ...prev,
        [name]: value,
        userId: selected ? String(selected.userId || '') : '',
      }));

      // Auto-fill amount from salary (if API supports it)
      if (selected?.userId) {
        fetchSalary(selected.userId);
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const fetchSalary = async (userId) => {
    try {
      const data = await xFetch({
        path: '/services/expense/getSalary',
        payload: { userId },
      });
      if (data?.salary) {
        setForm((prev) => ({ ...prev, amount: String(data.salary) }));
      }
    } catch {
      // silent fail or toast
    }
  };

  const handleDateChange = (date) => {
    if (date) {
      setForm((prev) => ({
        ...prev,
        expenseDate: date.toISOString().split('T')[0],
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.expenseDate) return toast.warn('Expense date is required');
    if (!form.expenseHead) return toast.warn('Expense head is required');
    if (!form.expenseType) return toast.warn('Expense type is required');
    if (!form.amount || Number(form.amount) <= 0) return toast.warn('Amount is required and must be > 0');
    if (!form.paidStatus) return toast.warn('Paid status is required');

    setLoading(true);

    try {
      const payload = {
        id: form.id || '-1',
        userId: form.userId || '-1',
        corporateId,
        expenseDate: form.expenseDate,
        expenseHead: form.expenseHead,
        expenseType: form.expenseType,          // this is now the ID
        amount: Number(form.amount),
        variableAmount: form.variableAmount ? Number(form.variableAmount) : 0,
        remarks: (form.remarks || '').trim(),
        paidstatus: Number(form.paidStatus),
        expenseTowards: form.expenseTowards || '',
      };

      // Better: use different endpoints for add vs update
      const endpoint = '/services/expense/addExpense';

      console.log("Sending payload:", payload);

      await xFetch({
        path: endpoint,
        method: 'POST',
        payload,
      });

      toast.success(isEdit ? 'Expense updated' : 'Expense added');
      onSuccess();
      onClose(); // optional: close immediately
    } catch (err) {
      console.error("Save error:", err);
      toast.error(isEdit ? 'Update failed' : 'Add failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {isEdit ? 'Edit Expense' : 'Add New Expense'}
          </h2>
          <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl leading-none">
            ×
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date <span className="text-red-600">*</span>
            </label>
            <DatePicker
              selected={form.expenseDate ? new Date(form.expenseDate) : null}
              onChange={handleDateChange}
              dateFormat="yyyy-MM-dd"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* Head + Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expense Head <span className="text-red-600">*</span>
              </label>
              <select
                name="expenseHead"
                value={form.expenseHead}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              >
                <option value="">Select Head</option>
                {expenseHeads.map((h) => (
                  <option key={h.expenseHead} value={h.expenseHead}>
                    {h.expenseHead} ({h.frequency})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expense Type <span className="text-red-600">*</span>
              </label>
              <select
                name="expenseType"
                value={form.expenseType}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
                disabled={!form.expenseHead}
              >
                <option value="">Select Type</option>
                {expenseTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.expense_type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Towards – only for Salaries */}
          {showTowards && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expense Towards
              </label>
              <select
                name="expenseTowards"
                value={form.expenseTowards}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select Person</option>
                {expenseTowardsList.map((p) => (
                  <option key={p.userId} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Amounts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Variable Amount
              </label>
              <input
                type="number"
                name="variableAmount"
                value={form.variableAmount}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
            <textarea
              name="remarks"
              value={form.remarks}
              onChange={handleChange}
              rows={2}
              maxLength={100}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Optional remarks..."
            />
          </div>

          {/* Paid Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paid Status <span className="text-red-600">*</span>
            </label>
            <select
              name="paidStatus"
              value={form.paidStatus}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="1">Paid</option>
              <option value="2">Not Paid</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2 rounded text-white font-medium flex items-center gap-2 ${
                loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading && <span className="animate-spin">↻</span>}
              {isEdit ? 'Update Expense' : '+ Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}