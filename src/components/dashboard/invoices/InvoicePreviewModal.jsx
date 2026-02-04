// src/components/dashboard/invoices/InvoicePreviewModal.jsx

'use client'

import { RiCloseLine } from 'react-icons/ri';

export default function InvoicePreviewModal({
  open = false,
  invoice = null,
  onClose,
}) {
  if (!open || !invoice) return null;

  const formatCurrency = (value) => {
    if (value == null || isNaN(value)) return '—';
    return '₹' + Number(value).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const subTotal = invoice.items?.reduce((sum, item) => {
    return sum + (Number(item.qty || 0) * Number(item.rate || 0));
  }, 0) || 0;

  const discountAmount = invoice.discountUnit === 'P'
    ? subTotal * (invoice.discount / 100)
    : Number(invoice.discount || 0);

  const gstAmount = subTotal * (invoice.gstPercentage / 100);

  const total = subTotal - discountAmount + gstAmount;
  const balance = total - Number(invoice.paid || 0);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-slate-800">
              Invoice Preview #{invoice.invoiceNo || '—'}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-800 transition-colors"
            >
              <RiCloseLine size={28} />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {/* Company / Invoice Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-slate-800 mb-2">From</h3>
                <div className="text-sm text-slate-600">
                  {/* Add your company name, address, PAN etc. here if available */}
                  <p className="font-medium">Your Company Name</p>
                  <p>Address line 1, City, State - PIN</p>
                  <p>GSTIN: 22ABCDE1234F1Z5</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm text-slate-500">Invoice Date</p>
                <p className="font-medium">{invoice.createdDate || invoice.date || '—'}</p>

                {invoice.dueDate && (
                  <>
                    <p className="text-sm text-slate-500 mt-2">Due Date</p>
                    <p className="font-medium">{invoice.dueDate}</p>
                  </>
                )}
              </div>
            </div>

            {/* Bill To */}
            <div>
              <h3 className="text-lg font-medium text-slate-800 mb-2">Bill To</h3>
              <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="font-medium">{invoice.client?.name || '—'}</p>
                {invoice.client?.add && <p>{invoice.client.add}</p>}
                {invoice.client?.email && <p>Email: {invoice.client.email}</p>}
                {invoice.client?.mobile && <p>Mobile: {invoice.client.mobile}</p>}
              </div>
            </div>

            {/* Items Table */}
            <div>
              <h3 className="text-lg font-medium text-slate-800 mb-2">Items</h3>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100">
                    <tr className="border-b border-slate-200">
                      <th className="p-3 text-left font-medium">Description</th>
                      <th className="p-3 text-center font-medium w-20">Qty</th>
                      <th className="p-3 text-right font-medium w-28">Rate</th>
                      <th className="p-3 text-right font-medium w-32">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoice.items?.length > 0 ? (
                      invoice.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-3">{item.desc || '—'}</td>
                          <td className="p-3 text-center">{item.qty || 1}</td>
                          <td className="p-3 text-right">{formatCurrency(item.rate)}</td>
                          <td className="p-3 text-right font-medium">
                            {formatCurrency(item.amount || (item.qty * item.rate))}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-slate-500">
                          No items in this invoice
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="bg-slate-50 p-5 rounded-lg border border-slate-200">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm">
                <div>
                  <p className="text-slate-600">Subtotal</p>
                  <p className="font-medium text-lg">{formatCurrency(subTotal)}</p>
                </div>

                <div>
                  <p className="text-slate-600">Discount</p>
                  <p className="font-medium text-amber-700 text-lg">
                    - {invoice.discountUnit === 'P'
                      ? `${invoice.discount || 0}%`
                      : formatCurrency(invoice.discount || 0)}
                  </p>
                </div>

                <div>
                  <p className="text-slate-600">GST ({invoice.gstPercentage || 0}%)</p>
                  <p className="font-medium text-green-700 text-lg">+ {formatCurrency(gstAmount)}</p>
                </div>

                <div className="text-right">
                  <p className="text-slate-600 font-medium">Grand Total</p>
                  <p className="text-2xl font-bold text-indigo-700">{formatCurrency(total)}</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 grid grid-cols-2 gap-6">
                <div>
                  <p className="text-slate-600">Amount Paid</p>
                  <p className="font-medium text-lg">{formatCurrency(invoice.paid || 0)}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-600 font-medium">Balance Due</p>
                  <p className={`text-2xl font-bold ${balance > 0 ? 'text-red-700' : 'text-green-700'}`}>
                    {formatCurrency(balance)}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.desc && (
              <div>
                <h3 className="text-lg font-medium text-slate-800 mb-2">Notes</h3>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-700 whitespace-pre-wrap">
                  {invoice.desc}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}