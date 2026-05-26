import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Sidebar from "../../components/Admin/Sidebar";
import Topbar from "../../components/Admin/Topbar";
import { tripsAPI, requireAuth } from "../../api";

import "../../styles/Admin/AdminDashboard.css";
import "../../styles/Admin/Trips.css";

function TripDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const passedTrip = location.state?.trip || null;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [tripData, setTripData] = useState(passedTrip);

  useEffect(() => {
    requireAuth();
    if (passedTrip?.id) {
      tripsAPI.get(passedTrip.id)
        .then(data => setTripData(data))
        .catch(() => {});
    }
  }, []);

  if (!tripData) {
    return <div>Loading or No Trip Data</div>;
  }

  async function handleSave() {
    if (!editMode) { setEditMode(true); return; }
    try {
      setSaving(true);
      const updated = await tripsAPI.update(tripData.id, {
        client_name: tripData.client_name,
        client_phone: tripData.client_phone,
        pickup_location: tripData.pickup_location,
        drop_location: tripData.drop_location,
        reporting_time: tripData.reporting_time,
        balance_amount: parseFloat(tripData.balance_amount) || 0,
        payment_status: tripData.payment_status,
        trip_status: tripData.trip_status,
        notes: tripData.notes,
      });
      setTripData(updated);
      setEditMode(false);
    } catch (err) {
      setError("Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  function field(label, key, isDate=false) {
    return (
      <div className="td-detail-box">
        <p>{label}</p>
        {editMode ? (
          <input
            className="t-input"
            type={isDate ? "datetime-local" : "text"}
            value={
              isDate && tripData[key] 
                ? new Date(tripData[key]).toISOString().slice(0,16) 
                : tripData[key] || ""
            }
            onChange={(e) => setTripData({ ...tripData, [key]: e.target.value })}
          />
        ) : (
          <h4>
            {isDate && tripData[key]
              ? new Date(tripData[key]).toLocaleString()
              : tripData[key] || "—"}
          </h4>
        )}
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar sidebarOpen={sidebarOpen} />

      <div className={`trips-content ${sidebarOpen ? "sidebar-open" : "sidebar-close"}`}>
        <Topbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {error && (
          <div style={{ background: "#fee2e2", color: "#ef4444", padding: "12px 16px", borderRadius: "10px", margin: "20px 32px 0", fontSize: "14px" }}>
            ⚠ {error}
          </div>
        )}

        <div className="trips-header">
          <div>
            <h1>Trip Details</h1>
            <p>Dashboard &gt; Trips &gt; {tripData.id}</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn-danger" onClick={() => navigate("/trips")}>Back</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editMode ? "Save Changes" : "Edit Trip"}
            </button>
          </div>
        </div>

        <div className="td-grid-top">
          <div className="td-panel">
            <h2>Trip Info</h2>
            <div className="td-details-grid">
              {field("Client Name", "client_name")}
              {field("Client Phone", "client_phone")}
              {field("Pickup Location", "pickup_location")}
              {field("Drop Location", "drop_location")}
              {field("Reporting Time", "reporting_time", true)}
              
              <div className="td-detail-box">
                <p>Trip Status</p>
                {editMode ? (
                  <select className="t-input" value={tripData.trip_status} onChange={(e) => setTripData({ ...tripData, trip_status: e.target.value })}>
                    <option value="Scheduled">Scheduled</option>
                    <option value="On Trip">On Trip</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                ) : (
                  <h4>{tripData.trip_status}</h4>
                )}
              </div>
            </div>
            
            <div style={{ marginTop: "16px" }}>
              {field("Special Notes", "notes")}
            </div>
          </div>

          <div className="td-panel">
            <h2>Assigned Resource</h2>
            <div className="td-row">
              <span>Vehicle</span>
              <span>{tripData.vehicle_number} ({tripData.vehicle_type})</span>
            </div>
            <div className="td-row">
              <span>Driver Name</span>
              <span>{tripData.driver_name || "—"}</span>
            </div>
            <div className="td-row">
              <span>Driver Phone</span>
              <span>{tripData.driver_phone || "—"}</span>
            </div>
            
            <h2 style={{ marginTop: "32px", fontSize: "15px" }}>Message Status</h2>
            <div className="td-row">
              <span>Driver SMS Sent</span>
              <span style={{ color: tripData.driver_msg_sent ? "#10b981" : "#ef4444" }}>
                {tripData.driver_msg_sent ? "Yes" : "Failed / No"}
              </span>
            </div>
            <div className="td-row">
              <span>Client SMS Sent</span>
              <span style={{ color: tripData.client_msg_sent ? "#10b981" : "#ef4444" }}>
                {tripData.client_msg_sent ? "Yes" : "Failed / No"}
              </span>
            </div>
            <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "8px" }}>
              * Duty reminders are automatically scheduled 2hr & 1hr before reporting time.
            </p>
          </div>
        </div>

        <div className="td-grid-bottom">
          <div className="td-panel">
            <h2>Payment Details</h2>
            <div className="td-row">
              <span>Balance Amount</span>
              {editMode ? (
                <input className="t-input" style={{ width: "120px" }} type="number" value={tripData.balance_amount} onChange={(e) => setTripData({ ...tripData, balance_amount: e.target.value })} />
              ) : (
                <span>₹{tripData.balance_amount}</span>
              )}
            </div>
            <div className="td-row">
              <span>Payment Status</span>
              {editMode ? (
                <select className="t-input" style={{ width: "120px" }} value={tripData.payment_status} onChange={(e) => setTripData({ ...tripData, payment_status: e.target.value })}>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                </select>
              ) : (
                <span className={`status-badge ${tripData.payment_status === "Paid" ? "active" : "booked"}`}>
                  {tripData.payment_status}
                </span>
              )}
            </div>
            
            {tripData.payment_link && (
              <div style={{ marginTop: "24px", padding: "16px", background: "#eff6ff", borderRadius: "8px", border: "1px dashed #93c5fd" }}>
                <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#1e3a8a", fontWeight: "600" }}>Dummy Razorpay Link (Sent to Client)</p>
                <a href={tripData.payment_link} target="_blank" rel="noreferrer" style={{ fontSize: "14px", color: "#2563eb", wordBreak: "break-all" }}>
                  {tripData.payment_link}
                </a>
              </div>
            )}
          </div>
          
          <div className="td-panel">
            <h2>Activity Logs</h2>
            <div className="td-row">
              <span>Trip Created On</span>
              <span>{new Date(tripData.created_at).toLocaleString()}</span>
            </div>
            <div className="td-row">
              <span>Last Updated</span>
              <span>{new Date(tripData.updated_at).toLocaleString()}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default TripDetails;
