// src/components/dashboard/invoices/InvoiceCreateEditModal.jsx

'use client'

import { useState, useEffect } from 'react';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import { xFetch } from '@/utility/xFetch';
import { 
  RiAddLine, RiDeleteBinLine, RiPencilLine, RiCloseLine, RiCheckLine, 
  RiRefreshLine 
} from 'react-icons/ri';

export default function InvoiceCreateEditModal({
  open = false,
  invoice = null,           // null = create new, object = edit
  corporateId,
  onClose,
  onSuccess,
}) {
  const isEdit = !!invoice;

  // ─── All hooks must be called unconditionally ────────────────────────
  const [form, setForm] = useState({
    invoiceNo: '',
    client: { name: '', email: '', mobile: '', add: '' },
    items: [],
    discount: 0,
    discountUnit: 'R',
    gstPercentage: 0,
    paid: 0,
    desc: '',
  });

  const [loading, setLoading] = useState(false);

  // Item sub-modal states
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState(-1);
  const [itemForm, setItemForm] = useState({ desc: '', qty: 1, rate: 0 });

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Populate form when modal opens (create or edit)
  useEffect(() => {
    if (!open) return;

    if (isEdit) {
      // Edit mode
      setForm({
        invoiceNo: invoice.invoiceNo || '',
        client: invoice.client ? { ...invoice.client } : { name: '', email: '', mobile: '', add: '' },
        items: invoice.items?.map(it => ({ ...it })) || [],
        discount: invoice.discount || 0,
        discountUnit: invoice.discountUnit || 'R',
        gstPercentage: invoice.gstPercentage || 0,
        paid: invoice.paid || 0,
        desc: invoice.desc || '',
      });
    } else {
      // Create mode → fetch next invoice number
      setLoading(true);
      xFetch({
        path: `/services/invoice/getNextInvoiceNo?corporateId=${corporateId}`,
      })
        .then((nextNo) => {
          setForm(prev => ({
            ...prev,
            invoiceNo: nextNo || 'NEW-INVOICE',
          }));
          setLoading(false);
        })
        .catch(() => {
          toast.error("Failed to fetch next invoice number");
          setLoading(false);
        });
    }
  }, [open, isEdit, invoice, corporateId]);

  // ────────────────────────────────────────────────
  // Calculations
  // ────────────────────────────────────────────────
  const subTotal = form.items.reduce((sum, item) => {
    return sum + (Number(item.qty || 0) * Number(item.rate || 0));
  }, 0);

  const discountAmount = form.discountUnit === 'P'
    ? subTotal * (form.discount / 100)
    : Number(form.discount);

  const gstAmount = subTotal * (form.gstPercentage / 100);

  const total = subTotal - discountAmount + gstAmount;
  const balance = total - Number(form.paid || 0);

  // ────────────────────────────────────────────────
  // Item handlers
  // ────────────────────────────────────────────────
  const openAddItem = () => {
    setItemForm({ desc: '', qty: 1, rate: 0 });
    setEditingItemIndex(-1);
    setItemModalOpen(true);
  };

  const openEditItem = (index) => {
    setItemForm({ ...form.items[index] });
    setEditingItemIndex(index);
    setItemModalOpen(true);
  };

  const saveItem = () => {
    if (!itemForm.desc.trim()) return toast.warn("Description is required");
    if (itemForm.qty < 1) return toast.warn("Quantity must be at least 1");
    if (itemForm.rate <= 0) return toast.warn("Rate must be greater than 0");

    const amount = Number(itemForm.qty) * Number(itemForm.rate);
    let updated = [...form.items];

    if (editingItemIndex >= 0) {
      updated[editingItemIndex] = { ...itemForm, amount };
    } else {
      updated.push({ ...itemForm, amount });
    }

    setForm(prev => ({ ...prev, items: updated }));
    setItemModalOpen(false);
  };

  const removeItem = (index) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  // ────────────────────────────────────────────────
  // Save handler
  // ────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.client.name.trim()) return toast.warn("Client name is required");
    if (form.items.length === 0) return toast.warn("Add at least one item");

    setLoading(true);

    // Build FormData with invoice parameter as nested form fields
    // This matches PHP's expected format: invoice[corporateId], invoice[client][name], etc.
    const formData = new FormData();
    formData.append('invoice[corporateId]', corporateId);
    formData.append('invoice[invoiceNo]', form.invoiceNo);
    formData.append('invoice[subTotal]', Number(subTotal));
    formData.append('invoice[total]', Number(total));
    formData.append('invoice[discount]', Number(form.discount));
    formData.append('invoice[discountUnit]', form.discountUnit);
    formData.append('invoice[gstPercentage]', Number(form.gstPercentage));
    formData.append('invoice[paid]', Number(form.paid));
    formData.append('invoice[desc]', form.desc || '');

    // Client data
    formData.append('invoice[client][name]', form.client.name);
    formData.append('invoice[client][email]', form.client.email || '');
    formData.append('invoice[client][mobile]', form.client.mobile || '');
    formData.append('invoice[client][add]', form.client.add || '');

    // Items data
    form.items.forEach((item, index) => {
      formData.append(`invoice[items][${index}][desc]`, item.desc);
      formData.append(`invoice[items][${index}][qty]`, Number(item.qty));
      formData.append(`invoice[items][${index}][rate]`, Number(item.rate));
    });

    // Add clientId for edit mode
    if (isEdit && invoice?.id) {
      formData.append('invoice[id]', invoice.id);
      formData.append('invoice[clientId]', invoice.clientId);
    }

    const path = isEdit
      ? '/services/invoice/updateInvoice'
      : '/services/invoice/saveInvoice';

    try {
      const res = await xFetch({
        method: 'POST',
        path,
        payload: formData,
        isFormData: true,
      });

      if (res?.status) {
        toast.success(isEdit ? "Invoice updated successfully" : "Invoice created successfully");
        onClose();
      } else {
        toast.error(res?.message || "Failed to save invoice");
      }
    } catch (err) {
      console.error('Save error:', err);
      toast.error("Server error while saving invoice");
    } finally {
      setLoading(false);
    }
  };

  // ────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Main Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-slate-800">
              {isEdit ? `Edit Invoice #${form.invoiceNo}` : 'Create New Invoice'}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-800 transition-colors"
              disabled={loading}
            >
              <RiCloseLine size={28} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="p-6 overflow-y-auto flex-1">
            {/* Invoice No (read-only) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Invoice Number
              </label>
              <div className="px-4 py-2.5 bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-medium">
                {form.invoiceNo || 'Loading...'}
              </div>
            </div>

            {/* Client Info */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Client Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.client.name}
                  onChange={e => setForm(p => ({ ...p, client: { ...p.client, name: e.target.value } }))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter client name"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={form.client.email}
                  onChange={e => setForm(p => ({ ...p, client: { ...p.client, email: e.target.value } }))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="client@example.com"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Mobile
                </label>
                <input
                  type="tel"
                  value={form.client.mobile}
                  onChange={e => setForm(p => ({ ...p, client: { ...p.client, mobile: e.target.value } }))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="9876543210"
                  disabled={loading}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Billing Address
                </label>
                <textarea
                  value={form.client.add}
                  onChange={e => setForm(p => ({ ...p, client: { ...p.client, add: e.target.value } }))}
                  rows={2}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Street, City, State, PIN..."
                  disabled={loading}
                />
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-slate-800">Items</h3>
                <button
                  type="button"
                  onClick={openAddItem}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  <RiAddLine size={18} />
                  Add Item
                </button>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100">
                    <tr className="border-b border-slate-200">
                      <th className="p-3 text-left font-medium">Description</th>
                      <th className="p-3 text-center w-20 font-medium">Qty</th>
                      <th className="p-3 text-right w-28 font-medium">Rate</th>
                      <th className="p-3 text-right w-32 font-medium">Amount</th>
                      <th className="p-3 text-center w-20 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {form.items.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500 italic">
                          No items added yet
                        </td>
                      </tr>
                    ) : (
                      form.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-3">{item.desc}</td>
                          <td className="p-3 text-center">{item.qty}</td>
                          <td className="p-3 text-right">{formatCurrency(item.rate)}</td>
                          <td className="p-3 text-right font-medium">{formatCurrency(item.amount)}</td>
                          <td className="p-3 flex justify-center gap-4">
                            <button
                              onClick={() => openEditItem(idx)}
                              disabled={loading}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="Edit item"
                            >
                              <RiPencilLine size={18} />
                            </button>
                            <button
                              onClick={() => removeItem(idx)}
                              disabled={loading}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title="Remove item"
                            >
                              <RiDeleteBinLine size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-slate-600">Subtotal</div>
                  <div className="font-medium">{formatCurrency(subTotal)}</div>
                </div>
                <div>
                  <div className="text-slate-600">Discount</div>
                  <div className="font-medium text-amber-700">
                    - {form.discountUnit === 'P' ? `${form.discount}%` : formatCurrency(form.discount)}
                  </div>
                </div>
                <div>
                  <div className="text-slate-600">GST ({form.gstPercentage}%)</div>
                  <div className="font-medium text-green-700">+ {formatCurrency(gstAmount)}</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-600 font-medium">Total</div>
                  <div className="text-xl font-bold text-indigo-700">{formatCurrency(total)}</div>
                </div>
              </div>
            </div>

            {/* Paid, Balance, GST */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Paid Amount
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.paid}
                  onChange={e => setForm(p => ({ ...p, paid: Number(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Balance Due
                </label>
                <div className={`px-4 py-2.5 border rounded-lg font-medium text-lg text-right ${
                  balance > 0 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'
                }`}>
                  {formatCurrency(balance)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  GST Rate
                </label>
                <select
                  value={form.gstPercentage}
                  onChange={e => setForm(p => ({ ...p, gstPercentage: Number(e.target.value) }))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  disabled={loading}
                >
                  <option value={0}>0%</option>
                  <option value={5}>5%</option>
                  <option value={12}>12%</option>
                  <option value={18}>18%</option>
                  <option value={28}>28%</option>
                </select>
              </div>
            </div>

            {/* Discount & Note */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Discount
                </label>
                <div className="flex rounded-lg overflow-hidden border border-slate-300">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.discount}
                    onChange={e => setForm(p => ({ ...p, discount: Number(e.target.value) || 0 }))}
                    className="flex-1 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={loading}
                  />
                  <select
                    value={form.discountUnit}
                    onChange={e => setForm(p => ({ ...p, discountUnit: e.target.value }))}
                    className="px-4 py-2 bg-slate-50 border-l border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={loading}
                  >
                    <option value="R">₹</option>
                    <option value="P">%</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Notes / Terms
                </label>
                <textarea
                  value={form.desc}
                  onChange={e => setForm(p => ({ ...p, desc: e.target.value }))}
                  rows={2}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Payment terms, due date, thank you note..."
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-4">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-700 font-medium disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <>
                  <RiRefreshLine className="animate-spin" size={18} />
                  Saving...
                </>
              ) : (
                <>
                  <RiCheckLine size={18} />
                  {isEdit ? 'Update Invoice' : 'Create Invoice'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Item Add/Edit Sub-Modal */}
      {itemModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800">
                {editingItemIndex >= 0 ? 'Edit Item' : 'Add Item'}
              </h3>
              <button
                onClick={() => setItemModalOpen(false)}
                className="text-slate-500 hover:text-slate-800"
              >
                <RiCloseLine size={24} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={itemForm.desc}
                  onChange={e => setItemForm(p => ({ ...p, desc: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Item name or service description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={itemForm.qty}
                    onChange={e => setItemForm(p => ({ ...p, qty: Number(e.target.value) || 1 }))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Rate (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={itemForm.rate}
                    onChange={e => setItemForm(p => ({ ...p, rate: Number(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setItemModalOpen(false)}
                className="px-5 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-700 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={saveItem}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
              >
                <RiCheckLine size={18} />
                {editingItemIndex >= 0 ? 'Update Item' : 'Add Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Helper function
function formatCurrency(value) {
  if (value == null || isNaN(value)) return '—';
  return '₹' + Number(value).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}