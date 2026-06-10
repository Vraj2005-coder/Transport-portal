import { Menu, Bell } from "lucide-react";
import "../../styles/Driver/DriverNavbar.css";

function DriverNavbar({ toggleSidebar }) {
  return (
    <header className="driver-navbar">

      <div className="navbar-left">
        <button
          className="menu-btn"
          onClick={toggleSidebar}
        >
          <Menu size={24} />
        </button>

        <div className="brand">
          
          <div>
            <h2>Transport Portal</h2>
            <span>Driver Management System</span>
          </div>
        </div>
      </div>

      <div className="navbar-right">

        <div className="notification">
          <Bell size={20} />
          
        </div>

        <div className="driver-profile">
          <div className="profile-avatar">
            D
          </div>

          <div className="profile-info">
            <h4>Driver</h4>
            <p>Online</p>
          </div>
        </div>

      </div>

    </header>
  );
}

export default DriverNavbar;