import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "../styles/DriverLogin.css";

function DriverLogin() {

  const navigate = useNavigate();
  

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

          <form 
          onSubmit={(e) => {
            e.preventDefault();
            navigate("/driver-dashboard");
            }}
            >

            <input
              type="email"
              placeholder="Enter Email"
            />

            <input
              type="password"
              placeholder="Enter Password"
            />

            <button type="submit">
              Login
            </button>

          </form>

          <div className="register-link">

            <p>
              New Driver?
              <Link to="/driver-register">
                Register Here
              </Link>
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default DriverLogin;