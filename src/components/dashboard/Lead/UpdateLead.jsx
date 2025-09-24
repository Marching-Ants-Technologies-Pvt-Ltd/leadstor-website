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
			<div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
				<ToastContainer position="bottom-right" autoClose={3000} />
				<div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-gray-200 relative">
					<div className="px-8 pt-8 pb-3 flex items-center justify-between">
						<h2 className="text-2xl font-medium text-gray-500">Update Lead</h2>
						<button
							className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 focus:outline-none border-none bg-transparent -mr-2"
							style={{ marginRight: '-0.7rem' }}
							onClick={handleClose}
							aria-label="Close"
							type="button"
						>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
							<path fillRule="evenodd" d="M10 8.586l4.95-4.95a1 1 0 111.414 1.414L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10l-4.95-4.95A1 1 0 115.05 3.636L10 8.586z" clipRule="evenodd" />
							</svg>
						</button>
					</div>
					<form className="px-8 pb-6 pt-2 max-h-[74vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" onSubmit={handleSubmit}>
						<div className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{columns
									.filter(item => item.dataField !== 'action' && item.dataField !== 'createdDate')
									.map((item, index) => {
									const value = fields?.[item.dataField] || "";
									const options = Array.isArray(dynamicFields?.[item.dataField])
										? dynamicFields[item.dataField]
										: [];

									if (item.dataField === 'assignedUserId') {
										const { options } = renderOwnerSelect(item.displayName);

										return (
											<div key={index}>
												<label className="block text-sm font-semibold text-gray-700 mb-2">{item.displayName}</label>
												<select
													value={fields.assignedUserId}
													onChange={(e) => handleChange(item.dataField, e.target.value)}
													disabled={fetching}
													className="modal-input w-full"
												>
													{options.map((opt, idx) => (
														<option
															key={idx}
															value={opt.key}
															disabled={opt.disabled || false}
														>
															{opt.value}
														</option>
													))}
												</select>
											</div>
										);
									}


									if (item.fieldType === 'dropdown') {
										return (
										<div key={index}>
											<label className="block text-sm font-semibold text-gray-700 mb-2">{item.displayName}</label>
											<select
											value={value}
											onChange={(e) => handleChange(item.dataField, e.target.value)}
											disabled={fetching}
											className="modal-input w-full"
											>
											<option value="">-- Select --</option>
											{options.map((opt, idx) => (
												<option key={opt.key} value={opt.key}>
												{opt.value}
												</option>
											))}
											</select>
										</div>
										);
									}

									if (item.fieldType === 'text') {
										if (item.dataField === 'mobile' || item.dataField === 'altmobile') {
										return (
											<div key={index}>
											<label className="block text-sm font-semibold text-gray-700 mb-2">{item.displayName}</label>
											<input
												type="tel"
												value={value}
												onChange={(e) => handleChange(item.dataField, e.target.value)}
												disabled={fetching}
												required
												pattern={
												Corporate?.country_code !== "IN"
													? "^(\\+\\d{1,3}|0|91|653\\d{1,3})?\\d{7,15}$"
													: "^(\\+\\d{1,3}|(0)|(91)|(00)\\d{1,3})?\\d{10}$"
												}
												onInvalid={(e) => {
												e.target.setCustomValidity("");
												e.target.setCustomValidity(
													Corporate?.country_code !== "IN"
													? "Please enter a valid mobile number."
													: "Please enter a valid mobile number. Expected Format: +91XXX or 0091XXX or 0XXX or XXX."
												);
												}}
												onInput={(e) => e.target.setCustomValidity("")}
												className="modal-input w-full"
											/>
											</div>
										);
										} else {
										return (
											<div key={index}>
											<label className="block text-sm font-semibold text-gray-700 mb-2">{item.displayName}</label>
											<input
												type={item.dataField == "emailId" ? "email" : "text"}
												value={value}
												onChange={(e) => handleChange(item.dataField, e.target.value)}
												disabled={fetching}
												className="modal-input w-full"
											/>
											</div>
										);
										}
									}

									if (item.fieldType === 'datetime') {
										if (!showDatePicker) return null;
										return (
										<div key={index}>
											<label className="block text-sm font-semibold text-gray-700 mb-2">Followup Date</label>
											<DateInputPicker
												value={fields?.followupDate|| ""}
												onChange={(date) => handleChange('followupDate', date)}
												placeholder="Select followup date"
												isTimeInterval={true}
											/>
										</div>
										);
									}

									if (item.fieldType === 'textarea') {
										const isRemarks = item.dataField === 'remarks';
										const textareaProps = {
											value: value,
											required: isRemarks ? true : undefined,
											onKeyDown: isRemarks ? (e) => e.target.setCustomValidity('') : undefined,
											onChange: (e) => {
												if (isRemarks) {
													e.target.setCustomValidity('');
												}
												handleChange(item.dataField, e.target.value);
											}
										};

										return (
											<div key={index}>
												<label className="block text-sm font-semibold text-gray-700 mb-2">
													{item.displayName}
													{isRemarks ? <span className="text-red-500"> * </span> : null}
												</label>
												<textarea
													{...textareaProps}
													disabled={fetching}
													className="modal-input w-full"
													rows="4"
													placeholder={`Enter ${item.displayName}`}
												/>
											</div>
										);
									}
									return null;
									})}
							</div>
						</div>
						<div className="mt-6 flex flex-row items-center gap-3 justify-end">
							<button
							className="border border-gray-300 text-gray-700 bg-white px-4 py-2 rounded-md text-sm font-medium focus:outline-none hover:bg-gray-50 transition-colors"
							onClick={handleClose}
							type="button"
							disabled={loading || fetching}
							>
							Cancel
							</button>
							<button
							className="bg-green-600 text-white px-6 py-2 rounded-md text-sm font-semibold focus:outline-none hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
							type="submit"
							disabled={loading || fetching}
							>
							{loading ? 'Updating...' : 'Update'}
							</button>
						</div>
					</form>
				</div>
			</div>
		</>
	)
}