import { useState } from "react";

const API_BASE = "http://localhost:4000/api";

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh",
];

const initialForm = {
  driverName: "",
  acType: "",
  openingBalance: "",
  address: { add1: "", add2: "", area: "", city: "", state: "" },
  mobileNo: "",
  dateOfJoining: "",
  salary: "",
  vehicleNo: "",
  isActive: true,
  drivingLicence: { number: "", issuedBy: "", issueDate: "", expiryDate: "" },
  hazardousLicence: { number: "", issuedBy: "", issueDate: "", expiryDate: "" },
  bankAccount: { name: "", accountNo: "", bankName: "", branch: "", ifscCode: "" },
};

export default function DriverForm() {
  const [activeTab, setActiveTab] = useState("general");
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [serverErrors, setServerErrors] = useState([]);
  const [docFiles, setDocFiles] = useState([]);
  const [savedDriverId, setSavedDriverId] = useState(null);

  // ── Field helpers ──────────────────────────────────────────────────────────
  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  const setNested = (group, field, value) => {
    setForm((f) => ({ ...f, [group]: { ...f[group], [field]: value } }));
    setErrors((e) => ({ ...e, [`${group}.${field}`]: "" }));
  };

  // ── Client validation ──────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.driverName.trim()) e.driverName = "Driver name is required.";
    if (!form.mobileNo.trim()) e.mobileNo = "Mobile number is required.";
    else if (!/^\+?[0-9]{10,15}$/.test(form.mobileNo.replace(/\s/g, "")))
      e.mobileNo = "Enter a valid mobile number.";
    if (!form.dateOfJoining) e.dateOfJoining = "Date of joining is required.";
    if (form.bankAccount.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.bankAccount.ifscCode))
      e["bankAccount.ifscCode"] = "Invalid IFSC format (e.g. HDFC0001234).";
    return e;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const clientErrors = validate();
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors);
      setActiveTab(
        clientErrors.driverName || clientErrors.mobileNo || clientErrors.dateOfJoining
          ? "general"
          : "general"
      );
      return;
    }

    setSubmitStatus("loading");
    setServerErrors([]);

    try {
      const res = await fetch(`${API_BASE}/drivers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          openingBalance: parseFloat(form.openingBalance) || 0,
          salary: parseFloat(form.salary) || 0,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setServerErrors(data.errors || ["Something went wrong."]);
        setSubmitStatus("error");
        return;
      }

      const driverId = data.data.id;
      setSavedDriverId(driverId);

      // Upload documents if any
      if (docFiles.length) {
        const fd = new FormData();
        docFiles.forEach((f) => fd.append("documents", f));
        await fetch(`${API_BASE}/drivers/${driverId}/documents`, {
          method: "POST",
          body: fd,
        });
      }

      setSubmitStatus("success");
      setForm(initialForm);
      setDocFiles([]);
    } catch {
      setServerErrors(["Network error. Please check the backend server."]);
      setSubmitStatus("error");
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    setErrors({});
    setSubmitStatus(null);
    setServerErrors([]);
    setDocFiles([]);
  };

  // ── Reusable field components ──────────────────────────────────────────────
  const Field = ({ label, error, children, required }) => (
    <div style={styles.field}>
      <label style={styles.label}>
        {label}
        {required && <span style={styles.required}> *</span>}
      </label>
      {children}
      {error && <p style={styles.fieldError}>{error}</p>}
    </div>
  );

  const Input = ({ value, onChange, placeholder, type = "text", ...rest }) => (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={styles.input}
      {...rest}
    />
  );

  const Select = ({ value, onChange, options, placeholder }) => (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={styles.input}>
      <option value="">{placeholder || "Select..."}</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );

  // ── Tabs ──────────────────────────────────────────────────────────────────
  const GeneralTab = () => (
    <div style={styles.tabContent}>
      {/* Driver Name */}
      <div style={styles.sectionHeader}>Driver Information</div>
      <div style={styles.row}>
        <Field label="Driver Name" required error={errors.driverName} >
          <Input value={form.driverName} onChange={(v) => set("driverName", v)} placeholder="Full name" />
        </Field>
        <Field label="A/C Type">
          <Select
            value={form.acType}
            onChange={(v) => set("acType", v)}
            options={["Cash", "Credit", "Prepaid"]}
            placeholder="Select type"
          />
        </Field>
        <Field label="Opening Balance (₹)">
          <Input type="number" value={form.openingBalance} onChange={(v) => set("openingBalance", v)} placeholder="0.00" />
        </Field>
      </div>

      {/* Address */}
      <div style={styles.sectionHeader}>Present Address</div>
      <div style={styles.row}>
        <Field label="Address Line 1">
          <Input value={form.address.add1} onChange={(v) => setNested("address", "add1", v)} placeholder="Village / Street" />
        </Field>
        <Field label="Address Line 2">
          <Input value={form.address.add2} onChange={(v) => setNested("address", "add2", v)} placeholder="PO, Tehsil, etc." />
        </Field>
      </div>
      <div style={styles.row}>
        <Field label="Area">
          <Input value={form.address.area} onChange={(v) => setNested("address", "area", v)} placeholder="Area / District" />
        </Field>
        <Field label="City">
          <Input value={form.address.city} onChange={(v) => setNested("address", "city", v)} placeholder="City" />
        </Field>
        <Field label="State">
          <Select value={form.address.state} onChange={(v) => setNested("address", "state", v)} options={INDIAN_STATES} placeholder="Select state" />
        </Field>
      </div>

      {/* Personal Details */}
      <div style={styles.sectionHeader}>Personal Details</div>
      <div style={styles.row}>
        <Field label="Mobile No." required error={errors.mobileNo}>
          <Input value={form.mobileNo} onChange={(v) => set("mobileNo", v)} placeholder="+91 9876543210" />
        </Field>
        <Field label="Date of Joining" required error={errors.dateOfJoining}>
          <Input type="date" value={form.dateOfJoining} onChange={(v) => set("dateOfJoining", v)} />
        </Field>
        <Field label="Salary (₹/month)">
          <Input type="number" value={form.salary} onChange={(v) => set("salary", v)} placeholder="0" />
        </Field>
      </div>
      <div style={styles.row}>
        <Field label="Vehicle No.">
          <Input value={form.vehicleNo} onChange={(v) => set("vehicleNo", v)} placeholder="MH04-EL-0612" />
        </Field>
        <Field label="Status">
          <div style={styles.toggleRow}>
            <div
              style={{ ...styles.toggle, background: form.isActive ? "#2ecc71" : "#ccc" }}
              onClick={() => set("isActive", !form.isActive)}
            >
              <div style={{ ...styles.toggleKnob, transform: form.isActive ? "translateX(20px)" : "translateX(0)" }} />
            </div>
            <span style={{ color: form.isActive ? "#2ecc71" : "#999", fontWeight: 600, fontSize: 13 }}>
              {form.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </Field>
      </div>
    </div>
  );

  const OtherTab = () => (
    <div style={styles.tabContent}>
      {/* Driving Licence */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div>
          <div style={{ ...styles.sectionHeader, color: "#e74c3c" }}>Driving Licence</div>
          <Field label="Licence No.">
            <Input value={form.drivingLicence.number} onChange={(v) => setNested("drivingLicence", "number", v)} placeholder="UP20201000000548" />
          </Field>
          <Field label="Issued By">
            <Select value={form.drivingLicence.issuedBy} onChange={(v) => setNested("drivingLicence", "issuedBy", v)} options={INDIAN_STATES} placeholder="Select state RTO" />
          </Field>
          <div style={styles.row}>
            <Field label="Issue Date">
              <Input type="date" value={form.drivingLicence.issueDate} onChange={(v) => setNested("drivingLicence", "issueDate", v)} />
            </Field>
            <Field label="Expiry Date">
              <Input type="date" value={form.drivingLicence.expiryDate} onChange={(v) => setNested("drivingLicence", "expiryDate", v)} />
            </Field>
          </div>
        </div>

        {/* Hazardous Licence */}
        <div>
          <div style={{ ...styles.sectionHeader, color: "#e67e22" }}>Hazardous Licence</div>
          <Field label="Licence No.">
            <Input value={form.hazardousLicence.number} onChange={(v) => setNested("hazardousLicence", "number", v)} placeholder="N10758" />
          </Field>
          <Field label="Issued By">
            <Select value={form.hazardousLicence.issuedBy} onChange={(v) => setNested("hazardousLicence", "issuedBy", v)} options={INDIAN_STATES} placeholder="Select state RTO" />
          </Field>
          <div style={styles.row}>
            <Field label="Issue Date">
              <Input type="date" value={form.hazardousLicence.issueDate} onChange={(v) => setNested("hazardousLicence", "issueDate", v)} />
            </Field>
            <Field label="Expiry Date">
              <Input type="date" value={form.hazardousLicence.expiryDate} onChange={(v) => setNested("hazardousLicence", "expiryDate", v)} />
            </Field>
          </div>
        </div>
      </div>

      {/* Bank Account */}
      <div style={styles.sectionHeader}>Bank Account</div>
      <div style={styles.row}>
        <Field label="Account Holder Name">
          <Input value={form.bankAccount.name} onChange={(v) => setNested("bankAccount", "name", v)} placeholder="As per passbook" />
        </Field>
        <Field label="Account No.">
          <Input value={form.bankAccount.accountNo} onChange={(v) => setNested("bankAccount", "accountNo", v)} placeholder="Account number" />
        </Field>
      </div>
      <div style={styles.row}>
        <Field label="Bank Name">
          <Input value={form.bankAccount.bankName} onChange={(v) => setNested("bankAccount", "bankName", v)} placeholder="e.g. SBI" />
        </Field>
        <Field label="Branch">
          <Input value={form.bankAccount.branch} onChange={(v) => setNested("bankAccount", "branch", v)} placeholder="Branch name" />
        </Field>
        <Field label="IFSC Code" error={errors["bankAccount.ifscCode"]}>
          <Input
            value={form.bankAccount.ifscCode}
            onChange={(v) => setNested("bankAccount", "ifscCode", v.toUpperCase())}
            placeholder="HDFC0001234"
          />
        </Field>
      </div>

      {/* Documents */}
      <div style={styles.sectionHeader}>Documents</div>
      <div style={styles.uploadBox}>
        <input
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          id="doc-upload"
          style={{ display: "none" }}
          onChange={(e) => setDocFiles(Array.from(e.target.files))}
        />
        <label htmlFor="doc-upload" style={styles.uploadLabel}>
          <span style={{ fontSize: 28 }}>📁</span>
          <span style={{ marginTop: 6, color: "#555" }}>Click to upload licence, RC, insurance…</span>
          <span style={{ fontSize: 12, color: "#999" }}>PDF, JPG, PNG • Max 5 files</span>
        </label>
        {docFiles.length > 0 && (
          <ul style={styles.fileList}>
            {docFiles.map((f, i) => (
              <li key={i} style={styles.fileItem}>
                📄 {f.name}
                <button
                  style={styles.removeFile}
                  onClick={() => setDocFiles((prev) => prev.filter((_, j) => j !== i))}
                >✕</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <div style={styles.headerTitle}>Driver Registration</div>
            <div style={styles.headerSub}>Fill all required fields and save</div>
          </div>
          <div style={styles.headerBadge}>Fleet Management</div>
        </div>

        {/* Driver Name Banner */}
        <div style={styles.nameBanner}>
          <label style={{ ...styles.label, color: "#fff", marginBottom: 4 }}>Driver Name *</label>
          <input
            style={styles.nameInput}
            value={form.driverName}
            onChange={(e) => set("driverName", e.target.value)}
            placeholder="Enter full driver name"
          />
          {errors.driverName && <p style={{ ...styles.fieldError, color: "#ffd6d6" }}>{errors.driverName}</p>}
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {["general", "other"].map((tab) => (
            <button
              key={tab}
              style={{ ...styles.tabBtn, ...(activeTab === tab ? styles.tabBtnActive : {}) }}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "general" ? "⚙️ General" : "📋 Other / Licences"}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "general" ? <GeneralTab /> : <OtherTab />}

        {/* Status Messages */}
        {submitStatus === "success" && (
          <div style={styles.successMsg}>
            ✅ Driver registered successfully! (ID: {savedDriverId})
          </div>
        )}
        {submitStatus === "error" && serverErrors.length > 0 && (
          <div style={styles.errorMsg}>
            ❌ {serverErrors.join(" • ")}
          </div>
        )}

        {/* Actions */}
        <div style={styles.actions}>
          <button style={styles.resetBtn} onClick={handleReset}>Reset</button>
          <button
            style={{ ...styles.saveBtn, opacity: submitStatus === "loading" ? 0.7 : 1 }}
            onClick={handleSubmit}
            disabled={submitStatus === "loading"}
          >
            {submitStatus === "loading" ? "Saving…" : "Save Driver"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #e8f4fd 0%, #f0f9f4 100%)",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "24px 16px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 4px 32px rgba(0,0,0,0.10)",
    width: "100%",
    maxWidth: 900,
    overflow: "hidden",
  },
  header: {
    background: "linear-gradient(90deg, #1565c0, #0d47a1)",
    color: "#fff",
    padding: "20px 28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 22, fontWeight: 700, letterSpacing: "-0.3px" },
  headerSub: { fontSize: 13, opacity: 0.8, marginTop: 2 },
  headerBadge: {
    background: "rgba(255,255,255,0.18)",
    borderRadius: 20,
    padding: "4px 14px",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.5px",
  },
  nameBanner: {
    background: "linear-gradient(90deg, #1976d2, #1565c0)",
    padding: "14px 28px",
  },
  nameInput: {
    width: "100%",
    background: "rgba(255,255,255,0.15)",
    border: "1px solid rgba(255,255,255,0.4)",
    borderRadius: 8,
    color: "#fff",
    fontSize: 16,
    fontWeight: 600,
    padding: "8px 14px",
    outline: "none",
    boxSizing: "border-box",
    "::placeholder": { color: "rgba(255,255,255,0.6)" },
  },
  tabs: {
    display: "flex",
    borderBottom: "2px solid #e9ecef",
    padding: "0 28px",
    background: "#f8fafc",
  },
  tabBtn: {
    background: "none",
    border: "none",
    padding: "14px 20px",
    fontSize: 14,
    fontWeight: 500,
    color: "#888",
    cursor: "pointer",
    borderBottom: "3px solid transparent",
    marginBottom: -2,
    transition: "all 0.2s",
  },
  tabBtnActive: {
    color: "#1565c0",
    borderBottomColor: "#1565c0",
    fontWeight: 700,
  },
  tabContent: { padding: "24px 28px" },
  sectionHeader: {
    fontSize: 12,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "1px",
    color: "#1565c0",
    marginBottom: 16,
    marginTop: 8,
    paddingBottom: 6,
    borderBottom: "2px solid #e3f2fd",
  },
  row: { display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 0 },
  field: { flex: 1, minWidth: 180, marginBottom: 18 },
  label: { fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.4px" },
  required: { color: "#e74c3c" },
  input: {
    width: "100%",
    border: "1.5px solid #dce3ec",
    borderRadius: 8,
    padding: "9px 12px",
    fontSize: 14,
    color: "#222",
    background: "#fdfdfd",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  fieldError: { color: "#e74c3c", fontSize: 11, marginTop: 4 },
  toggleRow: { display: "flex", alignItems: "center", gap: 10, paddingTop: 4 },
  toggle: { width: 44, height: 24, borderRadius: 12, cursor: "pointer", position: "relative", transition: "background 0.3s" },
  toggleKnob: { width: 20, height: 20, background: "#fff", borderRadius: "50%", position: "absolute", top: 2, left: 2, transition: "transform 0.3s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" },
  uploadBox: {
    border: "2px dashed #b0c4de",
    borderRadius: 10,
    padding: 20,
    background: "#f7fbff",
    marginTop: 8,
  },
  uploadLabel: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    cursor: "pointer",
    padding: 12,
  },
  fileList: { listStyle: "none", padding: 0, margin: "12px 0 0" },
  fileItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#eaf3ff",
    borderRadius: 6,
    padding: "6px 12px",
    fontSize: 13,
    marginBottom: 6,
    color: "#333",
  },
  removeFile: { background: "none", border: "none", color: "#e74c3c", cursor: "pointer", fontWeight: 700, fontSize: 13 },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    padding: "16px 28px 24px",
    borderTop: "1px solid #eee",
  },
  resetBtn: {
    background: "#fff",
    border: "1.5px solid #dce3ec",
    borderRadius: 8,
    padding: "10px 24px",
    fontSize: 14,
    fontWeight: 600,
    color: "#555",
    cursor: "pointer",
  },
  saveBtn: {
    background: "linear-gradient(90deg, #1565c0, #1976d2)",
    border: "none",
    borderRadius: 8,
    padding: "10px 32px",
    fontSize: 14,
    fontWeight: 700,
    color: "#fff",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(21,101,192,0.35)",
  },
  successMsg: {
    background: "#e8f5e9",
    color: "#2e7d32",
    borderRadius: 8,
    padding: "12px 20px",
    margin: "0 28px",
    fontWeight: 600,
    fontSize: 14,
  },
  errorMsg: {
    background: "#fdecea",
    color: "#c62828",
    borderRadius: 8,
    padding: "12px 20px",
    margin: "0 28px",
    fontWeight: 600,
    fontSize: 14,
  },
};