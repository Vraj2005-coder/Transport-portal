import "../../styles/Driver/DriverDashboard.css";


function DriverDashboard() {

  return (

    <div className="driver-dashboard">

      {/* SIDEBAR */}

      <div className="driver-sidebar">

        <h2>Driver Panel</h2>

        <ul>
          <li>Dashboard</li>
          <li>My Trips</li>
          <li>Assigned Vehicle</li>
          <li>Trip Status</li>
          <li>Documents</li>
          <li>Settings</li>
        </ul>

      </div>

      {/* MAIN CONTENT */}

      <div className="driver-main">

        <div className="driver-topbar">

          <h1>Driver Dashboard</h1>

          <button>Driver</button>

        </div>

        {/* CARDS */}

        <div className="driver-cards">

          <div className="driver-card green">
            <h3>Assigned Trips</h3>
            <p>5</p>
          </div>

          <div className="driver-card blue">
            <h3>Completed Trips</h3>
            <p>18</p>
          </div>

          <div className="driver-card white">
            <h3>Vehicle Status</h3>
            <p>Active</p>
          </div>

        </div>

        {/* TRIP DETAILS */}

        <div className="trip-section">

          <h2>Current Trip</h2>

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

              <tr>
                <td>MH12AB1234</td>
                <td>Mumbai → Delhi</td>
                <td>On Trip</td>
                <td>540 KM</td>
              </tr>

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default DriverDashboard;