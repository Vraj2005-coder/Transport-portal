import { useLocation, useNavigate } from "react-router-dom";
import { logout } from "../../api";

function Sidebar({ sidebarOpen }) {

  const navigate  = useNavigate();
  const location  = useLocation();

  const menuItems = [
    { name: "Dashboard", path: "/admin-dashboard" },
    { name: "Vehicles",  path: "/vehicles" },
    { name: "Drivers",   path: "/drivers" },
    { name: "Trips",     path: "/trips" },
    { name: "Documents", path: "/documents" },
    { name: "Settings",  path: "/settings" },
  ];

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
    }
  };

  return (
    <div className={`sidebar ${sidebarOpen ? "sidebar-show" : "sidebar-hide"}`}>

      {/* LOGO */}
      <h2 className="navbar-logo" style={{ marginBottom: "32px" }}>
        TMS Admin
      </h2>

      <ul>
        {menuItems.map((item, index) => {
          const isActive =
            location.pathname === item.path ||
            (item.path === "/vehicles" && location.pathname === "/vehicle-details");

          return (
            <li
              key={index}
              onClick={() => navigate(item.path)}
              style={{
                background: isActive ? "#2563eb" : "transparent",
              }}
            >
              {item.name}
            </li>
          );
        })}
        <li
          onClick={handleLogout}
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
  );
}

export default Sidebar;