import { useEffect, useState } from "react";

import Sidebar from "../../components/Admin/Sidebar";
import Topbar from "../../components/Admin/Topbar";
import { adminAPI, requireAuth } from "../../api";

import "../../styles/Admin/AdminDashboard.css";

function AdminDashboard() {

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [stats, setStats] = useState({
    total_vehicles: 0,
    active_drivers: 0,
    trips_today: 0,
    pending_documents: 0,
  });

  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    requireAuth();
    async function load() {
      try {
        const [statsData, activityData] = await Promise.all([
          adminAPI.stats(),
          adminAPI.recentActivity(),
        ]);
        setStats(statsData);
        setActivity(activityData.activities || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="dashboard-layout">

      {/* SIDEBAR */}
      <Sidebar sidebarOpen={sidebarOpen} />

      {/* MAIN CONTENT */}
      <div className={`dashboard-content ${sidebarOpen ? "sidebar-open" : "sidebar-close"}`}>

        {/* TOPBAR */}
        <Topbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* ERROR */}
        {error && (
          <div style={{ background: "#fee2e2", color: "#ef4444", padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px" }}>
            ⚠ {error}
          </div>
        )}

        {/* DASHBOARD CARDS */}
        <div className="cards">

          <div className="card green">
            <h3>Total Vehicles</h3>
            <p>{loading ? "—" : stats.total_vehicles}</p>
          </div>

          <div className="card blue">
            <h3>Active Drivers</h3>
            <p>{loading ? "—" : stats.active_drivers}</p>
          </div>

          <div className="card white">
            <h3>Trips Today</h3>
            <p>{loading ? "—" : stats.trips_today}</p>
          </div>

          <div className="card green">
            <h3>Pending Documents</h3>
            <p>{loading ? "—" : stats.pending_documents}</p>
          </div>

        </div>

        {/* RECENT ACTIVITY TABLE */}
        <div className="table-section">

          <h2>Recent Vehicle Activity</h2>

          {loading ? (
            <p style={{ color: "#64748b", fontSize: "14px" }}>Loading activity...</p>
          ) : activity.length === 0 ? (
            <p style={{ color: "#64748b", fontSize: "14px" }}>No recent activity. Add vehicles to get started.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Driver</th>
                  <th>Status</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {activity.map((row, i) => (
                  <tr key={i}>
                    <td>{row.vehicle}</td>
                    <td>{row.driver}</td>
                    <td>
                      <span className={`status-badge ${row.status?.toLowerCase()}`}>
                        {row.status}
                      </span>
                    </td>
                    <td>{row.location || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;