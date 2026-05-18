import { useNavigate } from "react-router-dom";

import "../styles/AdminLogin.css";

function AdminLogin() {

  const navigate = useNavigate();

  return (

    <div className="admin-container">

      {/* LEFT SECTION */}

      <div className="admin-left">

        <div className="left-content">

          <h1>Transport Management System</h1>

          <p>
            Manage vehicles, drivers, trips and
            transport operations with a smart dashboard.
          </p>

        </div>

      </div>

      {/* RIGHT SECTION */}

      <div className="admin-right">

        <div className="login-card">

          <h2>Admin Login</h2>

          <p>Welcome back Admin</p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              navigate("/admin-dashboard");
            }}
          >

            <input
              type="email"
              placeholder="Enter Email Address"
              required
            />

            <input
              type="password"
              placeholder="Enter Password"
              required
            />

            <button type="submit">
              Login
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}

export default AdminLogin;