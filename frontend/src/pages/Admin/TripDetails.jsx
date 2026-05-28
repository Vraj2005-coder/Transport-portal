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
  const [editMode, setEditMode]       = useState(false);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState("");
  const [tripData, setTripData]       = useState(passedTrip);

  useEffect(() => {
    requireAuth();
    if (passedTrip?.id) {
      tripsAPI.get(passedTrip.id)
        .then((data) => setTripData(data))
        .catch(() => {});
    }
  }, []);

  if (!tripData) {
    return <div className="trips-empty" style={{ padding: "40px" }}>Loading trip data...</div>;
  }

  async function handleSave() {
    if (!editMode) { setEditMode(true); return; }
    try {
      setSaving(true);
      const updated = await tripsAPI.update(tripData.id, {
        client_name:      tripData.client_name,
        client_phone:     tripData.client_phone,
        pickup_location:  tripData.pickup_location,
        drop_location:    tripData.drop_location,
        reporting_time:   tripData.reporting_time,
        balance_amount:   parseFloat(tripData.balance_amount) || 0,
        payment_status:   tripData.payment_status,
        trip_status:      tripData.trip_status,
        notes:            tripData.notes,
      });
      setTripData(updated);
      setEditMode(false);
    } catch (err) {
      setError("Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  function field(label, key, isDate = false) {
    return (
      <div className="td-detail-box">
        <p>{label}</p>
        {editMode ? (
          <input
            className="t-input"
            type={isDate ? "datetime-local" : "text"}
            value={
              isDate && tripData[key]
                ? new Date(tripData[key]).toISOString().slice(0, 16)
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

  const msgStatus = (label, sent) => (
    <div className="td-row">
      <span>{label}</span>
      <span className={sent ? "msg-sent" : "msg-failed"}>
        {sent ? "✓ Sent" : "✗ Failed"}
      </span>
    </div>
  );

  return (
    <div className="dashboard-layout">
      <Sidebar sidebarOpen={sidebarOpen} />

      <div className={`trips-content ${sidebarOpen ? "sidebar-open" : "sidebar-close"}`}>
        <Topbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {error && <div className="trips-error-banner">⚠ {error}</div>}

        {/* ── Header ── */}
        <div className="trips-header">
          <div>
            <h1>Trip Details</h1>
            <p>Dashboard &gt; Trips &gt; <span style={{ color: "#3b82f6" }}>{tripData.trip_id}</span></p>
          </div>
          <div className="trips-header-actions">
            <button className="btn-danger" onClick={() => navigate("/trips")}>← Back</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editMode ? "Save Changes" : "Edit Trip"}
            </button>
          </div>
        </div>

        {/* ── Top Grid: Trip Info + Assigned Resource ── */}
        <div className="td-grid-top">

          {/* Trip Info */}
          <div className="td-panel">
            <h2>Trip Info</h2>
            <div className="td-details-grid">
              {field("Client Name",     "client_name")}
              {field("Client Phone",    "client_phone")}
              {field("Pickup Location", "pickup_location")}
              {field("Drop Location",   "drop_location")}
              {field("Reporting Time",  "reporting_time", true)}

              <div className="td-detail-box">
                <p>Trip Status</p>
                {editMode ? (
                  <select
                    className="t-input"
                    value={tripData.trip_status}
                    onChange={(e) => setTripData({ ...tripData, trip_status: e.target.value })}
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="On Trip">On Trip</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                ) : (
                  <h4>
                    <span className={`status-badge ${
                      tripData.trip_status === "Scheduled"  ? "active"      :
                      tripData.trip_status === "On Trip"    ? "booked"      :
                      tripData.trip_status === "Cancelled"  ? "maintenance" : "active"
                    }`}>
                      {tripData.trip_status}
                    </span>
                  </h4>
                )}
              </div>
            </div>

            <div style={{ marginTop: "16px" }}>
              {field("Special Notes", "notes")}
            </div>
          </div>

          {/* Assigned Resource + Message Status */}
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

            <div className="td-divider" />
            <h2>Notification Status</h2>
            {msgStatus("Driver Notified",  tripData.driver_msg_sent)}
            {msgStatus("Client Notified",  tripData.client_msg_sent)}
            <p className="td-hint">
              * Duty reminders auto-schedule 2hr &amp; 1hr before reporting time.
            </p>
          </div>
        </div>

        {/* ── Bottom Grid: Payment + Activity ── */}
        <div className="td-grid-bottom">

          {/* Payment Details */}
          <div className="td-panel">
            <h2>Payment Details</h2>
            <div className="td-row">
              <span>Balance Amount</span>
              {editMode ? (
                <input
                  className="t-input"
                  style={{ width: "140px" }}
                  type="number"
                  value={tripData.balance_amount}
                  onChange={(e) => setTripData({ ...tripData, balance_amount: e.target.value })}
                />
              ) : (
                <span>₹{tripData.balance_amount?.toLocaleString()}</span>
              )}
            </div>
            <div className="td-row">
              <span>Payment Status</span>
              {editMode ? (
                <select
                  className="t-input"
                  style={{ width: "140px" }}
                  value={tripData.payment_status}
                  onChange={(e) => setTripData({ ...tripData, payment_status: e.target.value })}
                >
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
              <div className="td-payment-link">
                <p>Razorpay Link (sent to client)</p>
                <a href={tripData.payment_link} target="_blank" rel="noreferrer">
                  {tripData.payment_link}
                </a>
              </div>
            )}
          </div>

          {/* Activity Logs */}
          <div className="td-panel">
            <h2>Activity Logs</h2>
            <div className="td-row">
              <span>Trip Created On</span>
              <span>{new Date(tripData.created_at).toLocaleString()}</span>
            </div>
            <div className="td-row">
              <span>Last Updated</span>
              <span>{tripData.updated_at ? new Date(tripData.updated_at).toLocaleString() : "—"}</span>
            </div>
            <div className="td-row">
              <span>Trip ID</span>
              <span style={{ color: "#3b82f6", fontWeight: "700" }}>{tripData.trip_id}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default TripDetails;
