const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 4000;

// In-memory store (replace with a real DB like PostgreSQL/MongoDB in production)
let drivers = [];
let nextId = 1;

// Storage for uploaded documents
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "./uploads";
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));

// ─── Validation helper ────────────────────────────────────────────────────────
function validateDriver(data) {
  const errors = [];
  if (!data.driverName || data.driverName.trim() === "")
    errors.push("Driver name is required.");
  if (!data.mobileNo || !/^\+?[0-9]{10,15}$/.test(data.mobileNo.replace(/\s/g, "")))
    errors.push("Valid mobile number is required.");
  if (!data.dateOfJoining)
    errors.push("Date of joining is required.");
  if (data.drivingLicence?.number && !data.drivingLicence?.issuedBy)
    errors.push("Driving Licence: Issued By is required when a licence number is provided.");
  if (data.bankAccount?.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(data.bankAccount.ifscCode))
    errors.push("Invalid IFSC code format (e.g. HDFC0001234).");
  return errors;
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET all drivers
app.get("/api/drivers", (req, res) => {
  res.json({ success: true, data: drivers });
});

// GET single driver
app.get("/api/drivers/:id", (req, res) => {
  const driver = drivers.find((d) => d.id === parseInt(req.params.id));
  if (!driver) return res.status(404).json({ success: false, message: "Driver not found." });
  res.json({ success: true, data: driver });
});

// POST create driver
app.post("/api/drivers", (req, res) => {
  const errors = validateDriver(req.body);
  if (errors.length) return res.status(400).json({ success: false, errors });

  const driver = {
    id: nextId++,
    driverName: req.body.driverName,
    acType: req.body.acType || "",
    openingBalance: req.body.openingBalance || 0,
    address: {
      add1: req.body.address?.add1 || "",
      add2: req.body.address?.add2 || "",
      area: req.body.address?.area || "",
      city: req.body.address?.city || "",
      state: req.body.address?.state || "",
    },
    mobileNo: req.body.mobileNo,
    dateOfJoining: req.body.dateOfJoining,
    salary: req.body.salary || 0,
    vehicleNo: req.body.vehicleNo || "",
    isActive: req.body.isActive ?? true,
    drivingLicence: {
      number: req.body.drivingLicence?.number || "",
      issuedBy: req.body.drivingLicence?.issuedBy || "",
      issueDate: req.body.drivingLicence?.issueDate || "",
      expiryDate: req.body.drivingLicence?.expiryDate || "",
    },
    hazardousLicence: {
      number: req.body.hazardousLicence?.number || "",
      issuedBy: req.body.hazardousLicence?.issuedBy || "",
      issueDate: req.body.hazardousLicence?.issueDate || "",
      expiryDate: req.body.hazardousLicence?.expiryDate || "",
    },
    bankAccount: {
      name: req.body.bankAccount?.name || "",
      accountNo: req.body.bankAccount?.accountNo || "",
      bankName: req.body.bankAccount?.bankName || "",
      branch: req.body.bankAccount?.branch || "",
      ifscCode: req.body.bankAccount?.ifscCode || "",
    },
    documents: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  drivers.push(driver);
  res.status(201).json({ success: true, data: driver, message: "Driver registered successfully." });
});

// PUT update driver
app.put("/api/drivers/:id", (req, res) => {
  const index = drivers.findIndex((d) => d.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ success: false, message: "Driver not found." });

  const errors = validateDriver(req.body);
  if (errors.length) return res.status(400).json({ success: false, errors });

  drivers[index] = {
    ...drivers[index],
    ...req.body,
    id: drivers[index].id,
    updatedAt: new Date().toISOString(),
  };
  res.json({ success: true, data: drivers[index], message: "Driver updated successfully." });
});

// DELETE driver
app.delete("/api/drivers/:id", (req, res) => {
  const index = drivers.findIndex((d) => d.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ success: false, message: "Driver not found." });
  drivers.splice(index, 1);
  res.json({ success: true, message: "Driver deleted successfully." });
});

// POST upload documents for a driver
app.post("/api/drivers/:id/documents", upload.array("documents", 5), (req, res) => {
  const driver = drivers.find((d) => d.id === parseInt(req.params.id));
  if (!driver) return res.status(404).json({ success: false, message: "Driver not found." });

  const uploaded = req.files.map((f) => ({
    filename: f.filename,
    originalName: f.originalname,
    url: `/uploads/${f.filename}`,
    uploadedAt: new Date().toISOString(),
  }));
  driver.documents.push(...uploaded);
  res.json({ success: true, documents: driver.documents });
});

app.listen(PORT, () => {
  console.log(`🚀 Driver API running at http://localhost:${PORT}`);
});