import { useEffect, useState } from "react";
import { driverAPI, requireAuth, logout } from "../../api";
import "../../styles/Driver/DriverDashboard.css";

function DriverDashboard() {

  const [stats, setStats]           = useState(null);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");

  useEffect(() => {
    requireAuth();
    async function load() {
      try {
        const [statsData, tripData] = await Promise.all([
          driverAPI.stats(),
          driverAPI.currentTrip(),
        ]);
        setStats(statsData);
        setCurrentTrip(tripData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="driver-dashboard">

      {/* SIDEBAR */}
      <div className="driver-sidebar">
        <h2>Driver Panel</h2>
        <ul>
          <li className="active">Dashboard</li>
          <li>My Trips</li>
          <li>Assigned Vehicle</li>
          <li>Trip Status</li>
          <li>Documents</li>
          <li>Settings</li>
          <li
            onClick={() => {
              if (window.confirm("Are you sure you want to log out?")) {
                logout();
              }
            }}
            style={{
              marginTop: "40px",
              color: "#f87171",
              fontWeight: "600",
              border: "1px solid rgba(248, 113, 113, 0.2)"
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(248, 113, 113, 0.1)'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            🚪 Logout
          </li>
        </ul>
      </div>

      {/* MAIN CONTENT */}
      <div className="driver-main">

        <div className="driver-topbar">
          <h1>Driver Dashboard</h1>
          <button>Driver</button>
        </div>

        {/* ERROR */}
        {error && (
          <div style={{ background: "#fee2e2", color: "#ef4444", padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px" }}>
            ⚠ {error}
          </div>
        )}

        {/* CARDS */}
        <div className="driver-cards">

          <div className="driver-card green">
            <h3>Assigned Trips</h3>
            <p>{loading ? "—" : stats?.assigned_trips ?? 0}</p>
          </div>

          <div className="driver-card blue">
            <h3>Completed Trips</h3>
            <p>{loading ? "—" : stats?.completed_trips ?? 0}</p>
          </div>

          <div className="driver-card white">
            <h3>Vehicle Status</h3>
            <p style={{ fontSize: "20px", fontWeight: "700", marginTop: "8px" }}>
              {loading ? "—" : stats?.vehicle_status ?? "—"}
            </p>
          </div>

        </div>

        {/* CURRENT TRIP */}
        <div className="trip-section">

          <h2>Current Trip</h2>

          {loading ? (
            <p style={{ color: "#64748b", fontSize: "14px" }}>Loading trip info...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Route</th>
                  <th>Status</th>
                  <th>Distance</th>
                </tr>
              </thead>
              <tbody>
                {currentTrip?.vehicle ? (
                  <tr>
                    <td>{currentTrip.vehicle}</td>
                    <td>{currentTrip.route || "—"}</td>
                    <td>{currentTrip.status}</td>
                    <td>{currentTrip.distance || "—"}</td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan="4" style={{ color: "#64748b", fontStyle: "italic" }}>
                      No active trip assigned.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

        </div>

      </div>
    </div>
  );
}

export default DriverDashboard;