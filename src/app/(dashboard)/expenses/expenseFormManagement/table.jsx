export default function ExpenseFormFieldTable({
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
    )
  }

  const toggleAll = checked => {
    onSelectionChange(checked ? rows.map(r => r.expenseHeadId) : [])
  }

  const allSelected = rows.length > 0 && rows.every(r => selectedIds.includes(r.expenseHeadId))

  return (
    <table className="min-w-full text-sm border-collapse" id="expenseFormFieldTable">
      <thead className="bg-slate-100 text-gray-700 sticky top-0">
        <tr className="border-b">
          <th className="w-10 p-3 text-center">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={e => toggleAll(e.target.checked)}
            />
          </th>
          <th className="p-3 text-left font-medium">Expense Head</th>
          <th className="p-3 text-left font-medium">Expense Type</th>
          <th className="p-3 text-left font-medium">Frequency</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {rows.map(row => (
          <tr key={row.expenseHeadId} className="hover:bg-slate-50">
            <td className="p-3 text-center">
              <input
                type="checkbox"
                checked={selectedIds.includes(row.expenseHeadId)}
                onChange={() => toggleRow(row.expenseHeadId)}
              />
            </td>
            <td className="p-3 font-medium">
              <div className="flex items-center gap-2">
                <button onClick={() => onEdit(row)} className="text-blue-600 hover:text-blue-800">
                  <i className="ri-pencil-line"></i>
                </button>
                {row.expenseHead || '—'}
              </div>
            </td>
            <td className="p-3">{row.expenseType || '—'}</td>
            <td className="p-3">{row.frequency || '—'}</td>
          </tr>
        ))}

        {rows.length === 0 && (
          <tr>
            <td colSpan={5} className="p-8 text-center text-gray-500">
              No expense form fields found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  )
}