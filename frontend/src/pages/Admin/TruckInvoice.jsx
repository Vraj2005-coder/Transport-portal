import { useState, useRef } from "react";

// ─── Fake "backend" ───────────────────────────────────────────────────────────
const DB = {
  trucks: [
    { id: "TRK001", regNo: "GJ05AB1234", driver: "Ravi Kumar", capacity: "10 Ton", type: "Open Body" },
    { id: "TRK002", regNo: "GJ01XY5678", driver: "Suresh Patel", capacity: "20 Ton", type: "Container" },
    { id: "TRK003", regNo: "MH12CD9090", driver: "Ramesh Singh", capacity: "5 Ton",  type: "Mini Truck" },
    { id: "TRK004", regNo: "RJ14EF3322", driver: "Dinesh Yadav", capacity: "15 Ton", type: "Trailer" },
  ],
  invoices: [],
  nextInv: 1001,
};

function generateInvoice(data) {
  const inv = {
    ...data,
    invoiceNo: `TINV-${DB.nextInv++}`,
    date: new Date().toLocaleDateString("en-IN"),
    status: "Generated",
  };
  DB.invoices.push(inv);
  return inv;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => Number(n || 0).toFixed(2);
const calcTotals = (items, gstPct, tds, commission, rateDiffer) => {
  const subtotal = items.reduce((s, i) => s + (Number(i.qty) * Number(i.rate)), 0);
  const gst       = subtotal * (Number(gstPct) / 100);
  const tdsAmt    = subtotal * (Number(tds) / 100);
  const commAmt   = subtotal * (Number(commission) / 100);
  const rateAdj   = Number(rateDiffer);
  const total     = subtotal + gst - tdsAmt - commAmt + rateAdj;
  return { subtotal, gst, tdsAmt, commAmt, rateAdj, total };
};

// ─── Colour / type tokens ─────────────────────────────────────────────────────
const C = {
  bg:       "#0f1117",
  surface:  "#1a1d27",
  card:     "#20242f",
  border:   "#2c3044",
  accent:   "#f5a623",   // amber – freight/logistics warmth
  accentD:  "#c4821a",
  red:      "#e05252",
  green:    "#3ecf6a",
  muted:    "#6b7280",
  text:     "#e8eaf0",
  subtext:  "#9ca3af",
};

// ─── Minimal CSS-in-JS via inline styles ──────────────────────────────────────
const S = {
  app: {
    minHeight: "100vh",
    background: C.bg,
    color: C.text,
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    fontSize: 14,
  },
  header: {
    background: C.surface,
    borderBottom: `2px solid ${C.accent}`,
    padding: "14px 32px",
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  logo: {
    width: 38, height: 38,
    background: C.accent,
    borderRadius: 8,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 20,
  },
  h1: { margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: "-0.3px" },
  sub: { margin: 0, fontSize: 12, color: C.subtext },
  tabs: {
    display: "flex", gap: 4,
    padding: "16px 32px 0",
    borderBottom: `1px solid ${C.border}`,
  },
  tab: (active) => ({
    padding: "8px 18px",
    borderRadius: "6px 6px 0 0",
    border: `1px solid ${active ? C.accent : "transparent"}`,
    borderBottom: active ? `1px solid ${C.surface}` : "1px solid transparent",
    background: active ? C.surface : "transparent",
    color: active ? C.accent : C.subtext,
    cursor: "pointer",
    fontWeight: active ? 600 : 400,
    fontSize: 13,
    transition: "all .15s",
  }),
  page: { padding: "28px 32px", maxWidth: 1080, margin: "0 auto" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 },
  card: {
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    padding: 20,
    marginBottom: 18,
  },
  sectionTitle: {
    color: C.accent,
    fontWeight: 700,
    fontSize: 11,
    letterSpacing: "1.2px",
    textTransform: "uppercase",
    marginBottom: 14,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  label: { display: "block", fontSize: 11, color: C.subtext, marginBottom: 5, fontWeight: 500 },
  input: {
    width: "100%",
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 6,
    color: C.text,
    padding: "8px 10px",
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
    transition: "border .15s",
  },
  select: {
    width: "100%",
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 6,
    color: C.text,
    padding: "8px 10px",
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
  },
  btn: (variant = "primary") => ({
    padding: "9px 20px",
    borderRadius: 7,
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 13,
    background: variant === "primary" ? C.accent : variant === "danger" ? C.red : C.surface,
    color: variant === "primary" ? "#000" : C.text,
    border: variant === "ghost" ? `1px solid ${C.border}` : "none",
    transition: "opacity .15s",
  }),
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    padding: "8px 10px",
    borderBottom: `2px solid ${C.border}`,
    color: C.subtext,
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.8px",
  },
  td: {
    padding: "10px",
    borderBottom: `1px solid ${C.border}`,
    fontSize: 13,
  },
  badge: (color) => ({
    display: "inline-block",
    padding: "2px 9px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    background: color + "22",
    color,
  }),
  divider: { height: 1, background: C.border, margin: "18px 0" },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "6px 0",
    fontSize: 13,
  },
  grandTotal: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0 0",
    borderTop: `2px solid ${C.accent}`,
    fontWeight: 700,
    fontSize: 16,
    color: C.accent,
  },
};

// ─── Field component ──────────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={S.label}>{label}</label>
      {children}
    </div>
  );
}

// ─── Truck Selector Card ──────────────────────────────────────────────────────
function TruckSelector({ selected, onSelect }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginBottom: 20 }}>
      {DB.trucks.map((t) => {
        const active = selected?.id === t.id;
        return (
          <div
            key={t.id}
            onClick={() => onSelect(t)}
            style={{
              background: active ? C.accent + "18" : C.card,
              border: `2px solid ${active ? C.accent : C.border}`,
              borderRadius: 10,
              padding: "14px 16px",
              cursor: "pointer",
              transition: "all .15s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 22 }}>🚛</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: active ? C.accent : C.text }}>
                  {t.regNo}
                </div>
                <div style={{ fontSize: 11, color: C.subtext }}>{t.type}</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: C.subtext }}>
              👤 {t.driver} · 📦 {t.capacity}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Invoice Form ─────────────────────────────────────────────────────────────
function InvoiceForm({ onCreated }) {
  const empty = { desc: "", qty: "", rate: "" };
  const [truck, setTruck]       = useState(null);
  const [acName, setAcName]     = useState("");
  const [acType, setAcType]     = useState("DIRECT EXPENSES");
  const [pan, setPan]           = useState("");
  const [gstNo, setGstNo]       = useState("");
  const [opBal, setOpBal]       = useState("0");
  const [ledger, setLedger]     = useState("");
  const [address, setAddress]   = useState("");
  const [city, setCity]         = useState("");
  const [state, setState]       = useState("");
  const [phone, setPhone]       = useState("");
  const [mobile, setMobile]     = useState("");
  const [email, setEmail]       = useState("");
  const [contactName, setContactName] = useState("");
  const [contactMobile, setContactMobile] = useState("");
  const [tds, setTds]           = useState("0");
  const [commission, setCommission] = useState("0");
  const [rateDiffer, setRateDiffer] = useState("0");
  const [gstPct, setGstPct]     = useState("18");
  const [bankName, setBankName] = useState("");
  const [branch, setBranch]     = useState("");
  const [accNo, setAccNo]       = useState("");
  const [ifsc, setIfsc]         = useState("");
  const [isBroker, setIsBroker] = useState(false);
  const [isConsignor, setIsConsignor] = useState(false);
  const [isConsignee, setIsConsignee] = useState(false);
  const [items, setItems]       = useState([{ ...empty }]);
  const [fromLoc, setFromLoc]   = useState("");
  const [toLoc, setToLoc]       = useState("");
  const [remark, setRemark]     = useState("");
  const [error, setError]       = useState("");

  const { subtotal, gst, tdsAmt, commAmt, rateAdj, total } = calcTotals(items, gstPct, tds, commission, rateDiffer);

  const addItem   = () => setItems([...items, { ...empty }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i, field, val) => {
    const copy = [...items];
    copy[i] = { ...copy[i], [field]: val };
    setItems(copy);
  };

  const handleSubmit = () => {
    if (!truck) return setError("Please select a truck first.");
    if (!acName.trim()) return setError("A/C Name is required.");
    if (items.some(i => !i.desc || !i.qty || !i.rate)) return setError("Fill all item rows.");
    setError("");
    const inv = generateInvoice({
      truck, acName, acType, pan, gstNo, opBal, ledger,
      address, city, state, phone, mobile, email,
      contactName, contactMobile, tds, commission, rateDiffer, gstPct,
      bankName, branch, accNo, ifsc,
      isBroker, isConsignor, isConsignee,
      items, fromLoc, toLoc, remark,
      subtotal, gst: gstPct, gstAmt: gst, tdsAmt, commAmt, rateAdj, total,
    });
    onCreated(inv);
  };

  const inp = (val, set) => (
    <input
      style={S.input}
      value={val}
      onChange={e => set(e.target.value)}
      onFocus={e => (e.target.style.borderColor = C.accent)}
      onBlur={e => (e.target.style.borderColor = C.border)}
    />
  );

  return (
    <div>
      {/* ── Truck Selection ── */}
      <div style={S.card}>
        <div style={S.sectionTitle}>🚛 Select Truck</div>
        <TruckSelector selected={truck} onSelect={setTruck} />
        {truck && (
          <div style={{
            background: C.accent + "12",
            border: `1px solid ${C.accent}44`,
            borderRadius: 8,
            padding: "10px 14px",
            fontSize: 13,
            color: C.subtext,
          }}>
            ✅ <strong style={{ color: C.accent }}>{truck.regNo}</strong> selected —{" "}
            {truck.driver} · {truck.type} · {truck.capacity}
          </div>
        )}
      </div>

      {/* ── Trip Details ── */}
      <div style={S.card}>
        <div style={S.sectionTitle}>📍 Trip Details</div>
        <div style={S.grid3}>
          <Field label="From Location">{inp(fromLoc, setFromLoc)}</Field>
          <Field label="To Location">{inp(toLoc, setToLoc)}</Field>
          <Field label="Remark">{inp(remark, setRemark)}</Field>
        </div>
      </div>

      {/* ── Account Info ── */}
      <div style={S.card}>
        <div style={S.sectionTitle}>📋 Account Information</div>
        <div style={S.grid2}>
          <Field label="A/C Name *">{inp(acName, setAcName)}</Field>
          <Field label="A/C Type">
            <select style={S.select} value={acType} onChange={e => setAcType(e.target.value)}>
              <option>DIRECT EXPENSES</option>
              <option>INDIRECT EXPENSES</option>
              <option>INCOME</option>
              <option>ASSETS</option>
            </select>
          </Field>
          <Field label="PAN No">{inp(pan, setPan)}</Field>
          <Field label="G.S.T No">{inp(gstNo, setGstNo)}</Field>
          <Field label="Op. Balance">{inp(opBal, setOpBal)}</Field>
          <Field label="Ledger Type">{inp(ledger, setLedger)}</Field>
        </div>
        <div style={S.divider} />
        <div style={S.grid2}>
          <Field label="Address">{inp(address, setAddress)}</Field>
          <Field label="City">{inp(city, setCity)}</Field>
          <Field label="State">{inp(state, setState)}</Field>
          <Field label="Phone">{inp(phone, setPhone)}</Field>
          <Field label="Mobile">{inp(mobile, setMobile)}</Field>
          <Field label="Email">{inp(email, setEmail)}</Field>
        </div>
      </div>

      {/* ── Contact + Rates ── */}
      <div style={{ ...S.grid2, gap: 18, marginBottom: 18 }}>
        <div style={{ ...S.card, marginBottom: 0 }}>
          <div style={S.sectionTitle}>👤 Contact Person</div>
          <Field label="Name">{inp(contactName, setContactName)}</Field>
          <Field label="Mobile No">{inp(contactMobile, setContactMobile)}</Field>
          <Field label="TDS %">{inp(tds, setTds)}</Field>
          <Field label="Commission %">{inp(commission, setCommission)}</Field>
          <Field label="Rate Differ">{inp(rateDiffer, setRateDiffer)}</Field>
          <Field label="GST %">
            <select style={S.select} value={gstPct} onChange={e => setGstPct(e.target.value)}>
              {["0","5","12","18","28"].map(g => <option key={g}>{g}</option>)}
            </select>
          </Field>
        </div>
        <div style={{ ...S.card, marginBottom: 0 }}>
          <div style={S.sectionTitle}>🏦 Bank Account</div>
          <Field label="Bank Name">{inp(bankName, setBankName)}</Field>
          <Field label="Branch">{inp(branch, setBranch)}</Field>
          <Field label="A/C No">{inp(accNo, setAccNo)}</Field>
          <Field label="IFSC Code">{inp(ifsc, setIfsc)}</Field>
          <div style={S.divider} />
          <div style={S.sectionTitle}>🏷️ Account As</div>
          {[["isConsignor","Consignor",setIsConsignor,isConsignor],
            ["isConsignee","Consignee",setIsConsignee,isConsignee],
            ["isBroker","Broker",setIsBroker,isBroker]].map(([id,label,setter,val]) => (
            <label key={id} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8, cursor:"pointer", fontSize:13 }}>
              <input type="checkbox" checked={val} onChange={e => setter(e.target.checked)}
                style={{ accentColor: C.accent, width:14, height:14 }} />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* ── Line Items ── */}
      <div style={S.card}>
        <div style={{ ...S.sectionTitle, justifyContent: "space-between" }}>
          <span>📦 Freight / Charges</span>
          <button style={S.btn("ghost")} onClick={addItem}>+ Add Row</button>
        </div>
        <table style={S.table}>
          <thead>
            <tr>
              {["#","Description","Qty / KM","Rate (₹)","Amount (₹)",""].map(h => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td style={{ ...S.td, color: C.subtext, width: 28 }}>{i + 1}</td>
                <td style={S.td}>
                  <input style={{ ...S.input, minWidth: 180 }} value={item.desc}
                    onChange={e => updateItem(i, "desc", e.target.value)} placeholder="e.g. Freight charges" />
                </td>
                <td style={S.td}>
                  <input style={{ ...S.input, width: 80 }} value={item.qty} type="number"
                    onChange={e => updateItem(i, "qty", e.target.value)} placeholder="0" />
                </td>
                <td style={S.td}>
                  <input style={{ ...S.input, width: 100 }} value={item.rate} type="number"
                    onChange={e => updateItem(i, "rate", e.target.value)} placeholder="0.00" />
                </td>
                <td style={{ ...S.td, fontWeight: 600 }}>
                  ₹{fmt(Number(item.qty) * Number(item.rate))}
                </td>
                <td style={S.td}>
                  {items.length > 1 && (
                    <button onClick={() => removeItem(i)}
                      style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 16 }}>✕</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ ...S.divider, marginTop: 18 }} />
        <div style={{ maxWidth: 320, marginLeft: "auto" }}>
          <div style={S.totalRow}><span style={{ color: C.subtext }}>Subtotal</span><span>₹{fmt(subtotal)}</span></div>
          <div style={S.totalRow}><span style={{ color: C.subtext }}>GST ({gstPct}%)</span><span>₹{fmt(gst)}</span></div>
          {Number(tds) > 0 && <div style={S.totalRow}><span style={{ color: C.subtext }}>TDS ({tds}%)</span><span style={{ color: C.red }}>−₹{fmt(tdsAmt)}</span></div>}
          {Number(commission) > 0 && <div style={S.totalRow}><span style={{ color: C.subtext }}>Commission ({commission}%)</span><span style={{ color: C.red }}>−₹{fmt(commAmt)}</span></div>}
          {Number(rateDiffer) !== 0 && <div style={S.totalRow}><span style={{ color: C.subtext }}>Rate Differ</span><span>₹{fmt(rateAdj)}</span></div>}
          <div style={S.grandTotal}><span>Grand Total</span><span>₹{fmt(total)}</span></div>
        </div>
      </div>

      {error && (
        <div style={{ background: C.red + "18", border: `1px solid ${C.red}44`, color: C.red,
          borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13 }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button style={S.btn("ghost")} onClick={() => window.location.reload()}>Reset</button>
        <button style={S.btn("primary")} onClick={handleSubmit}>Generate Invoice →</button>
      </div>
    </div>
  );
}

// ─── Invoice Preview ──────────────────────────────────────────────────────────
function InvoicePreview({ inv, onBack }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <button style={S.btn("ghost")} onClick={onBack}>← Back</button>
        <div style={S.badge(C.green)}>✓ GENERATED</div>
      </div>

      <div style={{
        background: "#fff",
        color: "#111",
        borderRadius: 12,
        padding: "32px 36px",
        fontFamily: "'Inter','Segoe UI',sans-serif",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24, paddingBottom: 20, borderBottom: "2px solid #f5a623" }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#f5a623" }}>🚛 TRUCK INVOICE</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>Freight & Logistics</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{inv.invoiceNo}</div>
            <div style={{ color: "#888", fontSize: 13 }}>Date: {inv.date}</div>
          </div>
        </div>

        {/* Truck + Trip */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          <div style={{ background: "#fff8ee", borderRadius: 8, padding: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 11, color: "#f5a623", textTransform: "uppercase", marginBottom: 8 }}>Truck Details</div>
            <div><b>Reg No:</b> {inv.truck.regNo}</div>
            <div><b>Driver:</b> {inv.truck.driver}</div>
            <div><b>Type:</b> {inv.truck.type} · {inv.truck.capacity}</div>
          </div>
          <div style={{ background: "#f8f9ff", borderRadius: 8, padding: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 11, color: "#6366f1", textTransform: "uppercase", marginBottom: 8 }}>Trip Info</div>
            <div><b>From:</b> {inv.fromLoc || "—"}</div>
            <div><b>To:</b> {inv.toLoc || "—"}</div>
            {inv.remark && <div><b>Note:</b> {inv.remark}</div>}
          </div>
        </div>

        {/* Billed To */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 11, color: "#888", textTransform: "uppercase", marginBottom: 6 }}>Billed To</div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{inv.acName}</div>
          <div style={{ color: "#555", fontSize: 13 }}>{inv.address}{inv.city ? ", " + inv.city : ""}{inv.state ? ", " + inv.state : ""}</div>
          {inv.gstNo && <div style={{ color: "#555", fontSize: 13 }}>GSTIN: {inv.gstNo}</div>}
          {inv.pan && <div style={{ color: "#555", fontSize: 13 }}>PAN: {inv.pan}</div>}
        </div>

        {/* Items */}
        <table style={{ ...S.table, marginBottom: 20 }}>
          <thead>
            <tr style={{ background: "#f5a62322" }}>
              {["#","Description","Qty","Rate","Amount"].map(h => (
                <th key={h} style={{ ...S.th, color: "#555", padding: "10px 12px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {inv.items.map((item, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "10px 12px", color: "#888" }}>{i+1}</td>
                <td style={{ padding: "10px 12px" }}>{item.desc}</td>
                <td style={{ padding: "10px 12px" }}>{item.qty}</td>
                <td style={{ padding: "10px 12px" }}>₹{fmt(item.rate)}</td>
                <td style={{ padding: "10px 12px", fontWeight: 600 }}>₹{fmt(item.qty * item.rate)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ maxWidth: 280, marginLeft: "auto", borderTop: "1px solid #eee", paddingTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 13, color: "#555" }}>
            <span>Subtotal</span><span>₹{fmt(inv.subtotal)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 13, color: "#555" }}>
            <span>GST ({inv.gst}%)</span><span>₹{fmt(inv.gstAmt)}</span>
          </div>
          {Number(inv.tdsAmt) > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 13, color: "#e05252" }}>
              <span>TDS ({inv.tds}%)</span><span>−₹{fmt(inv.tdsAmt)}</span>
            </div>
          )}
          {Number(inv.commAmt) > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 13, color: "#e05252" }}>
              <span>Commission ({inv.commission}%)</span><span>−₹{fmt(inv.commAmt)}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 0", borderTop: "2px solid #f5a623", fontWeight: 800, fontSize: 17, color: "#f5a623" }}>
            <span>Grand Total</span><span>₹{fmt(inv.total)}</span>
          </div>
        </div>

        {/* Bank */}
        {inv.bankName && (
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #eee", fontSize: 12, color: "#777" }}>
            <b>Bank:</b> {inv.bankName} · <b>Branch:</b> {inv.branch} · <b>A/C:</b> {inv.accNo} · <b>IFSC:</b> {inv.ifsc}
          </div>
        )}
        <div style={{ marginTop: 10, fontSize: 11, color: "#aaa", textAlign: "center" }}>
          This is a computer-generated invoice. Thank you for your business.
        </div>
      </div>
    </div>
  );
}

// ─── Invoice List ─────────────────────────────────────────────────────────────
function InvoiceList({ onView }) {
  if (DB.invoices.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 60, color: C.subtext }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>No invoices yet</div>
        <div style={{ fontSize: 13 }}>Switch to "New Invoice" to create one.</div>
      </div>
    );
  }
  return (
    <div style={S.card}>
      <table style={S.table}>
        <thead>
          <tr>{["Invoice No","A/C Name","Truck","From → To","Total","Date",""].map(h => (
            <th key={h} style={S.th}>{h}</th>
          ))}</tr>
        </thead>
        <tbody>
          {DB.invoices.map((inv, i) => (
            <tr key={i} style={{ transition: "background .1s" }}>
              <td style={S.td}><span style={{ fontWeight: 700, color: C.accent }}>{inv.invoiceNo}</span></td>
              <td style={S.td}>{inv.acName}</td>
              <td style={S.td}>{inv.truck.regNo}</td>
              <td style={S.td}>{inv.fromLoc || "—"} → {inv.toLoc || "—"}</td>
              <td style={{ ...S.td, fontWeight: 700 }}>₹{fmt(inv.total)}</td>
              <td style={{ ...S.td, color: C.subtext }}>{inv.date}</td>
              <td style={S.td}>
                <button style={S.btn("ghost")} onClick={() => onView(inv)}>View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab]       = useState("new");
  const [preview, setPreview] = useState(null);
  const [, forceRender]     = useState(0);

  const handleCreated = (inv) => {
    setPreview(inv);
    setTab("list");
    forceRender(n => n + 1);
  };

  return (
    <div style={S.app}>
      <div style={S.header}>
        <div style={S.logo}>🚛</div>
        <div>
          <p style={S.h1}>TruckBill Pro</p>
          <p style={S.sub}>Freight Invoice Management System</p>
        </div>
      </div>

      <div style={S.tabs}>
        {[["new","📝 New Invoice"],["list","📋 All Invoices"]].map(([key,label]) => (
          <button key={key} style={S.tab(tab === key)} onClick={() => { setTab(key); setPreview(null); }}>
            {label}
          </button>
        ))}
      </div>

      <div style={S.page}>
        {tab === "new" && <InvoiceForm onCreated={handleCreated} />}
        {tab === "list" && !preview && <InvoiceList onView={setPreview} />}
        {tab === "list" && preview  && <InvoicePreview inv={preview} onBack={() => setPreview(null)} />}
      </div>
    </div>
  );
}