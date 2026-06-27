import { useState } from "react";

const API_BASE = "http://localhost:4000/api";

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh",
];

const VEHICLE_CATEGORIES = ["LCV","MCV","HCV","Trailer","Tanker","Tipper","Bus","Mini Bus","Other"];

const TAX_EXPIRY_FIELDS = [
  { key: "passingDate",      label: "Passing Date" },
  { key: "statePermitDate",  label: "State Permit Date" },
  { key: "insuranceDate",    label: "Insurance Date" },
  { key: "taxDate",          label: "Tax Date" },
  { key: "fitnessDate",      label: "Fitness Date" },
  { key: "nPermitDate",      label: "N. Permit Date" },
  { key: "pucDate",          label: "PUC Date" },
  { key: "calibrationDate",  label: "Calibration Date" },
  { key: "explosiveDate",    label: "Explosive Date" },
  { key: "halfYearDate",     label: "Half Year Date" },
  { key: "yearDate",         label: "Year Date" },
  { key: "hydroDate",        label: "Hydro Date" },
  { key: "authorisationDate",label: "Authorisation Date" },
  { key: "otherDate",        label: "Other Date" },
];

const initial = {
  vehicleNo: "",
  ownership: "own",          // own | attach
  vehicleOwner: "",
  ownerPanNo: "",
  ownerMobile: "",
  driverName: "",
  driverMobile: "",
  category: "",
  rcBook: false,
  tdsForm: false,
  // Vehicle specs
  billNo: "",
  model: "",
  purchaseDate: "",
  registerDate: "",
  engineNo: "",
  trChassisNo: "",
  chassisNo: "",
  tankNo: "",
  emptyWeight: 0,
  size: "",
  passingWeight: 0,
  stdAverage: 0,
  // Loan
  purchaseAmt: 0,
  loanAmount: 0,
  loanAcName: "",
  bankHf: "No",
  installmentAmt: 0,
  installmentDate: "",
  paymentAcName: "",
  chargeAmt: 0.00,
  chargeDate: "",
  // Tax Expiry Dates
  taxExpiry: Object.fromEntries(TAX_EXPIRY_FIELDS.map(f => [f.key, ""])),
  // Documents
  documents: [],
};

export default function VehicleForm() {
  const [form, setForm]           = useState(initial);
  const [errors, setErrors]       = useState({});
  const [status, setStatus]       = useState(null); // null | loading | success | error
  const [serverErrors, setServerErrors] = useState([]);
  const [docFiles, setDocFiles]   = useState([]);
  const [savedId, setSavedId]     = useState(null);

  // ── Setters ────────────────────────────────────────────────────────────────
  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: "" })); };
  const setTax = (k, v) => setForm(f => ({ ...f, taxExpiry: { ...f.taxExpiry, [k]: v } }));

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.vehicleNo.trim())    e.vehicleNo    = "Vehicle number is required.";
    if (!form.vehicleOwner.trim()) e.vehicleOwner = "Vehicle owner is required.";
    if (!form.category)            e.category     = "Category is required.";
    if (form.ownerMobile && !/^\+?[0-9]{10,15}$/.test(form.ownerMobile.replace(/\s/g, "")))
      e.ownerMobile = "Invalid mobile number.";
    return e;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const clientErrors = validate();
    if (Object.keys(clientErrors).length) { setErrors(clientErrors); return; }

    setStatus("loading"); setServerErrors([]);
    try {
      const res  = await fetch(`${API_BASE}/vehicles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setServerErrors(data.errors || ["Something went wrong."]); setStatus("error"); return; }

      const vid = data.data.id;
      setSavedId(vid);

      if (docFiles.length) {
        const fd = new FormData();
        docFiles.forEach(f => fd.append("documents", f));
        await fetch(`${API_BASE}/vehicles/${vid}/documents`, { method: "POST", body: fd });
      }

      setStatus("success");
      setForm(initial);
      setDocFiles([]);
    } catch {
      setServerErrors(["Network error. Is the backend running?"]);
      setStatus("error");
    }
  };

  const handleReset = () => { setForm(initial); setErrors({}); setStatus(null); setServerErrors([]); setDocFiles([]); };

  // ── Reusable UI ────────────────────────────────────────────────────────────
  const Field = ({ label, error, children, required, half, third }) => (
    <div style={{ ...S.field, ...(half ? S.half : {}), ...(third ? S.third : {}) }}>
      <label style={S.label}>{label}{required && <span style={S.req}> *</span>}</label>
      {children}
      {error && <p style={S.ferr}>{error}</p>}
    </div>
  );

  const Inp = ({ fkey, type = "text", placeholder, min }) => (
    <input
      type={type}
      value={form[fkey]}
      min={min}
      onChange={e => set(fkey, type === "number" ? parseFloat(e.target.value) || 0 : e.target.value)}
      placeholder={placeholder}
      style={{ ...S.input, ...(errors[fkey] ? S.inputErr : {}) }}
    />
  );

  const Sel = ({ fkey, options, placeholder }) => (
    <select value={form[fkey]} onChange={e => set(fkey, e.target.value)} style={{ ...S.input, ...(errors[fkey] ? S.inputErr : {}) }}>
      <option value="">{placeholder || "Select…"}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );

  const Chk = ({ fkey, label }) => (
    <label style={S.checkRow}>
      <input type="checkbox" checked={form[fkey]} onChange={e => set(fkey, e.target.checked)} style={{ accentColor: "#1565c0", width: 15, height: 15 }} />
      <span style={{ fontSize: 13, color: "#444" }}>{label}</span>
    </label>
  );

  const SectionHead = ({ children, color = "#1565c0" }) => (
    <div style={{ ...S.secHead, borderLeftColor: color, color }}>{children}</div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={S.page}>
      <div style={S.card}>

        {/* ── Header ── */}
        <div style={S.header}>
          <div>
            <div style={S.hTitle}>🚛 Vehicle Registration</div>
            <div style={S.hSub}>Fleet Management System</div>
          </div>
          <button style={S.docBtn} onClick={() => document.getElementById("docInput").click()}>
            📄 Documents {docFiles.length > 0 && <span style={S.docBadge}>{docFiles.length}</span>}
          </button>
          <input id="docInput" type="file" multiple accept=".pdf,.jpg,.jpeg,.png" style={{ display: "none" }}
            onChange={e => setDocFiles(Array.from(e.target.files))} />
        </div>

        {/* ── Vehicle Identity Bar ── */}
        <div style={S.identBar}>
          <div style={{ flex: 2, minWidth: 200 }}>
            <label style={{ ...S.label, color: "#fff", marginBottom: 5 }}>Vehicle No. *</label>
            <input value={form.vehicleNo} onChange={e => set("vehicleNo", e.target.value)}
              placeholder="MH02-EL-5510" style={S.identInput} />
            {errors.vehicleNo && <p style={{ ...S.ferr, color: "#ffd6d6" }}>{errors.vehicleNo}</p>}
          </div>
          {/* Own / Attach toggle */}
          <div style={S.ownershipRow}>
            {["own", "attach"].map(v => (
              <button key={v} onClick={() => set("ownership", v)}
                style={{ ...S.ownerBtn, ...(form.ownership === v ? S.ownerBtnActive : {}) }}>
                {v === "own" ? "Own" : "Attach"}
              </button>
            ))}
          </div>
        </div>

        <div style={S.body}>
          <div style={S.leftCol}>

            {/* ── Owner Info ── */}
            <SectionHead>Owner Information</SectionHead>
            <Field label="Vehicle Owner" required error={errors.vehicleOwner}>
              <input value={form.vehicleOwner} onChange={e => set("vehicleOwner", e.target.value)}
                placeholder="AJS Logistics and Sand Cargo Pvt Ltd"
                style={{ ...S.input, ...(errors.vehicleOwner ? S.inputErr : {}) }} />
            </Field>
            <div style={S.row}>
              <Field label="Owner PAN No." half>
                <Inp fkey="ownerPanNo" placeholder="ABCDE1234F" />
              </Field>
              <Field label="Owner Mobile" half error={errors.ownerMobile}>
                <Inp fkey="ownerMobile" placeholder="+91 9876543210" />
              </Field>
            </div>
            <div style={S.row}>
              <Field label="Driver Name" half>
                <Inp fkey="driverName" placeholder="Driver full name" />
              </Field>
              <Field label="Driver Mobile" half>
                <Inp fkey="driverMobile" placeholder="+91 9876543210" />
              </Field>
            </div>
            <Field label="Category" required error={errors.category}>
              <Sel fkey="category" options={VEHICLE_CATEGORIES} placeholder="Select category" />
            </Field>

            {/* Checkboxes */}
            <div style={S.checkGroup}>
              <Chk fkey="rcBook"  label="RC Book" />
              <Chk fkey="tdsForm" label="TDS Form" />
            </div>

            {/* ── Vehicle Specs ── */}
            <SectionHead color="#0277bd">Vehicle Specifications</SectionHead>
            <div style={S.row}>
              <Field label="Bill No." half><Inp fkey="billNo" placeholder="Bill number" /></Field>
              <Field label="Model" half><Inp fkey="model" placeholder="e.g. TATA 407" /></Field>
            </div>
            <div style={S.row}>
              <Field label="Purchase Date" half><Inp fkey="purchaseDate" type="date" /></Field>
              <Field label="Register Date" half><Inp fkey="registerDate" type="date" /></Field>
            </div>
            <div style={S.row}>
              <Field label="Engine No." half><Inp fkey="engineNo" placeholder="Engine number" /></Field>
              <Field label="Tr. Chassis No." half><Inp fkey="trChassisNo" placeholder="Trailer chassis no." /></Field>
            </div>
            <div style={S.row}>
              <Field label="Chassis No." half><Inp fkey="chassisNo" placeholder="Chassis number" /></Field>
              <Field label="Tank No." half><Inp fkey="tankNo" placeholder="Tank number" /></Field>
            </div>
            <div style={S.row}>
              <Field label="Empty Weight (kg)" third><Inp fkey="emptyWeight" type="number" min="0" /></Field>
              <Field label="Size" third><Inp fkey="size" placeholder='e.g. 20ft' /></Field>
              <Field label="Passing Weight (kg)" third><Inp fkey="passingWeight" type="number" min="0" /></Field>
            </div>
            <div style={S.row}>
              <Field label="Std. Average (km/l)" half><Inp fkey="stdAverage" type="number" min="0" /></Field>
            </div>

            {/* ── Loan / Finance ── */}
            <SectionHead color="#6a1b9a">Loan & Finance</SectionHead>
            <div style={S.row}>
              <Field label="Purchase Amt (₹)" half><Inp fkey="purchaseAmt" type="number" min="0" /></Field>
              <Field label="Loan Amount (₹)" half><Inp fkey="loanAmount" type="number" min="0" /></Field>
            </div>
            <div style={S.row}>
              <Field label="Loan A/C Name" half><Inp fkey="loanAcName" placeholder="Bank / NBFC name" /></Field>
              <Field label="Bank HF" half>
                <select value={form.bankHf} onChange={e => set("bankHf", e.target.value)} style={S.input}>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </Field>
            </div>
            <div style={S.row}>
              <Field label="Installment Amt (₹)" half><Inp fkey="installmentAmt" type="number" min="0" /></Field>
              <Field label="Installment Date" half><Inp fkey="installmentDate" type="date" /></Field>
            </div>
            <Field label="Payment A/C Name"><Inp fkey="paymentAcName" placeholder="Account name" /></Field>
            <div style={S.row}>
              <Field label="Charge Amt (₹)" half><Inp fkey="chargeAmt" type="number" min="0" /></Field>
              <Field label="Charge Date" half><Inp fkey="chargeDate" type="date" /></Field>
            </div>

            {/* Documents list */}
            {docFiles.length > 0 && (
              <div style={S.fileList}>
                {docFiles.map((f, i) => (
                  <div key={i} style={S.fileItem}>
                    📄 {f.name}
                    <button style={S.fileRemove} onClick={() => setDocFiles(p => p.filter((_, j) => j !== i))}>✕</button>
                  </div>
                ))}
              </div>
            )}

          </div>{/* end leftCol */}

          {/* ── Tax Expiry Dates (right column) ── */}
          <div style={S.rightCol}>
            <SectionHead color="#c62828">Tax Expiry Dates</SectionHead>
            {TAX_EXPIRY_FIELDS.map(({ key, label }) => (
              <div key={key} style={S.taxRow}>
                <label style={S.taxLabel}>{label}</label>
                <input type="date" value={form.taxExpiry[key]} onChange={e => setTax(key, e.target.value)}
                  style={S.taxInput} />
                {/* Expiry indicator */}
                {form.taxExpiry[key] && (
                  <span style={{
                    ...S.expiryDot,
                    background: new Date(form.taxExpiry[key]) < new Date() ? "#e53935" :
                                new Date(form.taxExpiry[key]) < new Date(Date.now() + 30*24*60*60*1000) ? "#fb8c00" : "#43a047"
                  }} title={new Date(form.taxExpiry[key]) < new Date() ? "Expired" : "Valid"} />
                )}
              </div>
            ))}
          </div>
        </div>{/* end body */}

        {/* ── Status ── */}
        {status === "success" && (
          <div style={S.successMsg}>✅ Vehicle registered successfully! (ID: {savedId})</div>
        )}
        {status === "error" && serverErrors.length > 0 && (
          <div style={S.errorMsg}>❌ {serverErrors.join(" • ")}</div>
        )}

        {/* ── Actions ── */}
        <div style={S.actions}>
          <button style={S.resetBtn} onClick={handleReset}>Reset</button>
          <button style={{ ...S.saveBtn, opacity: status === "loading" ? 0.7 : 1 }}
            onClick={handleSubmit} disabled={status === "loading"}>
            {status === "loading" ? "Saving…" : "Save Vehicle"}
          </button>
        </div>

      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  page: { minHeight: "100vh", background: "linear-gradient(135deg,#e8f4fd,#f0f9f4)", display: "flex", justifyContent: "center", padding: "24px 16px", fontFamily: "'Inter','Segoe UI',sans-serif" },
  card: { background: "#fff", borderRadius: 16, boxShadow: "0 4px 32px rgba(0,0,0,0.10)", width: "100%", maxWidth: 1100, overflow: "hidden" },
  header: { background: "linear-gradient(90deg,#0d47a1,#1565c0)", color: "#fff", padding: "18px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 },
  hTitle: { fontSize: 20, fontWeight: 700 },
  hSub:   { fontSize: 12, opacity: 0.75, marginTop: 2 },
  docBtn: { background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.35)", borderRadius: 8, color: "#fff", padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 },
  docBadge: { background: "#e53935", borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 700 },
  identBar: { background: "linear-gradient(90deg,#1565c0,#1976d2)", padding: "14px 28px", display: "flex", alignItems: "flex-end", gap: 24, flexWrap: "wrap" },
  identInput: { width: "100%", background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.45)", borderRadius: 8, color: "#fff", fontSize: 16, fontWeight: 700, padding: "8px 14px", outline: "none", boxSizing: "border-box" },
  ownershipRow: { display: "flex", gap: 8, paddingBottom: 2 },
  ownerBtn: { background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.3)", borderRadius: 8, color: "rgba(255,255,255,0.7)", padding: "8px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  ownerBtnActive: { background: "#fff", color: "#1565c0", borderColor: "#fff" },

  body: { display: "flex", gap: 0, alignItems: "flex-start" },
  leftCol: { flex: 1, padding: "24px 28px", minWidth: 0, borderRight: "1px solid #eef2f7" },
  rightCol: { width: 280, flexShrink: 0, padding: "24px 20px", background: "#fafcff" },

  secHead: { fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", borderLeft: "3px solid", paddingLeft: 10, marginBottom: 16, marginTop: 20 },
  row: { display: "flex", gap: 14, flexWrap: "wrap" },
  field: { marginBottom: 14, flex: 1, minWidth: 140 },
  half:  { flex: "0 0 calc(50% - 7px)" },
  third: { flex: "0 0 calc(33.33% - 10px)" },
  label: { fontSize: 11, fontWeight: 700, color: "#556", textTransform: "uppercase", letterSpacing: "0.4px", display: "block", marginBottom: 5 },
  req:   { color: "#e53935" },
  input: { width: "100%", border: "1.5px solid #dce3ec", borderRadius: 7, padding: "8px 11px", fontSize: 13, color: "#222", background: "#fdfdfd", outline: "none", boxSizing: "border-box" },
  inputErr: { borderColor: "#e53935" },
  ferr:  { color: "#e53935", fontSize: 11, marginTop: 3 },

  checkGroup: { display: "flex", gap: 20, marginBottom: 16 },
  checkRow:   { display: "flex", alignItems: "center", gap: 7, cursor: "pointer" },

  taxRow:   { display: "flex", alignItems: "center", gap: 6, marginBottom: 9 },
  taxLabel: { fontSize: 11, fontWeight: 600, color: "#555", width: 120, flexShrink: 0 },
  taxInput: { flex: 1, border: "1.5px solid #dce3ec", borderRadius: 6, padding: "6px 8px", fontSize: 12, color: "#222", outline: "none", background: "#fff", minWidth: 0 },
  expiryDot: { width: 9, height: 9, borderRadius: "50%", flexShrink: 0 },

  fileList: { marginTop: 12, display: "flex", flexDirection: "column", gap: 6 },
  fileItem: { display: "flex", alignItems: "center", justifyContent: "space-between", background: "#eaf3ff", borderRadius: 6, padding: "6px 12px", fontSize: 12, color: "#333" },
  fileRemove: { background: "none", border: "none", color: "#e53935", cursor: "pointer", fontWeight: 700, fontSize: 13 },

  actions: { display: "flex", justifyContent: "flex-end", gap: 12, padding: "16px 28px 24px", borderTop: "1px solid #eef2f7" },
  resetBtn: { background: "#fff", border: "1.5px solid #dce3ec", borderRadius: 8, padding: "10px 24px", fontSize: 14, fontWeight: 600, color: "#555", cursor: "pointer" },
  saveBtn:  { background: "linear-gradient(90deg,#1565c0,#1976d2)", border: "none", borderRadius: 8, padding: "10px 32px", fontSize: 14, fontWeight: 700, color: "#fff", cursor: "pointer", boxShadow: "0 2px 8px rgba(21,101,192,0.35)" },
  successMsg: { background: "#e8f5e9", color: "#2e7d32", borderRadius: 8, padding: "12px 20px", margin: "0 28px 16px", fontWeight: 600, fontSize: 14 },
  errorMsg:   { background: "#fdecea", color: "#c62828", borderRadius: 8, padding: "12px 20px", margin: "0 28px 16px", fontWeight: 600, fontSize: 14 },
};