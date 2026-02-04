'use client'

import { RiEyeLine, RiEdit2Line, RiDeleteBinLine, RiDownload2Line, RiRefreshLine, RiMailLine } from 'react-icons/ri';

export default function InvoicesTable({
  rows = [],
  loading = false,
  onView,
  onEdit,
  onDelete,
  onDownload,
  onEmail,
  sendingEmailId
}) {
  const formatCurrency = (amount) => {
    if (amount == null || isNaN(amount)) return '—';
    return '₹' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  };

  const getStatusBadge = (paid = 0, total = 0) => {
    const isPaid = Number(paid) >= Number(total);
    return (
      <span
        className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
          isPaid ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
        }`}
      >
        {isPaid ? 'Paid' : 'Pending'}
      </span>
    );
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading invoices...</div>;
  }

  if (rows.length === 0) {
    return <div className="p-8 text-center text-slate-500">No invoices found</div>;
  }

  return (
    <table className="w-full text-sm border-collapse">
      <thead className="bg-slate-100 sticky top-0 z-10">
        <tr className="border-b border-slate-200">
          <th className="p-3 text-left font-medium">Invoice #</th>
          <th className="p-3 text-left font-medium">Client</th>
          <th className="p-3 text-left font-medium">Date</th>
          <th className="p-3 text-right font-medium">Total</th>
          <th className="p-3 text-right font-medium">Paid</th>
          <th className="p-3 text-right font-medium">Balance</th>
          <th className="p-3 text-center font-medium">Status</th>
          <th className="p-3 text-center font-medium">Items</th>
          <th className="p-3 text-left font-medium">Description</th>
          <th className="p-3 text-center font-medium">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map((inv) => {
          const balance = (inv.total || 0) - (inv.paid || 0);

          return (
            <tr key={inv.id || inv.invoiceNo} className="hover:bg-slate-50 transition-colors">
              <td className="p-3 font-medium text-indigo-700">#{inv.invoiceNo}</td>
              <td className="p-3">
                <div className="font-medium">{inv.client?.name || '—'}</div>
                <div className="text-xs text-slate-500">{inv.client?.email || '—'}</div>
              </td>
              <td className="p-3 text-slate-600">{inv.createdDate || inv.date || '—'}</td>
              <td className="p-3 text-right">{formatCurrency(inv.total)}</td>
              <td className="p-3 text-right">{formatCurrency(inv.paid)}</td>
              <td className="p-3 text-right font-medium">{formatCurrency(balance)}</td>
              <td className="p-3 text-center">{getStatusBadge(inv.paid, inv.total)}</td>
              <td className="p-3 text-center">{inv.items?.length || 0}</td>
              <td className="p-3 text-slate-600 max-w-xs truncate">{inv.desc || '—'}</td>
              <td className="p-3">
                <div className="flex items-center justify-center gap-3 text-base">
                  <button
                    title="View Invoice"
                    onClick={() => onView?.(inv)}
                    className="text-slate-600 hover:text-indigo-600 transition-colors"
                  >
                    <RiEyeLine size={18} />
                  </button>

                  <button
                    title="Edit Invoice"
                    onClick={() => onEdit?.(inv)}           // ← This calls openEditModal(inv) in controller
                    className="text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    <RiEdit2Line size={18} />
                  </button>

                  <button
                    title="Download PDF"
                    onClick={() => onDownload?.(inv)}
                    className="text-slate-600 hover:text-green-600 transition-colors"
                  >
                    <RiDownload2Line size={18} />
                  </button>

                  <button
                      title="Send Email"
                      onClick={() => onEmail?.(inv)}
                      disabled={sendingEmailId === inv.id || sendingEmailId === inv.invoiceNo}
                      className={`text-slate-600 transition-colors ${
                        sendingEmailId === inv.id || sendingEmailId === inv.invoiceNo
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:text-purple-600'
                      }`}
                    >
                      {sendingEmailId === inv.id || sendingEmailId === inv.invoiceNo ? (
                        <RiRefreshLine className="animate-spin" size={18} />
                      ) : (
                        <RiMailLine size={18} />
                      )}
                    </button>

                  <button
                    title="Delete Invoice"
                    onClick={() => onDelete?.(inv.id)}
                    className="text-slate-600 hover:text-red-600 transition-colors"
                  >
                    <RiDeleteBinLine size={18} />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}