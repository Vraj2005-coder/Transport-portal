import "../styles/DriverRegister.css";

function DriverRegister() {

  return (

    <div className="register-container">

      {/* LEFT SECTION */}

      <div className="register-left">

        <div className="left-content">

          <h1>Driver Portal</h1>

          <p>
            Register to access trips, vehicle assignments
            and transport updates.
          </p>

        </div>

      </div>

      {/* RIGHT SECTION */}

      <div className="register-right">

        <div className="register-card">

          <h2>Create Account</h2>

          <p className="sub-title">
            Driver Registration
          </p>

          <form>

            <div className="input-group">

              <label>Full Name</label>

              <input
                type="text"
                placeholder="Enter Full Name"
                required
              />

            </div>

            <div className="input-group">

              <label>Email Address</label>

              <input
                type="email"
                placeholder="Enter Email Address"
                required
              />

            </div>

            <div className="input-group">

              <label>Phone Number</label>

              <input
                type="text"
                placeholder="Enter Phone Number"
                maxLength="10"
                required
                onInput={(e) => {
                  e.target.value =
                  e.target.value.replace(/\D/g, "");
                }}
              />

            </div>

            <div className="input-group">

              <label>License Number</label>

              <input
                type="text"
                placeholder="Enter License Number"
                required
              />

            </div>

            <div className="input-group">

              <label>Password</label>

              <input
                type="password"
                placeholder="Enter Password"
                required
              />

            </div>

            <button
              type="submit"
              className="register-btn"
            >
              Register
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}

export default DriverRegister;