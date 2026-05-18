import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/DriverLogin.css";

function DriverLogin() {

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      if (data.role !== "driver") {
        throw new Error("Unauthorized: You do not have driver access.");
      }

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("role", data.role);

      navigate("/driver-dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  

  return (

    <div className="driver-container">

      <div className="driver-overlay">

        <div className="driver-left">

          <h1>Driver Portal</h1>

          <p>
            Access trip updates, vehicle details
            and transport assignments securely.
          </p>

        </div>

        <div className="driver-login-card">

          <h2>Driver Login</h2>

          <p>Welcome back Driver</p>

          {error && <div style={{color: '#ef4444', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center'}}>{error}</div>}

          <form onSubmit={handleSubmit}>

            <input
              type="email"
              placeholder="Enter Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Enter Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit" disabled={loading} style={{opacity: loading ? 0.7 : 1}}>
              {loading ? "Logging in..." : "Login"}
            </button>

          </form>



        </div>

      </div>

    </div>
  );
}

export default DriverLogin;