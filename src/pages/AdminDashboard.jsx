import "../styles/AdminDashboard.css";

function AdminDashboard() {

  return (

    <div className="dashboard-container">

      {/* SIDEBAR */}

      <div className="sidebar">

        <h2>TMS Admin</h2>

        <ul>
          <li>Dashboard</li>
          <li>Vehicles</li>
          <li>Drivers</li>
          <li>Trips</li>
          <li>Live Tracking</li>
          <li>Documents</li>
          <li>Settings</li>
        </ul>

      </div>

      {/* MAIN CONTENT */}

      <div className="main-content">

        <div className="topbar">

          <h1>Admin Dashboard</h1>

          <button>Admin</button>

        </div>

        {/* CARDS */}

        <div className="cards">

          <div className="card green">
            <h3>Total Vehicles</h3>
            <p>120</p>
          </div>

          <div className="card blue">
            <h3>Active Drivers</h3>
            <p>45</p>
          </div>

          <div className="card white">
            <h3>Trips Today</h3>
            <p>32</p>
          </div>

          <div className="card green">
            <h3>Pending Documents</h3>
            <p>8</p>
          </div>

        </div>

        {/* TABLE */}

        <div className="table-section">

          <h2>Recent Vehicle Activity</h2>

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

              <tr>
                <td>MH12AB1234</td>
                <td>Rahul Sharma</td>
                <td>Active</td>
                <td>Mumbai</td>
              </tr>

              <tr>
                <td>RJ14XY5678</td>
                <td>Aman Verma</td>
                <td>On Trip</td>
                <td>Delhi</td>
              </tr>

              <tr>
                <td>MH09TR8899</td>
                <td>Rakesh Patel</td>
                <td>Maintenance</td>
                <td>Pune</td>
              </tr>

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default AdminDashboard;