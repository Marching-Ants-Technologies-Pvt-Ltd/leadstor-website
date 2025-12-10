"use client";

import { useEffect, useRef, useState } from "react";
import Handsontable from "handsontable";
import { HotTable } from "@handsontable/react";
import { CopyPaste } from "handsontable/plugins/copyPaste";
import "handsontable/dist/handsontable.full.min.css";

import * as XLSX from "xlsx";

import { xFetch } from "@/utility/xFetch";
import Spinner from "@/components/common/Spinner";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/ReactToastify.min.css";
import { Corporate, Test, User } from "@/utility/TinyDB";

export default function AddLeadDynamic({ onClose, onRefreshTable }) {
  const corporate = Corporate || {};
  const test = Test || {};
  const user = User || {};

  const corporateId = corporate?._id;
  const testId = test?._id || null;

  const tableRef = useRef(null);

  const [fields, setFields] = useState([]); // dynamic columns metadata from /services/profile/columns or fallback
  const [data, setData] = useState([{}]); // array-of-objects rows (Handsontable will accept objects when columns.data is set)

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
      const res = await xFetch({ path: "/services/profile/columns" });

      if (res && Array.isArray(res)) {
        // Remove unwanted items
        let filtered = res.filter(
          (f) => !["action", "updateTime", "leadProbability"].includes(f.dataField)
        );

        // Ensure lastName exists; inject if missing (as requested earlier)
        const hasLastName = filtered.some((f) => String(f.dataField).toLowerCase() === "lastname");
        if (!hasLastName) {
          const lastNameField = {
            fieldId: "randornum",
            fieldName: "Last Name",
            displayName: "Last Name",
            dataField: "lastName",
            dataFormatter: "blankFormatter",
            fieldType: "text",
          };
          filtered.splice(1, 0, lastNameField); // insert at 2nd position
        }

        setFields(filtered);

        // create empty row mapped to filtered fields
        const empty = {};
        filtered.forEach((f) => {
          empty[f.dataField] = "";
        });

        setData([empty]);
      } else {
        toast.error("Unable to load fields. Using fallback.");
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

  // ---------- ADD ROW (fixed) ----------
  // Append an empty row to the `data` state and load into HOT.
  const addRow = () => {
    // Build empty row shape from fields
    const emptyRow = {};
    if (!fields || fields.length === 0) {
      // if fields not loaded, insert a generic row
      emptyRow["firstName"] = "";
      emptyRow["lastName"] = "";
      emptyRow["email"] = "";
      emptyRow["mobile"] = "";
    } else {
      fields.forEach((f) => {
        emptyRow[f.dataField] = "";
      });
    }

    setData((prev) => {
      const next = [...prev, emptyRow];
      // Immediately reflect in HOT instance
      const hot = tableRef.current?.hotInstance;
      try {
        if (hot) {
          hot.loadData(next);
          // focus/select the first cell of the new row (last row)
          const lastRowIndex = next.length - 1;
          // select first visible column (0)
          setTimeout(() => {
            try {
              hot.selectCell(lastRowIndex, 0);
              hot.render();
            } catch (e) {
              // ignore selection errors
            }
          }, 50);
        }
      } catch (e) {
        console.warn("Failed to loadData/selectCell after addRow:", e);
      }
      return next;
    });
  };

  /* ------------------------
     HANDSONTABLE COLUMNS
  ------------------------ */

  function getColumnDefinition(field) {
    switch (field.dataField) {
      case "source":
        return {
          data: field.dataField,
          type: "autocomplete",
          source: sources.map((s) => s.source),
          strict: false,
          allowInvalid: true,
        };

      case "course":
        return {
          data: field.dataField,
          type: "autocomplete",
          source: courses.map((c) => c.course),
          strict: false,
        };

      case "status":
        return {
          data: field.dataField,
          type: "autocomplete",
          source: statuses.map((s) => s.status),
          strict: false,
        };

      case "assignedUserId":
        return {
          data: field.dataField,
          type: "autocomplete",
          source: users.map((u) => u.name),
          strict: false,
        };

      default:
        return {
          data: field.dataField,
          type: field.dataType || "text",
        };
    }
  }

  // hotColumns uses `data` keys so loading array-of-objects will work correctly
  const hotColumns = fields.map((f) => {
    const fld = {};
    fld.data = f.dataField;
    if (f.fieldType && String(f.fieldType).toLowerCase() === "dropdown") {
      fld.type = "dropdown";
      fld.source = f.options || [];
    } else if (f.fieldType && String(f.fieldType).toLowerCase() === "autocomplete") {
      fld.type = "autocomplete";
      fld.source = f.options || [];
    } else {
      // allow override by getColumnDefinition for known fields
      const def = getColumnDefinition(f);
      fld.type = def.type || "text";
      if (def.source) fld.source = def.source;
    }
    fld.width = 160;
    return fld;
  });

  const columns = fields.map((f) => ({
    width: 150,
    ...getColumnDefinition(f),
  }));

  const colHeaders = fields.map((f) => f.displayName ?? f.fieldName ?? f.dataField);

  /* ---------- Helpers: validators like old code ---------- */

  const emailRegex = /.+@.+/;
  const makeMobileRegex = () => {
    const cc = corporate?.country_code || "IN";
    if (cc !== "IN") {
      return /^(.+)?$/im; // relaxed (fallback)
    } else {
      return /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
    }
  };

  const isValidEmail = (v) => {
    if (!v && v !== "") return false;
    if (v === "" || v == null) return true;
    return emailRegex.test(String(v));
  };

  /* ---------- Utilities ---------- */

  const getHeaderNames = () => fields.map((f) => f.displayName ?? f.fieldName ?? f.dataField);
  const getFieldOrder = () => fields.map((f) => f.dataField);

  const findIndexForHeader = (names, predicate) => {
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
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      if (!rows.length) {
        toast.error("The sheet is empty!");
        return;
      }

      const sheetHeaders = Object.keys(rows[0]).map((h) => h.trim().toLowerCase());
      const hasEmail = sheetHeaders.some((h) => h.includes("mail"));
      const hasMobile = sheetHeaders.some((h) => h.includes("mobile") || h.includes("phone"));

      if (!hasEmail && !hasMobile) {
        toast.error('Excel must contain an "Email" or "Mobile" column.');
        return;
      }

      // Build rows mapped to your fields (array of objects)
      const newRows = rows.map((row) => {
        const obj = {};
        fields.forEach((f) => {
          const df = f.dataField;
          const candidates = [f.displayName, f.fieldName, f.dataField]
            .filter(Boolean)
            .map((s) => String(s).toLowerCase());

          let matchedHeader = null;
          for (const hdr of Object.keys(row)) {
            const lower = hdr.toLowerCase();
            if (candidates.some((c) => lower.includes(c))) {
              matchedHeader = hdr;
              break;
            }
          }

          obj[df] = matchedHeader ? row[matchedHeader] : "";
        });
        return obj;
      });

      // Load into Handsontable as array-of-objects (columns have data keys)
      const hot = tableRef.current?.hotInstance;
      if (hot) {
        hot.loadData(newRows);
      }

      // Sync React state (important for submit)
      setData(newRows.length ? newRows : [fields.reduce((a, f) => ((a[f.dataField] = ""), a), {})]);

      toast.success("Excel imported! Please review before submitting.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to import Excel.");
    } finally {
      if (e.target) e.target.value = "";
    }
  };

  // Normalize mobile: remove whitespace, parentheses, dashes, dots; keep leading + if present
  const normalizeMobile = (raw) => {
    if (!raw) return "";
    return String(raw).replace(/[\s\-\.\(\)]/g, "").trim();
  };

  const isValidMobile = (raw, countryCode = "IN") => {
    const v = normalizeMobile(raw);
    if (v === "") return true; // empty allowed

    // Handle + prefix
    let digits = v.startsWith("+") ? v.slice(1) : v;

    // Must be digits only
    if (!/^\d+$/.test(digits)) return false;

    if (countryCode === "IN") {
      if (digits.startsWith("91") && digits.length === 12) {
        const local = digits.slice(2);
        return local.length === 10;
      }
      if (digits.startsWith("0") && digits.length === 11) {
        const local = digits.slice(1);
        return local.length === 10;
      }
      if (digits.length === 10) return true;
      return false;
    }
    return digits.length >= 7 && digits.length <= 15;
  };

  /* ---------- Validation + Duplicate check + Upload ---------- */

  const validateHotData = async () => {
    const hot = tableRef.current?.hotInstance;
    if (!hot) return { ok: false, message: "Table not ready" };

    const headerNames = getHeaderNames();

    const emailCol = findIndexForHeader(headerNames, (t) => t.includes("mail"));
    const mobileCol = findIndexForHeader(headerNames, (t) => t.includes("mobile"));
    const courseCol = findIndexForHeader(headerNames, (t) => t.includes("course") || t.includes("service") || t.includes("preferred course"));
    const sourceCol = findIndexForHeader(headerNames, (t) => t.includes("source"));
    const ownerCol = findIndexForHeader(headerNames, (t) => t.includes("owner"));
    const statusCol = findIndexForHeader(headerNames, (t) => t.includes("status"));
    const firstNameCol = findIndexForHeader(headerNames, (t) => t.includes("first"));

    const raw = hot.getSourceData();

    const getCellValue = (rowData, colIndex) => {
      const key = fields[colIndex]?.dataField;
      return String(rowData?.[key] ?? "").trim();
    };

    // CLEAR OLD HIGHLIGHTS
    for (let r = 0; r < raw.length; r++) {
      for (let c = 0; c < headerNames.length; c++) {
        hot.setCellMeta(r, c, "className", "");
      }
    }
    hot.render();

    let emails = [];
    let phones = [];

    for (let r = 0; r < raw.length; r++) {
      const row = raw[r];

      // SKIP completely empty row
      if (Object.values(row).every((v) => !String(v).trim())) continue;

      // FIRST NAME REQUIRED
      if (firstNameCol >= 0) {
        const firstName = getCellValue(row, firstNameCol);
        if (!firstName) {
          hot.setCellMeta(r, firstNameCol, "className", "htInvalid");
          hot.render();
          return {
            ok: false,
            message: `First Name is required in row ${r + 1}`,
          };
        }
      }

      // EMAIL VALIDATION
      if (emailCol >= 0) {
        const email = getCellValue(row, emailCol);
        if (!isValidEmail(email)) {
          hot.setCellMeta(r, emailCol, "className", "htInvalid");
          hot.render();
          return {
            ok: false,
            message: `Invalid Email '${email}' in row ${r + 1}`,
          };
        }
        if (email) emails.push(email);
      }

      // MOBILE VALIDATION
      if (mobileCol >= 0) {
        const rawMobile = getCellValue(row, mobileCol);
        const cleanedMobile = normalizeMobile(rawMobile);
        const cc = (corporate?.country_code || "IN").toUpperCase();

        if (!isValidMobile(cleanedMobile, cc)) {
          hot.setCellMeta(r, mobileCol, "className", "htInvalid");
          hot.render();
          return {
            ok: false,
            message: `Invalid Mobile '${rawMobile}' in row ${r + 1}`,
          };
        }

        if (cleanedMobile) {
          phones.push(cleanedMobile.replace(/^\+/, "").replace(/\D/g, ""));
        }
      }

      // SOURCE VALIDATION
      if (sourceCol >= 0) {
        const val = getCellValue(row, sourceCol);
        if (val && !sources.some((s) => s.source?.toLowerCase() === val.toLowerCase())) {
          hot.setCellMeta(r, sourceCol, "className", "htInvalid");
          hot.render();
          return {
            ok: false,
            message: `Invalid Source '${val}' in row ${r + 1}`,
          };
        }
      }

      // COURSE VALIDATION
      if (courseCol >= 0) {
        const val = getCellValue(row, courseCol);
        if (val && !courses.some((c) => c.course?.toLowerCase() === val.toLowerCase())) {
          hot.setCellMeta(r, courseCol, "className", "htInvalid");
          hot.render();
          return {
            ok: false,
            message: `Invalid Course '${val}' in row ${r + 1}`,
          };
        }
      }

      // OWNER VALIDATION
      if (ownerCol >= 0) {
        const val = getCellValue(row, ownerCol);
        if (val && !users.some((u) => u.name?.toLowerCase() === val.toLowerCase())) {
          hot.setCellMeta(r, ownerCol, "className", "htInvalid");
          hot.render();
          return {
            ok: false,
            message: `Invalid Owner '${val}' in row ${r + 1}`,
          };
        }
      }

      // STATUS VALIDATION
      if (statusCol >= 0) {
        const val = getCellValue(row, statusCol);
        if (val && !statuses.some((s) => s.status?.toLowerCase() === val.toLowerCase())) {
          hot.setCellMeta(r, statusCol, "className", "htInvalid");
          hot.render();
          return {
            ok: false,
            message: `Invalid Status '${val}' in row ${r + 1}`,
          };
        }
      }
    }

    return { ok: true, emails, phones, raw };
  };

  async function checkDuplicatesBackend(emails = [], phones = []) {
    if ((!emails || emails.length === 0) && (!phones || phones.length === 0)) {
      return { ok: true, message: "Nothing to check", items: [] };
    }
    try {
      const payload = { emails: emails.join(","), phones: phones.join(","), testId: testId || "" };
      const res = await xFetch({ method: "POST", path: "/services/invite/checkDuplicatesOnManualImport", payload });
      if (!res) return { ok: false, message: "Duplicate check failed", items: [] };
      if (res.error) return { ok: false, message: res.error || "Duplicates error", items: res.items || [] };
      return { ok: true, message: res.message || "Checked", items: res.items || [] };
    } catch (err) {
      console.error("Duplicate check failed", err);
      return { ok: false, message: "Unable to check duplicates", items: [] };
    }
  }

  const highlightDuplicateInTable = (duplicates = [], emailColIndex, phoneColIndex) => {
    const hot = tableRef.current?.hotInstance;
    if (!hot || !duplicates || duplicates.length === 0) return 0;

    let matched = 0;
    const raw = hot.getData();

    for (let r = 0; r < raw.length; r++) {
      const row = raw[r];
      const email = emailColIndex >= 0 ? (typeof row === "object" && !Array.isArray(row) ? String(row[fields[emailColIndex]?.dataField] ?? "").trim() : String(row[emailColIndex] ?? "").trim()) : "";
      const phone = phoneColIndex >= 0 ? (typeof row === "object" && !Array.isArray(row) ? String(row[fields[phoneColIndex]?.dataField] ?? "").replace(/\D/g, "") : String(row[phoneColIndex] ?? "").replace(/\D/g, "")) : "";
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

  const preparePayloadChunks = (rawData) => {
    const chunks = [];
    const chunkSize = 150;

    // convert objects to arrays according to field order if needed
    const order = getFieldOrder();
    const filtered = rawData
      .map((row) => (Array.isArray(row) ? row : order.map((k) => row[k] ?? "")))
      .filter((rowArr) => !rowArr.every((c) => c === null || c === undefined || String(c).trim() === ""));

    for (let i = 0; i < filtered.length; i += chunkSize) {
      chunks.push(filtered.slice(i, i + chunkSize));
    }
    return chunks;
  };

  const processManualImport = async (c) => {
      const hot = tableRef.current?.hotInstance;
      if (!hot) {
        toast.error("Table not ready!");
        return;
      }

      // Step 1: Validation (existing logic)
      const validation = await validateHotData();
      if (!validation.ok) {
        toast.error(validation.message);
        return;
      }

      const rawRows = validation.raw; // [{firstName:'', lastName:'', ...}, ...]

      // Step 2: Remove completely empty rows
      const cleanedRows = rawRows.filter((row) =>
        Object.values(row).some((v) => String(v).trim() !== "")
      );

      if (cleanedRows.length === 0) {
        toast.error("No valid rows to import!");
        return;
      }

      // Step 3: Convert to "dataField → value" objects
      const contacts = cleanedRows.map((row) => {
        const obj = {};
        fields.forEach((f) => {
          obj[f.dataField] = row[f.dataField] ?? "";
        });
        return obj;
      });

      // Step 4: Chunking contacts (like previous logic)
      const CHUNK_SIZE = 100;
      const chunks = [];
      for (let i = 0; i < contacts.length; i += CHUNK_SIZE) {
        chunks.push(contacts.slice(i, i + CHUNK_SIZE));
      }

      // Step 5: Submit each chunk to Add Enquiry API
      let successCount = 0;
      let totalSent = 0;
      
      for (let i = 0; i < chunks.length; i++) {
        
        const chunk = chunks[i];
        totalSent += chunk.length;
        const toDefer = totalSent > 600;

        const formData = new FormData();
        formData.append("contacts", JSON.stringify(chunk));
        formData.append("testId", testId || "");
        formData.append("manual", true);
        formData.append("toDefer", toDefer);
        formData.append("owner", User?._id || "");
        formData.append("roleName", User?.role || "");
        

        try {
          const res = await xFetch({
            path: "/services/invite/sendTestInvitationEmail",
            method: "POST",
            payload: formData,
            isFormData:true,
          });

          if (res?.status == 'success') {
            successCount += chunks[i].length;
            toast.success(`Uploaded chunk ${i + 1}/${chunks.length}`);
            toast.success(`Successfully imported ${successCount} Leads`);
            onRefreshTable?.();
            onClose?.();

          } else {
            toast.error(`Chunk ${i + 1} failed`);
          }
        } catch (err) {
          console.error("Chunk Upload Error", err);
          toast.error(`Chunk ${i + 1} failed!`);
        } finally {
          setLoading(false); // 👉 STOP LOADER ALWAYS
        }
      }
  }

  const submitLeads = async () => {
    try {
      const hot = tableRef.current?.hotInstance;
      if (!hot) {
        toast.error("Table not ready");
        return;
      }

      const validation = await validateHotData();
      if (!validation.ok) {
        toast.error(validation.message);
        return;
      }

      const headerNames = getHeaderNames();
      const emailCol = findIndexForHeader(headerNames, (t) => t.includes("mail"));
      const phoneCol = findIndexForHeader(headerNames, (t) => t.includes("bile") || t.includes("hone"));

      const { emails = [], phones = [], raw } = validation;
      const dupRes = await checkDuplicatesBackend(emails, phones);
      if (!dupRes.ok) {
        const duplicates = dupRes.items || [];
        if (duplicates.length > 0) {
          const matchedCount = highlightDuplicateInTable(duplicates, emailCol, phoneCol);
          const msg = dupRes.message || `${matchedCount} duplicate(s) found.`;
          const ok = window.confirm(`${msg} Would you like to proceed and import anyway?`);
          if (!ok) {
            toast.info("Import aborted due to duplicates.");
            return;
          }
        } else {
          toast.error(dupRes.message || "Duplicate check failed");
          return;
        }
      }

      const rawData = hot.getData();
      const chunks = preparePayloadChunks(rawData);

      if (chunks.length === 0) {
        toast.error("No valid rows to upload.");
        return;
      }

      await processManualImport(chunks);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to add enquiries");
    }
  };

  // When `data` (array of objects) changes we load into HOT so UI stays in sync
  useEffect(() => {
    const hot = tableRef.current?.hotInstance;
    if (hot && Array.isArray(data)) {
      try {
        hot.loadData(data);
      } catch (e) {
        console.warn("hot.loadData failed in useEffect:", e);
      }
    }
  }, [data, fields]);

  const downloadTemplate = async () => {
    try {
      toast.info("Preparing template…");

      const res = await xFetch({
        path: "/services/invite/exportTemplate",
        method: "POST",
        payload: {
          columns: colHeaders,
        },
        responseType: "blob",
      });

      if (!res) {
        toast.error("Failed to download file");
        return;
      }

      const blob = new Blob([res], { type: "application/octet-stream" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Leads-Enquiry-Template-${Corporate?._id}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Error downloading template");
    }
  };

  return (
    <div className="p-6 w-full">
      
      <ToastContainer position="top-right" />

      <h2 className="text-2xl font-semibold mb-2">Add Enquiry</h2>

      <p className="italic text-gray-600 mb-3">
        (Note: Email Id or Mobile is mandatory to add data successfully)
      </p>

      <div className="bg-blue-100 p-3 rounded border text-sm mb-4">
        <b>NOTE:</b> First row of the excel should contain column headers (First Name, Last Name, Email Id / Mobile etc.).
        <button onClick={downloadTemplate} className="text-blue-700 underline ml-1">
          Download Template
        </button>
      </div>

      <div className="flex justify-between items-center mb-3">
        <div className="flex gap-3">
          <button onClick={onClose} className="px-5 py-2.5 bg-white border border-gray-300 rounded-xl shadow-sm text-gray-700 hover:bg-gray-100 transition-all duration-200">⬅ Back</button>
          <label className="px-5 py-2.5 rounded-xl cursor-pointer shadow-sm hover:bg-pink-400 transition-all duration-200 color-cls">
            Import Excel
            <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImportExcel} />
          </label>

          <button onClick={submitLeads} disabled={loading} className="px-5 py-2.5 rounded-xl text-white bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-sm">
            {loading ? "Adding..." : "Add Enquiry"}
          </button>
        </div>
      </div>

      <div className="w-full text-center py-1 cursor-pointer rounded mb-3 color-cls" onClick={addRow}>
          + Add Row
      </div>

      <div className="mt-3 border rounded overflow-hidden shadow">
        <HotTable
          ref={tableRef}
          data={data}
          colHeaders={colHeaders}
          columns={columns}
          rowHeaders={true}
          licenseKey="non-commercial-and-evaluation"
          copyPaste={{ copyPasteEnabled: true, rowsLimit: 10000, columnsLimit: fields.length || 100 }}
          pasteMode="shift_down"
          manualColumnResize
          manualRowResize
          contextMenu={["copy", "paste", "remove_row", "row_above", "row_below", "insert_row"]}
          fillHandle={true}
          stretchH="all"
          height="420"
          minSpareRows={0}
          allowInsertRow={false}
          autoWrapRow={false}
          autoWrapCol={false}
          afterChange={(changes, source) => {
            if (!changes || changes.length === 0) return;
            const hot = tableRef.current?.hotInstance;
            if (!hot) return;
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

        .custom-hot .ht_clone_top th,
        .custom-hot th {
          background: #f1bbeaff !important;
          color: #475569 !important;
          font-weight: 600;
        }

        .custom-hot td {
          background: #fafafa !important;
        }
        .htInvalidCell {
          background: #ffdddd !important;
          border: 2px solid #ff4d4d !important;
        }
        .color-cls{
          background: #f1bbeaff !important;
          color: #121213ff !important;
        }
      `}</style>
    </div>
  );
}
