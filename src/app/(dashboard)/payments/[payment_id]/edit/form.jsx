'use client';

export default function JoineePaymentForm({ payment_id }) {
    return (
        <div className="max-w-[1400px] mx-auto p-6 flex justify-evenly items-start align-top gap-5">

            {/* ================= LEFT CARD ================= */}
            <div className="bg-white border border-gray-200 rounded-[10px] p-5 flex-1">

                <h3 className="text-sm font-semibold mb-3">
                    Candidate & Payment Details
                </h3>

                <div className="grid grid-cols-2 gap-4">

                    <Field label="Candidate Name" value="Avani Sharma" readOnly />
                    <Field label="Email" value="avani@email.com" readOnly />
                    <Field label="Mobile" value="9876543210" readOnly />
                    <Field label="Lead ID" value="LEAD-10291" readOnly />

                    <Field label="Course / Program" value="Full Stack Program" />
                    <Field label="Batch / Intake" value="Jan 2024" />
                    <Field label="Sales Owner" value="Rahul Verma" readOnly />

                    <SelectField label="Currency" options={["INR", "USD"]} />

                    <div>
                        <Field label="Total Agreed Amount" value="27000" readOnly />
                        <span className="block mt-1 text-xs text-gray-500">
                            Auto-calculated from standard fee & discount
                        </span>
                    </div>

                    <Field label="Discount (if any)" value="2000" />
                    <Field label="Final Payable Amount" value="25000" readOnly />

                    <SelectField label="Payment Mode" options={["Installments", "One Time"]} />
                    <SelectField label="Payment Status" options={["Active", "Paid", "Cancelled"]} />
                    <SelectField
                        label="Payment Type"
                        options={["Online", "UPI", "Cash", "Bank Transfer"]}
                    />

                    <Field label="Invoice Number" value="INV-2024-118" />
                    <Field label="Invoice Date" type="date" value="2024-01-10" />

                    {/* Remarks */}
                    <div className="col-span-2">
                        <label className="block text-xs text-gray-500 mb-1">
                            Remarks / Notes
                        </label>
                        <input
                            className="w-full px-[10px] py-2 text-[13px] border border-gray-300 rounded-md"
                            placeholder="Any special notes from finance or sales"
                        />
                    </div>

                    {/* Profile Picture */}
                    <div className="col-span-2 mt-4">
                        <h4 className="text-sm font-semibold mb-3">
                            Profile Picture
                        </h4>

                        <div className="flex items-center gap-5 p-4 border rounded-lg bg-gray-50">
                            {/* Avatar */}
                            <div className="relative">
                                <img
                                    src="https://via.placeholder.com/120"
                                    alt="Profile"
                                    onError={(e) => {
                                        e.currentTarget.src = "https://dummyimage.com/120x120/e5e7eb/6b7280&text=Cn";
                                    }}
                                    className="w-24 h-24 rounded-full object-cover border-2 border-white ring-2 ring-gray-200"
                                />

                                {/* Overlay badge */}
                                <span className="absolute bottom-0 right-0 bg-white border rounded-full p-1 shadow">
                                    📷
                                </span>
                            </div>

                            {/* Upload area */}
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Upload new photo
                                </label>

                                <input
                                    type="file"
                                    accept="image/*"
                                    className="block w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                                />

                                <p className="mt-2 text-xs text-gray-500">
                                    JPG or PNG • Max size 2MB • Square images work best
                                </p>
                            </div>
                        </div>
                    </div>


                </div>
            </div>

            {/* ================= RIGHT CARD ================= */}
            <div className="bg-white border border-gray-200 rounded-[10px] p-5 flex-1">

                <h3 className="text-sm font-semibold mb-4">
                    Payment Calculation
                </h3>

                <div className="grid grid-cols-2 gap-4">

                    <SelectField
                        label="Currency"
                        options={["Rupees (INR ₹)"]}
                    />

                    <InputGroup
                        label="Standard Fee"
                        prefix="₹"
                        value="41300"
                        readOnly
                        helper="System defined course fee"
                    />

                    <InputGroup
                        label="Discount"
                        prefix="₹"
                        type="number"
                        value="6300"
                    />

                    <InputGroup
                        label="GST Rate (%)"
                        prefix="%"
                        type="number"
                        value="0"
                    />

                    <InputGroup
                        label={
                            <>
                                Total Agreed Payment <span className="text-red-500">*</span>
                            </>
                        }
                        prefix="₹"
                        value="35000"
                        readOnly
                        helper="Auto calculated from Standard Fee, Discount & GST"
                    />
                </div>

                {/* Installments */}
                <h4 className="text-sm font-semibold mt-6 mb-2">
                    Installments
                </h4>

                <table className="w-full text-[13px] border-collapse">
                    <thead className="bg-slate-50">
                        <tr>
                            {["#", "Amount", "Due Date", "Status"].map(h => (
                                <th
                                    key={h}
                                    className="text-left px-2 py-2 border-b text-xs font-semibold text-gray-700"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="bg-emerald-50">
                            <td className="px-2 py-2 border-b">1</td>
                            <td className="px-2 py-2 border-b">
                                <input
                                    value="10000"
                                    readOnly
                                    className="bg-transparent border-none text-emerald-700 font-semibold"
                                />
                            </td>
                            <td className="px-2 py-2 border-b">
                                <input
                                    type="date"
                                    readOnly
                                    value="2024-01-15"
                                    className="bg-transparent border-none text-emerald-700 font-semibold"
                                />
                            </td>
                            <td className="px-2 py-2 border-b text-green-600 font-semibold">
                                Paid
                            </td>
                        </tr>

                        <tr>
                            <td className="px-2 py-2 border-b">2</td>
                            <td className="px-2 py-2 border-b">
                                <input className="w-full px-2 py-1 border rounded-md" value="5000" />
                            </td>
                            <td className="px-2 py-2 border-b">
                                <input
                                    type="date"
                                    className="w-full px-2 py-1 border rounded-md"
                                    value="2024-02-15"
                                />
                            </td>
                            <td className="px-2 py-2 border-b text-yellow-600 font-semibold">
                                Pending
                            </td>
                        </tr>
                    </tbody>
                </table>

                <button className="mt-3 px-3 py-2 text-[13px] bg-blue-600 text-white rounded-md hover:bg-blue-800">
                    ➕ Add Installment
                </button>

            </div>
        </div>
    );
}

/* ================= Reusable fields ================= */

function Field({ label, value, readOnly, type = "text" }) {
    return (
        <div>
            <label className="block text-xs text-gray-500 mb-1">{label}</label>
            <input
                type={type}
                value={value}
                readOnly={readOnly}
                className={`w-full px-[10px] py-2 text-[13px] border border-gray-300 rounded-md
          ${readOnly ? "bg-gray-50" : ""}`}
            />
        </div>
    );
}

function SelectField({ label, options }) {
    return (
        <div>
            <label className="block text-xs text-gray-500 mb-1">{label}</label>
            <select className="w-full px-[10px] py-2 text-[13px] border border-gray-300 rounded-md select-wrapper">
                {options.map(o => (
                    <option key={o}>{o}</option>
                ))}
            </select>
        </div>
    );
}

function InputGroup({ label, prefix, value, type = "text", readOnly, helper }) {
    return (
        <div>
            <label className="block text-xs text-gray-500 mb-1">{label}</label>

            <div className="relative">
                <span className="absolute left-0 top-0 bottom-0 w-11 flex items-center justify-center bg-gray-100 border border-gray-300 border-r-0 rounded-l-md font-semibold text-gray-700">
                    {prefix}
                </span>

                <input
                    type={type}
                    value={value}
                    readOnly={readOnly}
                    className="w-full pl-[52px] pr-3 py-2 text-sm border border-gray-300 rounded-md
                     bg-gray-50 text-gray-900"
                />
            </div>

            {helper && (
                <span className="block mt-1 text-xs text-gray-500 leading-snug">
                    {helper}
                </span>
            )}
        </div>
    );
}
