import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import "../../styles/Admin/topbar.css";

import {
  FiMenu,
  FiBell,
  FiChevronDown,
} from "react-icons/fi";

import { authAPI } from "../../api";

function Topbar({
  sidebarOpen,
  setSidebarOpen,
}) {

  const location = useLocation();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await authAPI.me();
        setUser(data);
      } catch (error) {
        console.error("Failed to load user:", error);
      }
    };

    loadUser();
  }, []);

  const pageTitles = {
    "/admin-dashboard": "Dashboard",

    "/vehicles": "Vehicles",
    "/vehicle-details": "Vehicle Details",

    "/drivers": "Drivers",

    "/trips": "Trips",
    "/trip-details": "Trip Details",

    "/payments": "Payments",

    "/expenses": "Expenses",
    "/expense-details": "Expense Details",

    "/documents": "Documents",

    "/settings": "Settings",
  };

  const pageTitle =
    pageTitles[location.pathname] || "Dashboard";

  return (
    <header className="topbar">

      <div className="topbar-left">

        <button
          className="menu-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <FiMenu />
        </button>

        <div className="page-info">
          <h1 className="page-title">
            {pageTitle}
          </h1>

          <span className="page-path">
            Transport Management System
          </span>
        </div>

      </div>

      <div className="topbar-right">

        <button className="notification-btn">
          <FiBell />
        </button>

        <div className="profile-box">

          <div className="profile-avatar">
            {user?.name
              ? user.name.charAt(0).toUpperCase()
              : "A"}
          </div>

          <div className="profile-details">

            <span className="profile-name">
              {user?.name || "Admin"}
            </span>

            <span className="profile-role">
              {user?.role || "User"}
            </span>

          </div>

          <FiChevronDown className="profile-arrow" />

        </div>

      </div>

    </header>
  );
}

export default Topbar;