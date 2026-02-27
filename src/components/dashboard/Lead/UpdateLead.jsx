'use client'
import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { xFetch } from "@/utility/xFetch";
import { Corporate, User, Test } from "@/utility/TinyDB";
import DateInputPicker from "@/components/DateInputPicker/DateInputPicker";
import Timeline from "@/components/dashboard/Lead/ViewTimeline";

export default function UpdateLead({ selectedLead, onCancel, onSuccess }) {
  const [isInitializing, setIsInitializing] = useState(true);
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
  const [showTimeline, setShowTimeline] = useState(false);
  const [displayRemarks, setDisplayRemarks] = useState("");
  const [aiNextStep, setAiNextStep] = useState("");
  const FIELD_GROUPS = {
    leadDetails: ['mobile', 'firstName', 'emailId', 'location'],
    salesUpdate: ['status', 'leadProbability'],
    notes: ['remarks'],
    context: ['course', 'source', 'assignedUserId']
  };
  const ALL_GROUPED_FIELDS = Object.values(FIELD_GROUPS).flat();
    const EXCLUDED_ADDITIONAL_FIELDS = [
    "createdDate",
    "updateTime",
    "aINextStep",
    "action"
  ];

  const getUngroupedColumns = () => {
    return columns.filter(
      c =>
        !ALL_GROUPED_FIELDS.includes(c.dataField) &&
        !EXCLUDED_ADDITIONAL_FIELDS.includes(c.dataField) 
    );
  };

  const renderFieldByColumn = (item, index) => {
    const value = fields?.[item.dataField] || "";
    const options = dynamicFields[item.dataField] || [];

    if (item.dataField === "assignedUserId") {
      const { options: ownerOptions } = renderOwnerSelect(
        item.displayName || item.fieldName
      );

      return (
        <div key={index} className="field-card">
          <label className="label-crm">{item.displayName || item.fieldName}</label>
          <select
            value={fields.assignedUserId}
            onChange={(e) => handleChange(item.dataField, e.target.value)}
            className="input-crm"
          >
            {ownerOptions.map((o, i) => (
              <option key={i} value={o.key} disabled={o.disabled}>
                {o.value}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (item.fieldType === "dropdown") {
      return (
        <div key={index} className="field-card">
          <label className="label-crm">{item.displayName || item.fieldName}</label>
          <select
            value={value}
            onChange={(e) => {
              const selectedOption = e.target.options[e.target.selectedIndex];
              const selectedValue = e.target.value;
              const isFollowupType = selectedOption.getAttribute('data-isfollowup');
              handleChange(item.dataField, selectedValue, isFollowupType);
            }}
            className="input-crm"
          >
            <option value="">-- Select --</option>
            {options.map((opt) => (
              <option 
                key={opt.key} 
                value={opt.key} 
                data-isfollowup={opt.isFollowup}
              >
                {opt.value}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (item.fieldType === "textarea") {
      return (
        <div key={index} className="field-card">
          <label className="label-crm">{item.displayName || item.fieldName}</label>
          <textarea
            rows="3"
            value={displayRemarks}
            onChange={(e) => {
              setDisplayRemarks(e.target.value);
              handleChange(item.dataField, e.target.value); 
            }}
            className="input-crm resize-none"
          />
        </div>
      );
    }

    return (
      <div key={index} className="field-card">
        <label className="label-crm">{ item.displayName || item.fieldName }</label>
        <input
          type={item.dataField === "emailId" ? "email" : "text"}
          value={value}
          onChange={(e) => handleChange(item.dataField, e.target.value)}
          className="input-crm"
        />
      </div>
    );
  };

  // Fetch and apply custom column names and order
  const fetchAndSetColumns = async () => {
    try {
      const data = await xFetch({ path: "/services/profile/columns" });
      setColumns(data);
      let _columnOrder = data.map((item) => item.dataField);
      _columnOrder = _columnOrder.filter((item) => item !== "action");
      setColumnOrder(_columnOrder);
    } catch (error) {
      setColumns([]);
    }
  };

  // Fetch lead dropdowns
  const fetchLeadDropdowns = async () => {
    try {
      const data = await xFetch({ path: "/services/profile/getLeadDropdowns" });
      setDynamicFields(data);
    } catch (error) {
      setColumns([]);
    }
  };

  const getNameById = (options, selectedId, label) => {
    if (selectedId == "") {
      return label;
    }
    return options.find((obj) => obj.key === selectedId)?.value || label;
  };

  const renderOwnerSelect = (displayName) => {
    
    if (!owner || owner.length === 0) return { options: [] };

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
    return Object.keys(fields).some((key) => fields[key] !== originalFields[key]);
  };

  const convertDateFormat = (dateStr) => {
    if (!dateStr) return null;
    let parsedDate = new Date(dateStr);

    if (isNaN(parsedDate)) {
      console.error("Invalid date format");
      return null;
    }

    // Format components (YYYY-MM-DD HH:mm:ss)
    let year = parsedDate.getFullYear();
    let month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    let day = String(parsedDate.getDate()).padStart(2, "0");
    let hours = String(parsedDate.getHours()).padStart(2, "0");
    let minutes = String(parsedDate.getMinutes()).padStart(2, "0");
    let seconds = "00";

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const xLead = async () => {
    let payload = {
      invitationId: selectedLead.invitationId,
      testType: Test.type,
    };

    xFetch({
      path: `/services/invite/getEnquiry`,
      payload,
    })
      .then((data) => {
        setFields(data);
        setDisplayRemarks("");
        if (data.status === "Follow Up" || data.isFollowupType == '1') {
          setShowDatePicker(true);
        }
        // Only update aiNextStep if API returns a non-empty value
        if (data.aINextStep && data.aINextStep.trim() !== "") {
          setAiNextStep(data.aINextStep);
        }

      })
      .catch((error) => {
        console.error(`An error occurred while fetching leads`, error);
        setFields([]);
      })
      .finally(() => {
        if (typeof window.onTableRefresh == "function") window.onTableRefresh();
      });
  }

  const handleClose = () => {
    if (onCancel) onCancel();
  };

  const handleChange = (field, value, isFollowupType) => {
    setFields((prev) => ({ ...prev, [field]: value }));
    if (field == "status") {
      if (value === "Follow Up" || isFollowupType == '1') {
        setShowDatePicker(true);
      } else {
        setShowDatePicker(false);
      }
    }
  };

  // OPEN TIMELINE: hide update popup UI and show timeline modal
  const handleShowTimeline = () => {
    setShowTimeline(true);
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
        followupDate:
          convertDateFormat(fields.followupDate) ||
          convertDateFormat(originalFields.followupDate) ||
          "",
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
        method: "POST",
        path: "/services/invite/updateInviteDetails",
        payload,
      });

      if (response == true) {
        toast.success("Candidate updated successfully!");
        if (originalFields.status != fields.status) {
          //notificationsPostStatusUpdate(fields.invitationId, fields.status);
        }
        
        // Refresh lead status summary to update card counts
        const getLeadStatusSummary = async() => {
          const res = await xFetch({
            path: `/services/dashboard/getLeadStatusSummary?userId=${User?._id}`,
          });
          if (!res) return;
          if (window.updateStatusCounts) {
            window.updateStatusCounts({
              overdue: res.data.overdue || 0,
              todaysFollowUps: res.data.todaysFollowUps || 0,
              newLeads: res.data.newLeads || 0,
              hotLeads: res.data.hotLeads || 0,
              conversions: res.data.conversions || 0,
            });
          }
        }
        getLeadStatusSummary();
        
        if (onSuccess) onSuccess();
        if(Corporate?.is_ai_nextstep_enabled == 1){
          getAINextStep(payload.invitationId);
        }

      } else {
        toast.error(response?.error || "Failed to update candidate.");
      }
    } catch (error) {
      toast.error(error.message || "Failed to update candidate.");
    } finally {
      setLoading(false);
    }
  };

  const getAINextStep = async (invitationId) => {
      const payload = { invitationId: invitationId };
      try {
          const response = await xFetch({
              method: "POST", 
              path: "/services/invite/getNextStepForLead",
              payload,
          });
          console.log("AI Next Step Response:", response);
      } catch (error) {
          console.error("Error fetching AI Next Step:", error);
      }
  }

  const fetchOwners = () => {
    xFetch({
          path: '/services/profile/getUsers',
          payload: { basic: 1 }
      })
      .then(data => {
        const ownerList = data;
        if (Object.keys(ownerList).length > 0) {
          setOwner(Object.entries(ownerList).map(([key, value]) => ({ key, value })));
        }
      })
      .catch(error => {
          console.error(`An error occurred while fetching leads`, error);
      });
  }
  useEffect(() => {
    let isMounted = true;
    // Store the initial aiNextStep from selectedLead to preserve it
    const initialAiNextStep = selectedLead.aINextStep || "";

    const initialize = async () => {
      setIsInitializing(true);

      setFields({ ...selectedLead, remarks: "" });
      setAiNextStep(initialAiNextStep);

      if (selectedLead.status === "Follow Up" || selectedLead.isFollowupType === '1') {
        setShowDatePicker(true);
      }

      try {
        await Promise.all([
          xLead(),
          fetchAndSetColumns(),
          fetchLeadDropdowns(),
          fetchOwners()
        ]);
      } catch (err) {
        console.error("Initialization error:", err);
        toast.error("Failed to load some data");
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    initialize();

    console.log(fields.followupDate ? new Date(fields.followupDate) : null);

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>

      {isInitializing && (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading lead data...</div>
      </div>
      )}

      {!showTimeline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3">
          <ToastContainer position="bottom-right" autoClose={3000} />

          {/* MAIN POPUP */}
          <div className="
            bg-white rounded-2xl shadow-2xl
            w-full max-w-4xl
            max-h-[90vh]
            flex flex-col overflow-hidden
          ">
            {/* HEADER */}
            <div className="
              px-6 py-2 flex justify-between items-center
              border-b backdrop-blur lead-header
            "
            >
              <h2 className="text-[15px] font-semibold tracking-wide">
                Update Lead
              </h2>

              <button
                type="button"
                onClick={handleClose}
                className="
                  h-8 w-8 flex items-center justify-center
                  rounded-full hover:bg-slate-200
                  text-slate-600 hover:text-black transition
                "
              >
                ✕
              </button>
            </div>

            {/* FORM */}
            <form
              className="flex flex-col flex-1 overflow-hidden"
              onSubmit={handleSubmit}
            >
              <div className="px-6 pt-5 pb-6 overflow-y-auto flex-1 custom-scroll">
                  {/* LEAD DETAILS */}
                  <section className="crm-section">
                    <h3 className="crm-section-title">Lead Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {columns
                        .filter(c => FIELD_GROUPS.leadDetails.includes(c.dataField))
                        .map(renderFieldByColumn)}
                    </div>
                  </section>

                  {/* SALES UPDATE */}
                  <section className="crm-section bg-soft">
                    <h3 className="crm-section-title">Sales Update</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {columns
                        .filter(c => FIELD_GROUPS.salesUpdate.includes(c.dataField))
                        .map(renderFieldByColumn)}
                    </div>

                    {/* FOLLOW UP DATE */}
                    {showDatePicker && (
                      <div className="mt-4 max-w-sm">
                        <label className="label-crm">Follow-up Date</label>
                        <DateInputPicker
                          value={fields.followupDate ? new Date(fields.followupDate) : null}
                          onChange={(selectedDate) => {
                            if (selectedDate) {
                              handleChange("followupDate", selectedDate.toISOString());
                            } else {
                              handleChange("followupDate", "");
                            }
                          }}
                        />
                      </div>
                    )}

                    {/* AI NEXT STEP */}
                    {aiNextStep && (
                      <div className="ai-card">
                        <span className="ai-icon">✨</span>
                        <div>
                          <div className="ai-title">AI Next Best Action</div>
                          <p>{aiNextStep}</p>
                        </div>
                      </div>
                    )}

                    {/* NOTES */}
                    <div className="mt-4">
                      {columns
                        .filter(c => FIELD_GROUPS.notes.includes(c.dataField))
                        .map(renderFieldByColumn)}
                    </div>
                  </section>

                  {/* LEAD CONTEXT */}
                  <section className="crm-section">
                    <h3 className="crm-section-title">Lead Context</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {columns
                        .filter(c => FIELD_GROUPS.context.includes(c.dataField))
                        .map(renderFieldByColumn)}
                    </div>
                  </section>

                  {/* ADDITIONAL DETAILS (AUTO-FETCHED) */}
                  {getUngroupedColumns().length > 0 && (
                    <section className="crm-section">
                      <h3 className="crm-section-title">Additional Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {getUngroupedColumns().map(renderFieldByColumn)}
                      </div>
                    </section>
                  )}

              </div>

              {/* ACTIONS */}
              <div className="sticky-footer">
                <button
                  type="button"
                  onClick={handleShowTimeline}
                  className="btn-secondary-crm"
                >
                  View Timeline
                </button>

                <button type="submit" disabled={loading} className="btn-primary-crm">
                  {loading ? "Updating..." : "Save Changes"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {showTimeline && (
        <Timeline
          leadDetails={selectedLead}
          isOpen={true}
          onClose={() => setShowTimeline(false)}
        />
      )}

      {/* STYLES */}
      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }

        .field-card {
          transition: transform .15s ease, box-shadow .15s ease;
        }
        
        .field-card:hover {
          transform: translateY(-1px);
        }

        .label-crm {
          font-size: 11.5px;
          color: #475569;
          margin-bottom: 5px;
          font-weight: 500;
        }

        .input-crm {
          width: 100%;
          padding: 8px 11px;
          font-size: 13px;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          outline: none;
          background: #f8fafc;
          transition: all .2s ease;
        }

        .input-crm:focus {
          background: #ffffff;
          border-color: #60a5fa;
          box-shadow: 0 0 0 3px rgba(96,165,250,0.2);
        }

        .btn-secondary-crm {
          background: #ffffff;
          border: 1px solid #d1d5db;
          color: #334155;
          padding: 9px 22px;
          border-radius: 10px;
          font-size: 13px;
          transition: all .2s ease;
        }

        .btn-secondary-crm:hover {
          background: #f8fafc;
        }
        .crm-section {
          margin-bottom: 26px;
        }

        .crm-section-title {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: .04em;
          color: #64748b;
          margin-bottom: 10px;
        }

        .bg-soft {
          background: #f8faff;
          padding: 18px;
          border-radius: 14px;
        }

        .ai-card {
          margin-top: 16px;
          display: flex;
          gap: 12px;
          padding: 14px 16px;
          background: linear-gradient(135deg, #eef2ff, #f8fafc);
          border: 1px solid #dbeafe;
          border-radius: 12px;
        }

        .ai-icon {
          font-size: 20px;
        }

        .ai-title {
          font-size: 13px;
          font-weight: 600;
          color: #1e3a8a;
          margin-bottom: 4px;
        }
        .sticky-footer {
          position: sticky;
          bottom: 0;
          background: white;
          padding: 14px 24px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          z-index: 10;
        }

      `}</style>
    </>
  );

}
