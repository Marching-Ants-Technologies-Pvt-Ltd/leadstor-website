import React, { useState, useEffect, useMemo, useRef, use } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { xFetch } from '@/utility/xFetch';
import { Corporate, User, Test, Owners } from '@/utility/TinyDB';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CustomSelect from "@/components/CustomSelect";
import DateInputPicker from "@/components/DateInputPicker/DateInputPicker";

export default function UpdateLead({ selectedLead, onCancel, onSuccess }) {
	console.log("Selected Lead:", selectedLead);
   	const [columns, setColumns] = useState([]);
    const [columnOrder, setColumnOrder] = useState([]);
	const [loading, setLoading] = useState(false);
	const [fetching, setFetching] = useState(false);
	const [fields, setFields] = useState({});
	const [dynamicFields, setDynamicFields] = useState([]);
	const [showDatePicker, setShowDatePicker] = useState(false);
  	const [followupDate, setFollowupDate] = useState("");
	const [owner, setOwner] = useState([]);
	const [originalFields, setOriginalFields] = useState({ ...selectedLead });

	// Fetch and apply custom column names and order
	const fetchAndSetColumns = async () => {
		try {
			const data = await xFetch({ path: '/services/profile/columns' });
			setColumns(data);
			let _columnOrder = data.map((item) => item.dataField);
			_columnOrder = _columnOrder.filter(item => item !== 'action');
			setColumnOrder(_columnOrder);
			
		} catch (error) {
			setColumns([]);
		}
	};

	// Fetch and apply custom column names and order
	const fetchLeadDropdowns = async () => {
		try {
			const data = await xFetch({ path: '/services/profile/getLeadDropdowns' });
			setDynamicFields(data);
		} catch (error) {
			setColumns([]);
		}
	};

	const getNameById = (options, selectedId, label) => {console.log(selectedId);
		if(selectedId == ""){
			return label;
		}
		return options.find(obj => obj.key === selectedId)?.value || label;
	}

	const renderOwnerSelect = (displayName) => {
		if (!owner || owner.length === 0) return null;

		let options = [];

		if (User?._id === -1) {
			options.push({ key: -1, value: `--Assign ${displayName}--` });
		} else {
			options.push({ key: "", value: `--Assign ${displayName}--`, disabled: true });
			options.push({ key: -1, value: `Assign to Administrator` });
		}

		owner.forEach((u) => {
			options.push({ key: u.key, value: u.value });
		});

		return { options };
	};


	// Check if form has changed
	const isChanged = () => {
		return Object.keys(fields).some(
		(key) => fields[key] !== originalFields[key]
		);
	};

	const convertDateFormat = (dateStr) => {
		let parsedDate = new Date(dateStr);

		if (isNaN(parsedDate)) {
			console.error("Invalid date format");
			return null;
		}

		// Format components (YYYY-MM-DD HH:mm:ss)
		let year = parsedDate.getFullYear();
		let month = String(parsedDate.getMonth() + 1).padStart(2, "0"); // Ensure 2-digit month
		let day = String(parsedDate.getDate()).padStart(2, "0"); // Ensure 2-digit day
		let hours = String(parsedDate.getHours()).padStart(2, "0");
		let minutes = String(parsedDate.getMinutes()).padStart(2, "0");
		let seconds = "00"; // Default seconds

		return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
	}

	async function xLead() {
	
		// compose payload
		let payload = {
			"invitationId": selectedLead.invitationId,
			"testType": Test.type
		}

		// get lead data
		xFetch({
			path: `/services/invite/getEnquiry`,
			payload
		})
		.then(data => {
			console.log("Lead Data:", data);
			setFields(data);
			if (data.status === "Follow Up") {
				setShowDatePicker(true);
			}
		})
		.catch(error => {
			console.error(`An error occurred while fetching leads`, error);
			setFields([]);
		}).finally(() => {
			if (typeof window.onTableRefresh == 'function') window.onTableRefresh();
		})
	}
	
	const handleClose = () => {
		if (onCancel) onCancel();
	};

	const handleChange = (field, value) => {
		console.log(field);
		setFields(prev => ({ ...prev, [field]: value }));
		if(field == 'status'){
			if (value === "Follow Up") {
				setShowDatePicker(true);
			} else {
				setShowDatePicker(false);
			}
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!isChanged()) {
			alert("No changes made!");
			return;
		}

		setLoading(true);
		try {
		const payload = {
			invitationId: fields.invitationId || originalFields.invitationId || "",
			name: fields.firstName || originalFields.firstName || "",
			email: fields.emailId || originalFields.emailId || "",
			mobile: fields.mobile || originalFields.mobile || "",
			altMobile: fields.altMobile || originalFields.altMobile || "",
			status: fields.status || originalFields.status || "",
			remarks: fields.remarks || originalFields.remarks || "",
			course: fields.course || originalFields.course || "",
			score: fields.score || originalFields.score || "",
			destination: fields.destination || originalFields.destination || "",
			numberOfTravellers: fields.numberOfTravellers || originalFields.numberOfTravellers || "",
			source: fields.source || originalFields.source || "",
			location: fields.location || originalFields.location || "",
			assignedTo: fields.assignedUserId || originalFields.assignedUserId || "",
			deviceType: fields.deviceType || originalFields.deviceType || "",
			modelNo: fields.modelNo || originalFields.modelNo || "",
			category: fields.category || originalFields.category || "",
			issue: fields.issue || originalFields.issue || "",
			guardianName: fields.guardianName || originalFields.guardianName || "",
			academicYear: fields.academicYear || originalFields.academicYear || "",
			className: fields.className || originalFields.className || "",
			workExperience: fields.workExperience || originalFields.workExperience || "",
			workingOrganization: fields.workingOrganization || originalFields.workingOrganization || "",
			message: fields.message || originalFields.message || "",
			businessDetails: fields.businessDetails || originalFields.businessDetails || "",
			interestedDigital: fields.interestedDigital || originalFields.interestedDigital || "",
			websiteName: fields.websiteName || originalFields.websiteName || "",
			facebook: fields.facebook || originalFields.facebook || "",
			instagram: fields.instagram || originalFields.instagram || "",
			leadProbability: fields.leadProbability || originalFields.leadProbability || "",
			followupDate: convertDateFormat(fields.followupDate)  || convertDateFormat(originalFields.followupDate) || "",
			industry: fields.industry || originalFields.industry || "",
			updatedBy: User?._id || "",
			demoTrainer: fields.demoTrainer || originalFields.demoTrainer || "",
			courseMode: fields.courseMode || originalFields.courseMode || "",
			qualification: fields.qualification || originalFields.qualification || "",
			additional_info: fields.additional_info || originalFields.additional_info || "",
			investmentCapacity: fields.investmentCapacity || originalFields.investmentCapacity || "",
			testId: fields.testId || originalFields.testId || "",
		};
		console.log(payload);
		const response = await xFetch({
			method: 'POST',
			path: '/services/invite/updateInviteDetails',
			payload
		});

		if (response == true) {
			toast.success('Candidate updated successfully!');
			if ( originalFields.status != fields.status ) {
				//notificationsPostStatusUpdate(fields.invitationId, fields.status);
			}
			if (onSuccess) onSuccess();
		} else {
			toast.error(response?.error || 'Failed to update candidate.');
		}
		} catch (error) {
			toast.error(error.message || 'Failed to update candidate.');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchAndSetColumns();
		fetchLeadDropdowns();
		//xLead();

		selectedLead.remarks = "";
		setFields(selectedLead);
		if (selectedLead.status === "Follow Up") {
			setShowDatePicker(true);
		}
		if(Object.keys(Owners).length > 0){
			setOwner(Object.entries(Owners).map(([key, value]) => ({ key, value })));
		}
	}, []);

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
        <ToastContainer position="bottom-right" autoClose={3000} />

        {/* MAIN POPUP */}
        <div className="bg-white rounded-xl shadow-xl w-[850px] max-h-[120vh] flex flex-col overflow-hidden">

          {/* PAGE HEADER */}
          <div
            className="px-6 py-4 flex justify-between items-center"
            style={{ backgroundColor: "#EA4C89", color: "white" }}
          >
            <h2 className="text-2xl font-semibold flex items-center gap-2">
  
              Update Lead
            </h2>
            <button
              type="button"
              onClick={handleClose}
              className="transition p-1 rounded-full"
              style={{ color: "white" }}
            >
              ✕
            </button>
          </div>

          {/* FORM */}
			<form
			className="px-6 pt-4 pb-5 overflow-y-auto flex-1 custom-scroll"
			onSubmit={handleSubmit}
			>
			{/* CHANGED TO 3 COLUMNS */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-5">
				{columns
				.filter(
					(c) => c.dataField !== "action" && c.dataField !== "createdDate"
				)
				.map((item, index) => {
					const value = fields?.[item.dataField] || "";
					const options = dynamicFields[item.dataField] || [];

					// OWNER SELECT
					if (item.dataField === "assignedUserId") {
					const { options } = renderOwnerSelect(item.displayName);
					return (
						<div key={index}>
						<label className="label-pink">{item.displayName}</label>
						<select
							value={fields.assignedUserId}
							onChange={(e) =>
							handleChange(item.dataField, e.target.value)
							}
							className="input-pink"
						>
							{options?.map((o, i) => (
							<option key={i} value={o.key} disabled={o.disabled}>
								{o.value}
							</option>
							))}
						</select>
						</div>
					);
					}

					if (item.fieldType === "dropdown" || item.fieldType === "datetime") {

						return (
							<>
							{/* DROPDOWN FIELD */}
							<div key={index}>
								<label className="label-pink">{item.displayName}</label>
								<select
									value={value}
									onChange={(e) =>
									handleChange(item.dataField, e.target.value)
									}
									className="input-pink"
								>
									<option value="">-- Select --</option>
									{options.map((opt) => (
									<option key={opt.key} value={opt.key}>
										{opt.value}
									</option>
									))}
								</select>
							</div>

							{/* FOLLOWUP FIELD ONLY WHEN STATUS */}
							{item.dataField == "status" && showDatePicker && (
								<div key={`followup-${index}`}>
								<label className="label-pink">Followup Date</label>
								<DateInputPicker
									value={fields.followupDate}
									onChange={(date) => handleChange("followupDate", date)}
									isTimeInterval
								/>
								</div>
							)}
							</>
						);
					}

					// TEXT FIELD
					if (item.fieldType === "text") {
					return (
						<div key={index}>
						<label className="label-pink">{item.displayName}</label>
						<input
							type={item.dataField === "emailId" ? "email" : "text"}
							value={value}
							onChange={(e) =>
							handleChange(item.dataField, e.target.value)
							}
							className="input-pink"
						/>
						</div>
					);
					}

					// TEXTAREA — FULL WIDTH ACROSS ALL 3 COLUMNS
					if (item.fieldType === "textarea") {
					return (
						<div key={index} className="md:col-span-1">
						<label className="label-pink">{item.displayName}</label>
						<textarea
							rows="2"
							value={value}
							onChange={(e) =>
							handleChange(item.dataField, e.target.value)
							}
							className="input-pink resize-none"
						></textarea>
						</div>
					);
					}

					return null;
				})}
			</div>

			{/* ACTION BUTTONS */}
			<div className="mt-6 flex justify-end gap-3">
				<button
				type="button"
				onClick={handleClose}
				className="btn-secondary-pink"
				>
				Cancel
				</button>
				<button
				type="submit"
				disabled={loading}
				className="btn-primary-pink"
				>
				{loading ? "Updating..." : "Update"}
				</button>
			</div>
			</form>

        </div>
      </div>

      {/* Extra Tailwind Styles */}
      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #f5b6d1; border-radius: 10px; }

        .label-pink { 
          display:block; 
          margin-bottom:4px; 
          font-weight:600; 
          color:#EA4C89;
        }
        .input-pink {
          width:100%;
          padding:8px 10px;
          border:1px solid #F9C2DD;
          border-radius:8px;
          outline:none;
          transition:0.2s;
        }
        .input-pink:focus {
          border-color:#EA4C89;
          box-shadow:0 0 0 2px #F9C2DD;
        }

        .btn-primary-pink {
          background:#EA4C89;
          color:white;
          padding:8px 18px;
          border-radius:8px;
          font-weight:600;
          transition:0.2s;
        }
        .btn-primary-pink:hover {
          background:#d53f77;
        }
        .btn-secondary-pink {
          background:white;
          border:1px solid #EA4C89;
          color:#EA4C89;
          padding:8px 18px;
          border-radius:8px;
          transition:0.2s;
        }
        .btn-secondary-pink:hover {
          background:#ffe0ef;
        }
      `}</style>
    </>
  );
}
