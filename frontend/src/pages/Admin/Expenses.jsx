import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../components/Admin/Sidebar";
import Topbar from "../../components/Admin/Topbar";
import { requireAuth } from "../../api";

import "../../styles/Admin/AdminDashboard.css";

/* ──────────────────────────────────────────────────────────
   INLINE CSS  (no separate file needed — keeps it self-contained)
────────────────────────────────────────────────────────── */
const S = {
  page: { padding: "24px" },
  header: { marginBottom: "24px" },
  h1: { margin: 0, fontSize: "28px", color: "#0f172a" },
  sub: { color: "#64748b", marginTop: "8px" },
  kpis: { display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" },
  kpi: (color) => ({
    flex: 1, minWidth: "160px", background: color.bg,
    borderLeft: `4px solid ${color.border}`,
    borderRadius: "16px", padding: "18px",
    boxShadow: "0 2px 10px rgba(0,0,0,.05)",
    display: "flex", flexDirection: "column", justifyContent: "space-between",
  }),
  kpiH: { margin: 0, fontSize: "13px", color: "#64748b" },
  kpiV: { fontSize: "22px", fontWeight: 700, margin: 0 },
  card: { background: "white", borderRadius: "20px", padding: "24px", marginBottom: "24px", boxShadow: "0 2px 12px rgba(0,0,0,.05)" },
  cardTitle: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  h2: { margin: 0, fontSize: "18px", color: "#0f172a" },
  filterRow: { display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "20px" },
  select: { padding: "10px 14px", border: "1px solid #dbe2ea", borderRadius: "10px", fontSize: "14px", outline: "none", cursor: "pointer" },
  input: { padding: "10px 14px", border: "1px solid #dbe2ea", borderRadius: "10px", fontSize: "14px", outline: "none", flex: 1, minWidth: "200px" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { background: "#f8fafc", padding: "14px", textAlign: "left", color: "#475569", fontSize: "14px", fontWeight: 600 },
  td: { padding: "14px", borderBottom: "1px solid #e2e8f0", fontSize: "14px" },
  badge: (status) => {
    const map = { verified: { bg: "#dcfce7", color: "#15803d" }, pending: { bg: "#fef9c3", color: "#ca8a04" }, rejected: { bg: "#fee2e2", color: "#dc2626" } };
    const s = map[status?.toLowerCase()] || map.pending;
    return { background: s.bg, color: s.color, padding: "5px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: 600, display: "inline-block" };
  },
  profitCard: { display: "flex", gap: "20px", flexWrap: "wrap" },
  profitItem: (color) => ({ flex: 1, minWidth: "160px", background: color.bg, border: `1px solid ${color.border}`, borderRadius: "14px", padding: "18px", textAlign: "center" }),
};

const KPIS = [
  { label: "Total Expenses", key: "total",   prefix: "₹", color: { bg: "#eef6ff", border: "#3b82f6" } },
  { label: "Fuel Expenses",  key: "fuel",    prefix: "₹", color: { bg: "#f0fdf4", border: "#22c55e" } },
  { label: "Toll Charges",   key: "toll",    prefix: "₹", color: { bg: "#fff7ed", border: "#f97316" } },
  { label: "Pending",        key: "pending", prefix: "",  color: { bg: "#fef2f2", border: "#ef4444" } },
];

/* Sample data — will be replaced by real API data */
const SAMPLE = [
  { id: 1, date: "01-06-2026", type: "Fuel",          vehicle: "MH12AB1234", driver: "Ramesh Kumar", trip_id: "TRIP-001", amount: 4500, status: "Verified" },
  { id: 2, date: "01-06-2026", type: "Toll Charge",   vehicle: "MH12AB1234", driver: "Ramesh Kumar", trip_id: "TRIP-001", amount: 850,  status: "Pending"  },
  { id: 3, date: "31-05-2026", type: "Parking Fee",   vehicle: "MH14CD5678", driver: "Suresh Patil", trip_id: "TRIP-002", amount: 300,  status: "Verified" },
  { id: 4, date: "31-05-2026", type: "Service & Repair", vehicle: "MH14CD5678", driver: "Suresh Patil", trip_id: "TRIP-002", amount: 12000, status: "Pending" },
  { id: 5, date: "30-05-2026", type: "Fuel",          vehicle: "MH16EF9012", driver: "Vijay Shinde",  trip_id: "TRIP-003", amount: 3200, status: "Verified" },
  { id: 6, date: "30-05-2026", type: "Miscellaneous", vehicle: "MH16EF9012", driver: "Vijay Shinde",  trip_id: "TRIP-003", amount: 500,  status: "Rejected" },
];

function Expenses() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expenses] = useState(SAMPLE);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const navigate = useNavigate();

  useEffect(() => { requireAuth(); }, []);

  /* ── derived stats ── */
  const total   = expenses.reduce((s, e) => s + e.amount, 0);
  const fuel    = expenses.filter(e => e.type === "Fuel").reduce((s, e) => s + e.amount, 0);
  const toll    = expenses.filter(e => e.type === "Toll Charge").reduce((s, e) => s + e.amount, 0);
  const pending = expenses.filter(e => e.status === "Pending").length;

  const kpiValues = { total: `₹${total.toLocaleString()}`, fuel: `₹${fuel.toLocaleString()}`, toll: `₹${toll.toLocaleString()}`, pending };

  /* ── trip profit summary ── */
  const tripGroups = {};
  expenses.forEach(e => {
    if (!tripGroups[e.trip_id]) tripGroups[e.trip_id] = { total: 0, vehicle: e.vehicle };
    tripGroups[e.trip_id].total += e.amount;
  });

  /* ── filter ── */
  const filtered = expenses.filter(e => {
    const q = search.toLowerCase();
    const match = e.vehicle.toLowerCase().includes(q) || e.driver.toLowerCase().includes(q) || e.trip_id.toLowerCase().includes(q);
    const typeOk = typeFilter === "All" || e.type === typeFilter;
    const stOk   = statusFilter === "All" || e.status === statusFilter;
    return match && typeOk && stOk;
  });

  const types = ["All", ...new Set(expenses.map(e => e.type))];

  return (
    <div className="dashboard-layout">
      <Sidebar sidebarOpen={sidebarOpen} />

      <div className={`vehicles-content ${sidebarOpen ? "sidebar-open" : "sidebar-close"}`}>
        <Topbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div style={S.page}>

          {/* HEADER */}
          <div style={S.header}>
            <h1 style={S.h1}>Expense Management</h1>
            <p style={S.sub}>Track fuel, toll, repair and all trip-related expenses. Monitor profit per trip.</p>
          </div>

          {/* KPI CARDS */}
          <div style={S.kpis}>
            {KPIS.map(k => (
              <div key={k.key} style={S.kpi(k.color)}>
                <p style={S.kpiH}>{k.label}</p>
                <p style={S.kpiV}>{kpiValues[k.key]}</p>
              </div>
            ))}
          </div>

          {/* TRIP PROFIT SUMMARY */}
          <div style={S.card}>
            <div style={S.cardTitle}>
              <h2 style={S.h2}>Trip-wise Expense Summary</h2>
            </div>
            <div style={S.profitCard}>
              {Object.entries(tripGroups).map(([tripId, data]) => (
                <div key={tripId} style={S.profitItem({ bg: "#f0fdf4", border: "#86efac" })}>
                  <p style={{ margin: 0, fontWeight: 700, color: "#0f172a" }}>{tripId}</p>
                  <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#64748b" }}>{data.vehicle}</p>
                  <p style={{ margin: "10px 0 0", fontSize: "20px", fontWeight: 700, color: "#dc2626" }}>
                    ₹{data.total.toLocaleString()}
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#64748b" }}>Total Expenses</p>
                </div>
              ))}
            </div>
          </div>

          {/* EXPENSE TABLE */}
          <div style={S.card}>
            <div style={S.cardTitle}>
              <h2 style={S.h2}>All Expenses</h2>
            </div>

            {/* FILTERS */}
            <div style={S.filterRow}>
              <input
                style={S.input}
                placeholder="Search by vehicle, driver or trip ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <select style={S.select} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                {types.map(t => <option key={t}>{t}</option>)}
              </select>
              <select style={S.select} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                {["All", "Verified", "Pending", "Rejected"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            <table style={S.table}>
              <thead>
                <tr>
                  {["Date", "Type", "Vehicle", "Driver", "Trip ID", "Amount", "Status"].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ ...S.td, textAlign: "center", color: "#94a3b8", fontStyle: "italic" }}>No expenses found.</td></tr>
                ) : filtered.map(e => (
                  <tr key={e.id} style={{ cursor: "default" }}>
                    <td style={S.td}>{e.date}</td>
                    <td style={S.td}>{e.type}</td>
                    <td style={{ ...S.td, fontWeight: 600 }}>{e.vehicle}</td>
                    <td style={S.td}>{e.driver}</td>
                    <td style={{ ...S.td, color: "#2563eb", fontWeight: 600 }}>{e.trip_id}</td>
                    <td style={{ ...S.td, fontWeight: 700 }}>₹{e.amount.toLocaleString()}</td>
                    <td style={S.td}><span style={S.badge(e.status)}>{e.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Expenses;
