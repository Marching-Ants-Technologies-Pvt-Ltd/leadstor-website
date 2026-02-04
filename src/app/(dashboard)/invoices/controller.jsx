'use client'

import { useEffect, useState, useRef } from 'react';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import { xFetch, jsonToQueryParams, xDownload } from '@/utility/xFetch';
import { Corporate } from '@/utility/TinyDB';
import { RiAddLine, RiSearchLine, RiRefreshLine } from 'react-icons/ri';

import InvoicesTable from './table';
import ConfirmDelete from '@/components/elements/ConfirmDelete';
import InvoiceCreateEditModal from '@/components/dashboard/invoices/InvoiceCreateEditModal';
import InvoicePreviewModal from '@/components/dashboard/invoices/InvoicePreviewModal';

export default function InvoicesSectionController() {
  const corporateId = Corporate?._id;

  const [invoices, setInvoices] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null); // null = create new, object = edit

  // Delete confirmation
  const [toDelete, setToDelete] = useState(null);

  const searchTimeoutRef = useRef(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewInvoice, setPreviewInvoice] = useState(null);
    const [sendingEmailId, setSendingEmailId] = useState(null);
    
  const [query, setQuery] = useState({
    corporateId: corporateId || '',
    search: '',
    offset: 0,
    limit: 20,
  });

  // ────────────────────────────────────────────────
  // Fetch invoices
  // ────────────────────────────────────────────────
  useEffect(() => {
    if (!corporateId) return;

    setLoading(true);

    xFetch({
      path: '/services/invoice/getInvoices',
      payload: query,
    })
      .then((data) => {
        setInvoices(data?.rows || data || []);
        setTotal(data?.total || data?.length || 0);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load invoices:', err);
        toast.error("Couldn't load invoices");
        setLoading(false);
      });
  }, [query, corporateId]);

    const handleView = (inv) => {
        setPreviewInvoice(inv);
        setPreviewOpen(true);
    };

  // ────────────────────────────────────────────────
  // Search with debounce
  // ────────────────────────────────────────────────
  const handleSearch = (e) => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(() => {
      setQuery((prev) => ({
        ...prev,
        search: e.target.value.trim(),
        offset: 0,
      }));
    }, 400);
  };

  // ────────────────────────────────────────────────
  // Pagination helpers
  // ────────────────────────────────────────────────
  const totalPages = Math.ceil(total / query.limit);
  const currentPage = Math.floor(query.offset / query.limit);

  const getPages = () => {
    const pages = [];
    const delta = 1;
    const rangeStart = Math.max(0, currentPage - delta);
    const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

    if (rangeStart > 0) {
      pages.push(0);
      if (rangeStart > 1) pages.push("...");
    }
    for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);
    if (rangeEnd < totalPages - 1) {
      if (rangeEnd < totalPages - 2) pages.push("...");
      pages.push(totalPages - 1);
    }
    return pages;
  };

  const changePage = (pageIndex) => {
    if (pageIndex < 0 || pageIndex >= totalPages) return;
    setQuery((prev) => ({ ...prev, offset: pageIndex * prev.limit }));
  };

  const changeLimit = (newLimit) => {
    setQuery((prev) => ({ ...prev, limit: newLimit, offset: 0 }));
  };

  const refresh = () => {
    setQuery((prev) => ({ ...prev, offset: 0 }));
  };

  // ────────────────────────────────────────────────
  // Modal & Action Handlers
  // ────────────────────────────────────────────────
  const openCreateModal = () => {
    setEditingInvoice(null);
    setModalOpen(true);
  };

  const openEditModal = (inv) => {
    setEditingInvoice(inv);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    setToDelete(id);
  };

  const confirmDelete = () => {
    xFetch({
      method: 'POST',
      path: '/services/invoice/deleteInvoice',
      payload: { invoiceId: toDelete },
    })
      .then((res) => {
        if (res?.status) {
          toast.success("Invoice deleted successfully");
          refresh();
        } else {
          toast.error("Failed to delete invoice");
        }
      })
      .catch(() => toast.error("Server error while deleting"));
    setToDelete(null);
  };

  const handleDownload = async (inv) => {
    try {
      toast.info(`Preparing invoice #${inv.invoiceNo} for download...`);

      const htmlContent = generateInvoiceHTML(inv);

      const response = await xFetch({
        method: 'POST',
        path: '/services/invoice/downloadInvoice',
        payload: {
          invoice: inv,
          content: htmlContent,
          email: 'no',
        },
        responseType: 'blob',   // ← key part (if xFetch supports it)
      });

      if (!(response instanceof Blob)) {
        throw new Error('Expected binary response, got something else');
      }

      // Create download link
      const url = window.URL.createObjectURL(response);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice_${inv.invoiceNo || 'download'}.pdf`; // filename
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Invoice #${inv.invoiceNo} downloaded`);
    } catch (err) {
      console.error('Download failed:', err);
      toast.error('Failed to download invoice. Please try again.');
    }
  };

  const handleSendEmail = async (inv) => {
    if (!inv.client?.email) {
      toast.warn("No client email found");
      return;
    }

    if (!confirm(`Send invoice #${inv.invoiceNo} to ${inv.client.email}?`)) return;

    setSendingEmailId(inv.id || inv.invoiceNo);

    const htmlContent = generateInvoiceHTML(inv);

    try {
      const res = await xFetch({
        method: 'POST',
        path: '/services/invoice/downloadInvoice',
        payload: {
          invoice: inv,
          content: htmlContent,
          email: 'yes',
        },
      });

      if (res == 'success') {
        toast.success(`Invoice sent to ${inv.client.email}`);
      } else {
        toast.error("Failed to send email");
      }
    } catch (err) {
      toast.error("Server error while sending");
    } finally {
      setSendingEmailId(null);
    }
  };

  const generateInvoiceHTML = (inv) => {
    const subTotal = inv.items?.reduce((sum, item) => sum + (item.qty * item.rate), 0) || 0;
    const discountAmt = inv.discountUnit === 'P' ? subTotal * (inv.discount / 100) : inv.discount;
    const gstAmt = subTotal * (inv.gstPercentage / 100);
    const total = subTotal - discountAmt + gstAmt;
    const balance = total - (inv.paid || 0);

    return `
      <html>
        <body style="font-family: monospace;">
          <h2>Invoice #${inv.invoiceNo}</h2>
          <p><strong>Bill To:</strong> ${inv.client?.name || ''}</p>
          <p>${inv.client?.add || ''}</p>
          <p><strong>Date:</strong> ${inv.createdDate || ''}</p>

          <table border="1" style="width:100%; border-collapse: collapse;">
            <thead>
              <tr style="background:#428bca; color:white;">
                <th>Description</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${inv.items?.map(item => `
                <tr>
                  <td>${item.desc || ''}</td>
                  <td>${item.qty}</td>
                  <td>${item.rate}</td>
                  <td>${item.amount || (item.qty * item.rate)}</td>
                </tr>
              `).join('') || '<tr><td colspan="4">No items</td></tr>'}
            </tbody>
          </table>

          <p><strong>Subtotal:</strong> ₹${subTotal}</p>
          <p><strong>Discount:</strong> ₹${discountAmt}</p>
          <p><strong>GST (${inv.gstPercentage}%):</strong> ₹${gstAmt}</p>
          <p><strong>Total:</strong> ₹${total}</p>
          <p><strong>Paid:</strong> ₹${inv.paid || 0}</p>
          <p><strong>Balance:</strong> ₹${balance}</p>

          ${inv.desc ? `<p><strong>Notes:</strong> ${inv.desc}</p>` : ''}
        </body>
      </html>
    `;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />

      {/* Delete Confirmation */}
      <ConfirmDelete
        open={!!toDelete}
        title="Delete Invoice?"
        description="This action cannot be undone. The invoice will be permanently removed."
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />

      {/* Create / Edit Modal */}
      <InvoiceCreateEditModal
        open={modalOpen}
        invoice={editingInvoice}
        corporateId={corporateId}
        onClose={() => {
          setModalOpen(false);
          setEditingInvoice(null);
        }}
        onSuccess={() => {
          toast.success(editingInvoice ? "Invoice updated successfully" : "Invoice created successfully");
          refresh();
        }}
      />

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center shrink-0">
        
        <div className="flex items-center gap-3 flex-1">
          <div className="relative max-w-md w-full">
            <input
              type="text"
              placeholder="Search by invoice #, client name, description..."
              onKeyUp={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
            <RiSearchLine
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
          </div>

          <button
            onClick={refresh}
            disabled={loading}
            className="flex gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm font-medium disabled:opacity-50 transition-colors"
          >
            <RiRefreshLine className={loading ? 'animate-spin' : ''} size={18} />
          </button>
        </div>

        {/* RIGHT: Create Invoice */}
        <button
          onClick={openCreateModal}
          className="flex gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <RiAddLine size={18} />
          Create Invoice
        </button>
      </div>


      {/* Scrollable Table Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <InvoicesTable
            rows={invoices}
            loading={loading}
            onView={handleView}
            onEdit={openEditModal}
            onDelete={handleDelete}
            onDownload={handleDownload}
            onEmail={handleSendEmail}
            sendingEmailId={sendingEmailId}
          />
        </div>
      </div>

      {/* Pagination Footer */}
      {total > 0 && (
        <div className="bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center text-sm shrink-0">
          <div className="text-slate-600">
            Showing {invoices.length > 0 ? query.offset + 1 : 0}–
            {Math.min(query.offset + invoices.length, total)} of {total}
          </div>

          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 border rounded hover:bg-slate-50 disabled:opacity-50 transition-colors"
              disabled={currentPage === 0}
              onClick={() => changePage(currentPage - 1)}
            >
              Prev
            </button>

            {getPages().map((p, idx) =>
              p === "..." ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-slate-400">…</span>
              ) : (
                <button
                  key={p}
                  className={`px-3 py-1.5 border rounded min-w-[36px] text-center transition-colors ${
                    p === currentPage
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'hover:bg-slate-50'
                  }`}
                  onClick={() => changePage(p)}
                >
                  {p + 1}
                </button>
              )
            )}

            <button
              className="px-3 py-1.5 border rounded hover:bg-slate-50 disabled:opacity-50 transition-colors"
              disabled={currentPage === totalPages - 1}
              onClick={() => changePage(currentPage + 1)}
            >
              Next
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-600">Rows per page:</span>
            <select
              value={query.limit}
              onChange={(e) => changeLimit(Number(e.target.value))}
              className="border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      )}
        <InvoicePreviewModal
            open={previewOpen}
            invoice={previewInvoice}
            onClose={() => {
                setPreviewOpen(false);
                setPreviewInvoice(null);
            }}
        />
    </div>
  );
}