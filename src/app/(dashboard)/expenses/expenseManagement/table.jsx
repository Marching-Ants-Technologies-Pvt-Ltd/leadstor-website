// ExpenseTable.jsx
export default function ExpenseTable({
  rows = [],
  selectedIds = [],
  onSelectionChange,
  onEdit,
}) {
  const toggleRow = id => {
    onSelectionChange(
      selectedIds.includes(id)
        ? selectedIds.filter(x => x !== id)
        : [...selectedIds, id]
    );
  };

  const toggleAll = checked => {
    onSelectionChange(checked ? rows.map(r => r.id) : []);
  };

  const allSelected = rows.length > 0 && rows.every(r => selectedIds.includes(r.id));

  const getPaidStatus = status => {
    if (status === "1") return <span className="text-green-700 font-medium">Paid</span>;
    if (status === "2") return <span className="text-red-700 font-medium">Not Paid</span>;
    return '—';
  };

  return (
    <table className="min-w-full text-sm border-collapse">
      <thead className="bg-gray-100 text-gray-700">
        <tr>
          <th className="w-10 p-3 text-center">
            <input type="checkbox" checked={allSelected} onChange={e => toggleAll(e.target.checked)} />
          </th>
          <th className="p-3 text-left font-medium">Expense Head</th>
          <th className="p-3 text-left font-medium">Frequency</th>
          <th className="p-3 text-left font-medium">Expense</th>
          <th className="p-3 text-left font-medium">Towards</th>
          <th className="p-3 text-left font-medium">Amount</th>
          <th className="p-3 text-left font-medium">Variable Amount</th>
          <th className="p-3 text-left font-medium">Date</th>
          <th className="p-3 text-left font-medium">Remarks</th>
          <th className="p-3 text-left font-medium">Paid Status</th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {rows.map(row => (
          <tr key={row.id} className="hover:bg-gray-50">
            <td className="p-3 text-center">
              <input
                type="checkbox"
                checked={selectedIds.includes(row.id)}
                onChange={() => toggleRow(row.id)}
              />
            </td>
            <td className="p-3">
              <div className="flex items-center gap-2">
                <button onClick={() => onEdit(row)} className="text-blue-600 hover:text-blue-800">
                  <i className="ri-pencil-line"></i>
                </button>
                {row.expenseHead}
              </div>
            </td>
            <td className="p-3 text-gray-700">{row.frequency || '—'}</td>
            <td className="p-3 text-gray-700">{row.expenseType || '—'}</td>
            <td className="p-3 text-gray-700">{row.expenseTowards || '—'}</td>
            <td className="p-3 font-medium">₹{Number(row.amount || 0).toFixed(2)}</td>
            <td className="p-3">₹{Number(row.variableAmount || 0).toFixed(2)}</td>
            <td className="p-3 text-gray-600">{row.expenseDate || '—'}</td>
            <td className="p-3 text-gray-600 max-w-xs truncate">{row.remarks || '—'}</td>
            <td className="p-3">{getPaidStatus(row.paidStatus)}</td>
            <td className="p-3" /> {/* extra space if needed */}
          </tr>
        ))}
      </tbody>
    </table>
  );
}