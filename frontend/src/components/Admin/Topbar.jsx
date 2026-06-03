import "../../styles/Admin/Topbar.css";

function Topbar({
  sidebarOpen,
  setSidebarOpen,
}) {

  return (

    <div className="topbar">

      {/* LEFT SIDE */}

      <div className="topbar-left">

        <button
          className="menu-btn"
          onClick={() =>
            setSidebarOpen(!sidebarOpen)
          }
        >
          ☰
        </button>

        <h2 className="navbar-logo">
          TMS Admin
        </h2>

      </div>

      {/* RIGHT SIDE */}

      <div className="topbar-right">

        <div className="date-box">
          
        </div>

        <div className="notification-icon">

          🔔

          <span className="notification-dot">
            
          </span>

        </div>

        <div className="profile-box">

          <div className="profile-circle">
            A
          </div>

          <span className="profile-name">
            Admin
          </span>

        </div>

      </div>

    </div>
  );
}

export default Topbar;