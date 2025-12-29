'use client'
import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { xFetch } from "@/utility/xFetch";
import { Corporate, User, Test, Owners } from "@/utility/TinyDB";
import DateInputPicker from "@/components/DateInputPicker/DateInputPicker";
import Timeline from "@/components/dashboard/Lead/ViewTimeline";

export default function UpdateLead({ selectedLead, onCancel, onSuccess }) {
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

  async function xLead() {
    let payload = {
      invitationId: selectedLead.invitationId,
      testType: Test.type,
    };

    xFetch({
      path: `/services/invite/getEnquiry`,
      payload,
    })
      .then((data) => {
        console.log("Lead Data:", data);
        setFields(data);
        if (data.status === "Follow Up") {
          setShowDatePicker(true);
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

  const handleChange = (field, value) => {
    setFields((prev) => ({ ...prev, [field]: value }));
    if (field == "status") {
      if (value === "Follow Up") {
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
        if (onSuccess) onSuccess();
          getAINextStep(payload.invitationId);
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

  useEffect(() => {
    fetchAndSetColumns();
    fetchLeadDropdowns();

    selectedLead.remarks = "";
    setFields(selectedLead);
    if (selectedLead.status === "Follow Up") {
      setShowDatePicker(true);
    }
    if (Object.keys(Owners).length > 0) {
      setOwner(Object.entries(Owners).map(([key, value]) => ({ key, value })));
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
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
              border-b backdrop-blur update-header
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
              className="px-6 pt-5 pb-6 overflow-y-auto flex-1 custom-scroll"
              onSubmit={handleSubmit}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {columns
                  .filter(
                    (c) =>
                      c.dataField !== "action" &&
                      c.dataField !== "createdDate" &&
                      c.dataField !== "updateTime"
                  )
                  .map((item, index) => {
                    const value = fields?.[item.dataField] || "";
                    const options = dynamicFields[item.dataField] || [];

                    if (item.dataField === "assignedUserId") {
                      const { options } = renderOwnerSelect(
                        item.displayName || item.fieldName
                      );
                      return (
                        <div key={index} className="field-card">
                          <label className="label-crm">
                            {item.displayName || item.fieldName}
                          </label>
                          <select
                            value={fields.assignedUserId}
                            onChange={(e) =>
                              handleChange(item.dataField, e.target.value)
                            }
                            className="input-crm"
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

                    if (
                      item.fieldType === "dropdown" ||
                      item.fieldType === "datetime"
                    ) {
                      return (
                        <React.Fragment key={index}>
                          <div className="field-card">
                            <label className="label-crm">
                              {item.displayName || item.fieldName}
                            </label>
                            <select
                              value={value}
                              onChange={(e) =>
                                handleChange(item.dataField, e.target.value)
                              }
                              className="input-crm"
                            >
                              <option value="">-- Select --</option>
                              {options.map((opt) => (
                                <option key={opt.key} value={opt.key}>
                                  {opt.value}
                                </option>
                              ))}
                            </select>
                          </div>

                          {item.dataField === "status" && showDatePicker && (
                            <div className="field-card">
                              <label className="label-crm">Followup Date</label>
                              <DateInputPicker
                                value={fields.followupDate}
                                onChange={(date) =>
                                  handleChange("followupDate", date)
                                }
                                isTimeInterval
                              />
                            </div>
                          )}
                        </React.Fragment>
                      );
                    }

                    if (item.fieldType === "text") {
                      return (
                        <div key={index} className="field-card">
                          <label className="label-crm">
                            {item.displayName || item.fieldName}
                          </label>
                          <input
                            type={
                              item.dataField === "emailId" ? "email" : "text"
                            }
                            value={value}
                            onChange={(e) =>
                              handleChange(item.dataField, e.target.value)
                            }
                            className="input-crm"
                          />
                        </div>
                      );
                    }

                    if (item.fieldType === "textarea") {
                      return (
                        <div key={index} className="field-card">
                          <label className="label-crm">
                            {item.displayName || item.fieldName}
                          </label>
                          <textarea
                            rows="2"
                            value={value}
                            disabled={item.dataField === "aINextStep"}
                            onChange={(e) =>
                              handleChange(item.dataField, e.target.value)
                            }
                            className="input-crm resize-none whitespace-pre-line"
                          />
                        </div>
                      );
                    }

                    return null;
                  })}
              </div>

              {/* ACTIONS */}
              <div className="mt-6 mb-2 flex justify-end gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary-crm"
                >
                  {loading ? "Updating..." : "Update"}
                </button>

                <button
                  type="button"
                  onClick={handleShowTimeline}
                  className="btn-secondary-crm"
                >
                  Timeline
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
        .update-header{
            background: "linear-gradient(135deg, #e8f1fb, #f8fbff)",
            color: "#0f172a"
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

        .btn-primary-crm {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          padding: 9px 22px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          box-shadow: 0 6px 14px rgba(37,99,235,.25);
          transition: all .2s ease;
        }

        .btn-primary-crm:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 20px rgba(37,99,235,.35);
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
      `}</style>
    </>
  );


}
