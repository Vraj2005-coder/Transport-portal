import { useNavigate } from "react-router-dom";
import "../styles/RoleSelection.css";

function RoleSelection() {

  const navigate = useNavigate();

  return (
    <div className="role-container">

      <div className="role-card">

        <h1>Transport Management System</h1>

        <p>Select your portal</p>

        <div className="role-buttons">

          <button
            className="admin-btn"
            onClick={() => navigate("/admin-login")}
          >
            Admin Portal
          </button>

          <button
            className="driver-btn"
            onClick={() => navigate("/driver-login")}
          >
            Driver Portal
          </button>

        </div>

      </div>

    </div>
  );
}

export default RoleSelection;