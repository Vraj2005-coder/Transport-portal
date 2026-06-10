# Transport Portal

A comprehensive web application for managing transport logistics, tracking vehicle fleets, and allowing drivers to view trips and log expenses.

## Requirements

- **Node.js** (v16 or higher recommended)
- **Python** (v3.9 or higher recommended)
- **MongoDB** (You need a running MongoDB instance or a MongoDB Atlas URI)

## Getting Started Locally

Follow these steps to run the application on your own machine.

### 1. Setup Backend

The backend is built with FastAPI and Python.

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```
3. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the `backend` folder and add your configuration. (A template might be provided, but at a minimum you need your MongoDB URI):
   ```ini
   MONGO_URI=mongodb://localhost:27017  # Or your MongoDB Atlas URI
   MONGO_DB_NAME=transport_portal
   JWT_SECRET_KEY=your_super_secret_key
   JWT_ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=15
   REFRESH_TOKEN_EXPIRE_DAYS=7
   ```
5. Start the backend server:
   ```bash
   uvicorn main:app --reload
   ```
   *The API will be available at `http://localhost:8000`*

### 2. Setup Frontend

The frontend is built with React and Vite.

1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install the Node modules:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will be available at `http://localhost:5173`*

---

## Accessing from Another Device (Mobile/Laptop on same network)

By default, development servers only accept connections from `localhost`. If you want to open the portal on your mobile phone or another laptop connected to the **same Wi-Fi network**, you need to bind the servers to `0.0.0.0`.

1. **Find your local IP address:**
   - On Windows, open Command Prompt and type `ipconfig` (Look for IPv4 Address, e.g., `192.168.1.5`)
   - On Mac/Linux, type `ifconfig` or `ip a`

2. **Start Backend for network access:**
   ```bash
   cd backend
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

3. **Start Frontend for network access:**
   ```bash
   cd frontend
   npm run dev -- --host
   ```

4. **Connect from the other device:**
   Open the browser on your phone or other laptop and navigate to:
   `http://<YOUR_LOCAL_IP>:5173` *(e.g., `http://192.168.1.5:5173`)*

*Note: The frontend code automatically detects your device's IP address and routes the API calls to the correct backend host IP.*
