"use client";

import { useEffect, useRef, useState } from "react";
import Handsontable from "handsontable";
import { HotTable } from "@handsontable/react";
import { CopyPaste } from "handsontable/plugins/copyPaste";
import "handsontable/dist/handsontable.full.min.css";

import * as XLSX from "xlsx";

import { xFetch } from "@/utility/xFetch";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/ReactToastify.min.css";
import { Corporate, Test, User } from "@/utility/TinyDB";

/**
 * AddLeadDynamic (Handsontable + Import + Add Enquiry)
 *
 * - Import Excel (xlsx)
 * - Validation: email/mobile/required fields
 * - Validate against dropdowns (source/course/owner/status)
 * - Check duplicates via services/invite/checkDuplicatesOnManualImport
 * - Highlight invalid/duplicate cells
 * - Chunked upload via sendTestInvitationEmail (legacy FormData)
 */

export default function AddLeadDynamic({ onClose, onRefreshTable }) {
  const corporate = Corporate || {};
  const test = Test || {};
  const user = User || {};

  const corporateId = corporate?._id;
  const testId = test?._id || null;

  const tableRef = useRef(null);
  const hotInstanceRef = useRef(null);

  const [fields, setFields] = useState([]); // dynamic columns metadata from /services/profile/columns or fallback
  const [data, setData] = useState([{}]); // Handsontable data rows (object-per-row for HotTable)

  // dropdown sets used for validation
  const [sources, setSources] = useState([]);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [statuses, setStatuses] = useState([]);

  const [loading, setLoading] = useState(false);

  // register plugin client-side only
  useEffect(() => {
    try {
      Handsontable.plugins.registerPlugin(CopyPaste);
    } catch (e) {
      // plugin may be already registered; ignore
    }
  }, []);

  useEffect(() => {
    loadFields();
    loadDropdowns();
  }, []);

  async function loadFields() {
    try {
      const res = await xFetch({ path: "/services/profile/columns" }); // your existing endpoint
      if (res && Array.isArray(res)) {
        setFields(res);
        // Initialize one empty row mapped to dataField order
        const empty = {};
        res.forEach((f) => {
          empty[f.dataField] = "";
        });
        setData([empty]);
      } else {
        toast.error("Unable to load fields. Using fallback.");
        // fallback minimal set (First Name, Last Name, Email, Mobile)
        const fallback = [
          { dataField: "firstName", displayName: "First Name" },
          { dataField: "lastName", displayName: "Last Name" },
          { dataField: "email", displayName: "Email Id" },
          { dataField: "mobile", displayName: "Mobile" },
        ];
        setFields(fallback);
        setData([fallback.reduce((a, f) => ((a[f.dataField] = ""), a), {})]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading fields");
    }
  }

  async function loadDropdowns() {
    try {
      const [src, crs, sts, usrs] = await Promise.all([
        xFetch({ path: `/services/profile/getSources?corporateId=${corporateId}` }),
        xFetch({ path: `/services/profile/getCourses?corporateId=${corporateId}` }),
        xFetch({ path: `/services/profile/getStatuses?corporateId=${corporateId}` }),
        xFetch({ path: `/services/profile/getUsers?corporateId=${corporateId}` }),
      ]);

      setSources(src || []);
      setCourses(crs || []);
      setStatuses(sts || []);
      setUsers(usrs || []);
    } catch {
      toast.error("Failed loading dropdown values");
    }
  }


  /* ------------------------
     HANDSONTABLE COLUMNS
     --- Includes DROPDOWNS ---
  ------------------------ */

  function getColumnDefinition(field) {
    // detect by PHP field names
    switch (field.dataField) {
      case "source":
        return {
          data: field.dataField,
          type: "autocomplete",
          source: sources.map(s => s.source),
          strict: false,
          allowInvalid: true,
        };

      case "course":
        return {
          data: field.dataField,
          type: "autocomplete",
          source: courses.map(c => c.course),
          strict: false,
        };

      case "status":
        return {
          data: field.dataField,
          type: "autocomplete",
          source: statuses.map(s => s.status),
          strict: false,
        };

      case "owner":
      case "assignedUser":
        return {
          data: field.dataField,
          type: "autocomplete",
          source: users.map(u => u.name),
          strict: false,
        };

      default:
        return {
          data: field.dataField,
          type: "text",
        };
    }
  }

  const columns = fields.map(f => ({
    width: 150,
    ...getColumnDefinition(f),
  }));

  /* ---------- Helpers: validators like old code ---------- */

  const emailRegex = /.+@.+/; // matches old simple rule in PHP code
  const makeMobileRegex = () => {
    // Use corporate country code if available (approximation)
    const cc = corporate?.country_code || "IN";
    if (cc !== "IN") {
      return /^(\+?\d{1,4}[-.\s]?)?(\(?\d{1,4}\)?[-.\s]?)?[\d-\s.]{4,}$/im;
    } else {
      return /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
    }
  };

  const isValidEmail = (v) => {
    if (!v && v !== "") return false;
    if (v === "" || v == null) return true; // empty allowed per original validators
    return emailRegex.test(String(v));
  };

  const isValidMobile = (v) => {
    if (!v && v !== "") return false;
    if (v === "" || v == null) return true;
    const regex = makeMobileRegex();
    return regex.test(String(v));
  };

  /* ---------- Utilities ---------- */

  const getHeaderNames = () => fields.map((f) => f.displayName ?? f.dataField);

  const getFieldOrder = () => fields.map((f) => f.dataField);

  const findIndexForHeader = (names, predicate) => {
    // names = column display names; predicate checks name text
    for (let i = 0; i < names.length; i++) {
      const t = String(names[i] || "").toLowerCase();
      if (predicate(t)) return i;
    }
    return -1;
  };

  const chunkArray = (arr, size) => {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  };

  /* ---------- Excel Import (XLSX) ---------- */

  const handleImportExcel = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast.info("Reading Excel…");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const firstSheet = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheet];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      if (!json || json.length === 0) {
        toast.error("No rows found in Excel.");
        return;
      }

      // Validate header existence: ensure at least First Name and (Email or Mobile) columns exist in sheet header
      const headers = Object.keys(json[0]).map((h) => h.trim());
      const requiredBasic = ["First Name", "Last Name"];
      const hasEmail = headers.some((h) => /mail/i.test(h));
      const hasMobile = headers.some((h) => /bile|hone/i.test(h));
      if (!hasEmail && !hasMobile) {
        toast.error('Sheet must contain "Email" or "Mobile" column.');
        return;
      }

      // Map incoming sheet rows into Handsontable row arrays following current fields order
      const fieldOrder = getFieldOrder(); // e.g. ['firstName','lastName','email','mobile',...]
      // map header display name -> column index in sheet
      const sheetHeaderIndex = {};
      headers.forEach((h) => (sheetHeaderIndex[h.toLowerCase()] = h));

      // Build rows in same structure as data objects for HotTable (object keyed by dataField)
      const newRows = json.map((row) => {
        const obj = {};
        fields.forEach((f) => {
          // Try to find matching column in excel by comparing displayName and dataField
          const candidates = [f.displayName, f.fieldName, f.dataField].filter(Boolean).map((s) => String(s).toLowerCase());
          let value = "";
          // Look for first header that matches candidate substring
          for (const hdr of headers) {
            const lower = hdr.toLowerCase();
            if (candidates.some((c) => c && lower.indexOf(c) !== -1)) {
              value = row[hdr] ?? "";
              break;
            }
          }
          // fallback: try by common names
          if (value === "") {
            if (row["First Name"] && /first/i.test(f.displayName ?? f.dataField)) value = row["First Name"];
            else if (row["Last Name"] && /last/i.test(f.displayName ?? f.dataField)) value = row["Last Name"];
            else if (row["Email"] && /mail/i.test(f.displayName ?? f.dataField)) value = row["Email"];
            else if (row["Mobile"] && /bile|hone/i.test(f.displayName ?? f.dataField)) value = row["Mobile"];
            else {
              // try direct header with same displayName
              const exactHeader = headers.find((h) => (f.displayName && h.toLowerCase() === f.displayName.toLowerCase()));
              if (exactHeader) value = row[exactHeader] ?? "";
            }
          }
          obj[f.dataField] = value ?? "";
        });
        return obj;
      });

      // Load into Handsontable (object rows)
      setData((prev) => {
        // If HotTable exists, use its loadData for better UX
        const hot = tableRef.current?.hotInstance;
        if (hot) {
          // convert objects to arrays in col order
          const colOrder = getFieldOrder();
          const arrData = newRows.map((r) => colOrder.map((k) => r[k] ?? ""));
          hot.loadData(arrData);
        }
        // Also set internal `data` state as objects (for submissions)
        return newRows.length ? newRows : prev;
      });

      toast.success("Excel Imported! Please validate and then click Add Enquiry.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to read Excel.");
    } finally {
      // clear file input if exists
      if (e.target) e.target.value = "";
    }
  };

  /* ---------- Validation + Duplicate check + Upload ---------- */

  // Validate entire HOT grid (email/mobile format + required fields + dropdown checks)
  const validateHotData = async () => {
    const hot = tableRef.current?.hotInstance;
    if (!hot) return { ok: false, message: "Table not ready" };

    const headerNames = getHeaderNames(); // e.g. ['First Name', 'Last Name', 'Email Id', ...]
    const emailCol = findIndexForHeader(headerNames, (t) => t.includes("mail"));
    const mobileCol = findIndexForHeader(headerNames, (t) => t.includes("bile") || t.includes("hone"));
    const courseCol = findIndexForHeader(headerNames, (t) => t.includes("course") || t.includes("service") || t.includes("preferred course"));
    const sourceCol = findIndexForHeader(headerNames, (t) => t.includes("source"));
    const ownerCol = findIndexForHeader(headerNames, (t) => t.includes("owner"));
    const statusCol = findIndexForHeader(headerNames, (t) => t.includes("status"));

    // grab raw cell arrays from handsontable (array of arrays)
    const raw = hot.getData();

    // Clear previous invalid marks
    hot.validateCells(); // ensures internal validation state recalculated
    // remove any existing htInvalid classes (we will add as needed)
    const totalRows = raw.length;
    const totalCols = headerNames.length;
    for (let r = 0; r < totalRows; r++) {
      for (let c = 0; c < totalCols; c++) {
        hot.setCellMeta(r, c, "className", "");
      }
    }
    hot.render();

    // Basic validations
    let invalidFound = false;
    const invalidRows = [];
    const emails = [];
    const phones = [];

    for (let r = 0; r < raw.length; r++) {
      const row = raw[r];
      // if row entirely empty, skip (like original)
      const allEmpty = row.every((cell) => cell === null || cell === undefined || String(cell).trim() === "");
      if (allEmpty) continue;

      // Required: First Name (index find)
      const firstNameIdx = findIndexForHeader(headerNames, (t) => t.includes("first"));
      const firstCell = firstNameIdx >= 0 ? String(row[firstNameIdx] || "").trim() : "";
      if (!firstCell) {
        invalidFound = true;
        invalidRows.push({ r, reason: "First name required" });
        // mark firstName cell invalid if found
        if (firstNameIdx >= 0) hot.setCellMeta(r, firstNameIdx, "className", "htInvalid");
      }

      // Email validation
      if (emailCol >= 0) {
        const em = String(row[emailCol] ?? "").trim();
        if (!isValidEmail(em)) {
          invalidFound = true;
          invalidRows.push({ r, reason: "Invalid Email" });
          hot.setCellMeta(r, emailCol, "className", "htInvalid");
        } else if (em) emails.push(em);
      }

      // Mobile validation
      if (mobileCol >= 0) {
        const ph = String(row[mobileCol] ?? "").trim();
        if (!isValidMobile(ph)) {
          invalidFound = true;
          invalidRows.push({ r, reason: "Invalid Mobile" });
          hot.setCellMeta(r, mobileCol, "className", "htInvalid");
        } else if (ph) phones.push(ph.replace(/\D/g, ""));
      }

      // dropdown validations: source / course / owner / status
      if (sourceCol >= 0) {
        const s = String(row[sourceCol] ?? "").trim();
        if (s && sources.length > 0 && !sources.some((x) => String(x).toLowerCase() === s.toLowerCase())) {
          invalidFound = true;
          invalidRows.push({ r, reason: `Invalid Source '${s}'` });
          hot.setCellMeta(r, sourceCol, "className", "htInvalid");
        }
      }
      if (courseCol >= 0) {
        const c = String(row[courseCol] ?? "").trim();
        if (c && courses.length > 0 && !courses.some((x) => String(x).toLowerCase() === c.toLowerCase())) {
          invalidFound = true;
          invalidRows.push({ r, reason: `Invalid Course '${c}'` });
          hot.setCellMeta(r, courseCol, "className", "htInvalid");
        }
      }
      if (ownerCol >= 0) {
        const o = String(row[ownerCol] ?? "").trim();
        if (o && owners.length > 0 && !owners.some((x) => String(x).toLowerCase() === o.toLowerCase())) {
          invalidFound = true;
          invalidRows.push({ r, reason: `Invalid Owner '${o}'` });
          hot.setCellMeta(r, ownerCol, "className", "htInvalid");
        }
      }
      if (statusCol >= 0) {
        const st = String(row[statusCol] ?? "").trim();
        if (st && statuses.length > 0 && !statuses.some((x) => String(x).toLowerCase() === st.toLowerCase())) {
          invalidFound = true;
          invalidRows.push({ r, reason: `Invalid Status '${st}'` });
          hot.setCellMeta(r, statusCol, "className", "htInvalid");
        }
      }
    } // row loop

    hot.render();

    if (invalidFound) {
      // Build message from invalidRows (unique rows)
      const uniqueRows = [...new Set(invalidRows.map((x) => x.r))];
      const sample = uniqueRows.slice(0, 5).map((r) => `Row ${r + 1}`).join(", ");
      return { ok: false, message: `Validation failed in rows: ${sample}. Please fix highlighted cells.` , emails, phones};
    }

    return { ok: true, emails, phones, raw };
  }; // validateHotData

  // call backend duplicate check (returns items array of duplicates)
  async function checkDuplicatesBackend(emails = [], phones = []) {
    if ((!emails || emails.length === 0) && (!phones || phones.length === 0)) {
      return { ok: true, message: "Nothing to check", items: [] };
    }
    try {
      const payload = { emails: emails.join(","), phones: phones.join(","), testId: testId || "" };
      const res = await xFetch({ method: "POST", path: "/services/invite/checkDuplicatesOnManualImport", payload });
      // the old API returned either { error } or { message, items }
      if (!res) return { ok: false, message: "Duplicate check failed", items: [] };
      if (res.error) return { ok: false, message: res.error || "Duplicates error", items: res.items || [] };
      return { ok: true, message: res.message || "Checked", items: res.items || [] };
    } catch (err) {
      console.error("Duplicate check failed", err);
      return { ok: false, message: "Unable to check duplicates", items: [] };
    }
  }

  // highlight duplicates in the table (by setting class htInvalid)
  const highlightDuplicateInTable = (duplicates = [], emailColIndex, phoneColIndex) => {
    const hot = tableRef.current?.hotInstance;
    if (!hot || !duplicates || duplicates.length === 0) return 0;

    let matched = 0;
    const raw = hot.getData();

    for (let r = 0; r < raw.length; r++) {
      const row = raw[r];
      const email = emailColIndex >= 0 ? String(row[emailColIndex] ?? "").trim() : "";
      const phone = phoneColIndex >= 0 ? String(row[phoneColIndex] ?? "").replace(/\D/g, "") : "";
      if (email && duplicates.includes(email)) {
        matched++;
        if (emailColIndex >= 0) hot.setCellMeta(r, emailColIndex, "className", "htInvalid");
      }
      if (phone && duplicates.includes(phone)) {
        matched++;
        if (phoneColIndex >= 0) hot.setCellMeta(r, phoneColIndex, "className", "htInvalid");
      }
    }
    hot.render();
    return matched;
  };

  // Convert hot raw data to payload rows (legacy array-of-arrays converted to contacts[][])
  const preparePayloadChunks = (rawData) => {
    // rawData: array of arrays (as hot.getData())
    // We will return array of chunks, each chunk is array of contact arrays
    const chunks = [];
    const chunkSize = 150;

    // Filter out empty rows
    const filtered = rawData.filter((row) => !row.every((c) => c === null || c === undefined || String(c).trim() === ""));

    for (let i = 0; i < filtered.length; i += chunkSize) {
      chunks.push(filtered.slice(i, i + chunkSize));
    }
    return chunks;
  };

  // process manual import (POST chunk-by-chunk to legacy endpoint)
  const processManualImport = async (chunks) => {
    if (!Array.isArray(chunks) || chunks.length === 0) return;
    setLoading(true);

    try {
      let totalSent = 0;
      for (let idx = 0; idx < chunks.length; idx++) {
        const chunk = chunks[idx];
        totalSent += chunk.length;
        const toDefer = totalSent > 600;

        // build FormData in legacy shape: contacts[idx][j]
        const formData = new FormData();
        chunk.forEach((contact, i) => {
          // contact is an array of cell values; keep original order
          contact.forEach((val, j) => {
            formData.append(`contacts[${i}][${j}]`, val ?? "");
          });
        });

        formData.append("testId", testId || "");
        formData.append("manual", true);
        formData.append("toDefer", toDefer);
        formData.append("corporateType", corporate?.type || "");
        formData.append("recruiterId", corporateId || "");
        formData.append("owner", user?._id || "");
        formData.append("roleName", user?.role || "");

        // send to legacy endpoint
        const res = await xFetch({
          method: "POST",
          path: "/sendTestInvitationEmail.php",
          payload: formData,
          isFormData: true,
        });

        // legacy returns JSON string or object; handle both
        if (!res) {
          throw new Error("Upload failed (no response)");
        }
        // if res.status or res.Status or res === 'Error'
        if (typeof res === "string") {
          // sometimes server returns stringified JSON
          try {
            const parsed = JSON.parse(res);
            if (parsed.status && parsed.status === "Error") {
              throw new Error(parsed.errorDetail || "Upload error");
            }
          } catch (e) {
            // ignore parse error
          }
        } else if (res.status && res.status === "Error") {
          throw new Error(res.errorDetail || "Upload error");
        }
        // else assume ok
      }

      toast.success(`Successfully uploaded ${chunks.reduce((s, c) => s + c.length, 0)} records.`);
      // reset table
      const emptyRow = {};
      fields.forEach((f) => (emptyRow[f.dataField] = ""));
      setData([emptyRow]);

      // call refresh hook if provided
      if (typeof onRefreshTable === "function") onRefreshTable();
    } catch (err) {
      console.error("processManualImport error", err);
      toast.error(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // main submit handler (validations -> duplicate check -> confirm -> upload)
  const submitLeads = async () => {console.log('aaa');
    try {
      const hot = tableRef.current?.hotInstance;
      if (!hot) {
        toast.error("Table not ready");
        return;
      }

      // 1) Validate table
      const validation = await validateHotData();
      if (!validation.ok) {
        toast.error(validation.message);
        return;
      }

      // 2) Duplicate check via backend
      const headerNames = getHeaderNames();
      const emailCol = findIndexForHeader(headerNames, (t) => t.includes("mail"));
      const phoneCol = findIndexForHeader(headerNames, (t) => t.includes("bile") || t.includes("hone"));

      const { emails = [], phones = [], raw } = validation; // raw is hot.getData()
      const dupRes = await checkDuplicatesBackend(emails, phones);
      if (!dupRes.ok) {
        // duplicates found (old API returned ok=false or items)
        const duplicates = dupRes.items || [];
        if (duplicates.length > 0) {
          // highlight duplicates
          const matchedCount = highlightDuplicateInTable(duplicates, emailCol, phoneCol);
          const msg = dupRes.message || `${matchedCount} duplicate(s) found.`;
          // ask confirm
          const ok = window.confirm(`${msg} Would you like to proceed and import anyway?`);
          if (!ok) {
            toast.info("Import aborted due to duplicates.");
            return;
          }
          // If proceed, we still send data (including duplicates)
        } else {
          // If API said not ok but no items, show message
          toast.error(dupRes.message || "Duplicate check failed");
          return;
        }
      }

      // 3) Prepare payload chunks (legacy array-of-arrays)
      const rawData = hot.getData();
      const chunks = preparePayloadChunks(rawData);

      if (chunks.length === 0) {
        toast.error("No valid rows to upload.");
        return;
      }

      // 4) Process import
      await processManualImport(chunks);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to add enquiries");
    }
  };

  /* ---------- HotTable config - use arrays for HotTable (we use object fallback earlier) ---------- */

  // prepare HotTable columns: use fields order for data mapping
  const hotColumns = fields.map((f) => {
    // for dropdown/autocomplete we use type based on field.fieldType if present
    const fld = {};
    fld.data = f.dataField;
    // if fieldType provided and equals 'dropdown' or 'autocomplete', set type or source
    if (f.fieldType && String(f.fieldType).toLowerCase() === "dropdown") {
      fld.type = "dropdown";
      fld.source = f.options || []; // if api provided options
    } else if (f.fieldType && String(f.fieldType).toLowerCase() === "autocomplete") {
      fld.type = "autocomplete";
      fld.source = f.options || [];
    } else {
      fld.type = "text";
    }
    fld.width = 160;
    return fld;
  });

  // Columns headers
  const colHeaders = fields.map((f) => f.displayName ?? f.dataField);

  // HotTable requires array of arrays for loadData usage. We may support both object or arrays.
  // For initial render, convert `data` objects into array of arrays keyed by fields order.
  const initialArrayData = (() => {
    if (!data || data.length === 0) return [[]];
    const order = getFieldOrder();
    const arr = data.map((rowObj) => order.map((k) => rowObj[k] ?? ""));
    return arr;
  })();

  useEffect(() => {
    // if `data` state changes (object rows), update hot grid
    const hot = tableRef.current?.hotInstance;
    if (hot && Array.isArray(data) && data.length > 0 && typeof data[0] === "object" && !Array.isArray(data[0])) {
      const order = getFieldOrder();
      const arr = data.map((rowObj) => order.map((k) => rowObj[k] ?? ""));
      hot.loadData(arr);
    }
  }, [data, fields]);

  /* ---------- Styles for invalid cells ---------- */
  // add CSS for htInvalid (we use style jsx below)
  return (
    <div className="p-6 w-full">
      <h2 className="text-2xl font-semibold mb-2">Add Enquiry</h2>

      <p className="italic text-gray-600 mb-3">
        (Note: Email Id or Mobile is mandatory to add data successfully)
      </p>

      <div className="bg-blue-100 p-3 rounded border text-sm mb-4">
        <b>NOTE:</b> First row of the excel should contain column headers (First Name, Last Name, Email Id / Mobile etc.).
        <button onClick={() => {
          // generate template from fields
          const header = getHeaderNames().join(",");
          const blob = new Blob([header + "\n"], { type: "text/csv" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = "LeadTemplate.csv";
          link.click();
        }} className="text-blue-700 underline ml-1">
          Download Template
        </button>
      </div>

      <div className="flex justify-between items-center mb-3">
        <div className="flex gap-3">

            <button
                onClick={onClose}
                className="
                    px-5 py-2.5 
                    bg-white 
                    border border-gray-300 
                    rounded-xl 
                    shadow-sm 
                    text-gray-700 
                    hover:bg-gray-100 
                    transition-all 
                    duration-200
                "
            >
                ⬅ Back
            </button>

            <label
                className="
                    px-5 py-2.5 
                    text-white 
                    rounded-xl 
                    cursor-pointer 
                    shadow-sm 
                    bg-pink-500 
                    hover:bg-pink-600
                    transition-all 
                    duration-200
                "
            >
                Import Excel
                <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImportExcel} />
            </label>

            <button
                onClick={submitLeads}
                disabled={loading}
                className="
                    px-5 py-2.5 
                    rounded-xl 
                    text-white 
                    bg-green-600 
                    hover:bg-green-700 
                    disabled:opacity-60 
                    disabled:cursor-not-allowed
                    transition-all 
                    duration-200
                    shadow-sm
                "
            >
                {loading ? "Adding..." : "Add Enquiry"}
            </button>

        </div>
      </div>

      <div onClick={() => {
        // add empty row in hot grid
        const hot = tableRef.current?.hotInstance;
        if (!hot) return;
        const at = hot.countRows();
        hot.alter("insert_row", at, 1);
        hot.updateSettings({ viewportRowRenderingOffset: at + 1 });
      }} className="w-full bg-[#EA4C89] text-white text-center py-1 font-semibold cursor-pointer rounded">
        + Add Row
      </div>

      <div className="mt-3 border rounded overflow-hidden shadow">
        <HotTable
          ref={tableRef}
          data={initialArrayData}
          colHeaders={colHeaders}
          columns={columns}
          rowHeaders={true}
          licenseKey="non-commercial-and-evaluation"
          copyPaste={{
            copyPasteEnabled: true,
            rowsLimit: 10000,
            columnsLimit: fields.length || 100,
          }}
          pasteMode="shift_down"
          allowInsertRow={true}
          minSpareRows={1}
          manualColumnResize
          manualRowResize
          contextMenu={["copy", "paste", "remove_row", "row_above", "row_below"]}
          fillHandle={true}
          stretchH="all"
          height="420"
          afterChange={(changes, source) => {
            // optional: real-time small validations on change could go here
            if (!changes || changes.length === 0) return;
            const hot = tableRef.current?.hotInstance;
            if (!hot) return;
            // remove invalid marking for changed cells
            changes.forEach(([row, prop, oldVal, newVal]) => {
              const colIndex = typeof prop === "number" ? prop : hot.propToCol(prop);
              hot.setCellMeta(row, colIndex, "className", "");
            });
            hot.render();
          }}
        />
      </div>

      <style jsx>{`
        .htInvalid {
          background: #ffe6e6 !important;
          box-shadow: inset 0 0 0 2px rgba(255, 77, 103, 0.12);
        }

        /* Keep your existing styles as well */
        .custom-hot .ht_clone_top th,
        .custom-hot th {
          background: #ff4fa3 !important;
          color: white !important;
          font-weight: 600;
        }

        .custom-hot td {
          background: #fafafa !important;
        }
      `}</style>
    </div>
  );
}
