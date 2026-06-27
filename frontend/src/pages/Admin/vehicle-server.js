const express  = require("express");
const cors     = require("cors");
const bodyParser = require("body-parser");
const multer   = require("multer");
const fs       = require("fs");

const app  = express();
const PORT = 4000;

// ── In-memory store (swap for PostgreSQL/MongoDB in production) ────────────────
let vehicles = [];
let nextId   = 1;

// ── File storage for documents ────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads/vehicles";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const allowed = ["application/pdf","image/jpeg","image/png","image/jpg"];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error("Only PDF/JPG/PNG allowed"));
  },
});

app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));

// ── Validation ─────────────────────────────────────────────────────────────────
function validate(data) {
  const errors = [];
  if (!data.vehicleNo?.trim())    errors.push("vehicleNo is required.");
  if (!data.vehicleOwner?.trim()) errors.push("vehicleOwner is required.");
  if (!data.category)             errors.push("category is required.");
  if (data.ownerMobile && !/^\+?[0-9]{10,15}$/.test(data.ownerMobile.replace(/\s/g, "")))
    errors.push("ownerMobile must be a valid phone number.");
  // Check duplicate vehicle number on create
  return errors;
}

function sanitize(body, existingId = null) {
  return {
    vehicleNo:      (body.vehicleNo || "").trim().toUpperCase(),
    ownership:      body.ownership || "own",
    vehicleOwner:   (body.vehicleOwner || "").trim(),
    ownerPanNo:     (body.ownerPanNo || "").trim().toUpperCase(),
    ownerMobile:    (body.ownerMobile || "").trim(),
    driverName:     (body.driverName || "").trim(),
    driverMobile:   (body.driverMobile || "").trim(),
    category:       body.category || "",
    rcBook:         !!body.rcBook,
    tdsForm:        !!body.tdsForm,
    // specs
    billNo:         body.billNo || "",
    model:          body.model  || "",
    purchaseDate:   body.purchaseDate  || "",
    registerDate:   body.registerDate  || "",
    engineNo:       body.engineNo      || "",
    trChassisNo:    body.trChassisNo   || "",
    chassisNo:      body.chassisNo     || "",
    tankNo:         body.tankNo        || "",
    emptyWeight:    parseFloat(body.emptyWeight)   || 0,
    size:           body.size          || "",
    passingWeight:  parseFloat(body.passingWeight) || 0,
    stdAverage:     parseFloat(body.stdAverage)    || 0,
    // loan
    purchaseAmt:    parseFloat(body.purchaseAmt)    || 0,
    loanAmount:     parseFloat(body.loanAmount)     || 0,
    loanAcName:     body.loanAcName     || "",
    bankHf:         body.bankHf         || "No",
    installmentAmt: parseFloat(body.installmentAmt) || 0,
    installmentDate:body.installmentDate || "",
    paymentAcName:  body.paymentAcName  || "",
    chargeAmt:      parseFloat(body.chargeAmt) || 0,
    chargeDate:     body.chargeDate     || "",
    // tax expiry
    taxExpiry: {
      passingDate:       body.taxExpiry?.passingDate       || "",
      statePermitDate:   body.taxExpiry?.statePermitDate   || "",
      insuranceDate:     body.taxExpiry?.insuranceDate     || "",
      taxDate:           body.taxExpiry?.taxDate           || "",
      fitnessDate:       body.taxExpiry?.fitnessDate       || "",
      nPermitDate:       body.taxExpiry?.nPermitDate       || "",
      pucDate:           body.taxExpiry?.pucDate           || "",
      calibrationDate:   body.taxExpiry?.calibrationDate   || "",
      explosiveDate:     body.taxExpiry?.explosiveDate     || "",
      halfYearDate:      body.taxExpiry?.halfYearDate      || "",
      yearDate:          body.taxExpiry?.yearDate          || "",
      hydroDate:         body.taxExpiry?.hydroDate         || "",
      authorisationDate: body.taxExpiry?.authorisationDate || "",
      otherDate:         body.taxExpiry?.otherDate         || "",
    },
  };
}

// ── Helper: expired documents summary ─────────────────────────────────────────
function getExpiryAlerts(vehicle) {
  const today = new Date();
  const soon  = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const alerts = [];
  for (const [key, val] of Object.entries(vehicle.taxExpiry)) {
    if (!val) continue;
    const d = new Date(val);
    if (d < today) alerts.push({ field: key, date: val, status: "expired" });
    else if (d < soon) alerts.push({ field: key, date: val, status: "expiring_soon" });
  }
  return alerts;
}

// ── Routes ─────────────────────────────────────────────────────────────────────

// GET all vehicles (with optional ?expiring=true filter)
app.get("/api/vehicles", (req, res) => {
  let result = vehicles;
  if (req.query.expiring === "true") {
    const soon = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    result = vehicles.filter(v =>
      Object.values(v.taxExpiry).some(d => d && new Date(d) < soon)
    );
  }
  res.json({ success: true, count: result.length, data: result });
});

// GET single vehicle with expiry alerts
app.get("/api/vehicles/:id", (req, res) => {
  const v = vehicles.find(v => v.id === parseInt(req.params.id));
  if (!v) return res.status(404).json({ success: false, message: "Vehicle not found." });
  res.json({ success: true, data: v, alerts: getExpiryAlerts(v) });
});

// POST create vehicle
app.post("/api/vehicles", (req, res) => {
  const errors = validate(req.body);
  if (errors.length) return res.status(400).json({ success: false, errors });

  // Duplicate check
  const dup = vehicles.find(v => v.vehicleNo === (req.body.vehicleNo || "").trim().toUpperCase());
  if (dup) return res.status(409).json({ success: false, errors: [`Vehicle ${req.body.vehicleNo} already exists (ID: ${dup.id}).`] });

  const vehicle = {
    id: nextId++,
    ...sanitize(req.body),
    documents: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  vehicles.push(vehicle);
  res.status(201).json({ success: true, data: vehicle, message: "Vehicle registered successfully." });
});

// PUT update vehicle
app.put("/api/vehicles/:id", (req, res) => {
  const idx = vehicles.findIndex(v => v.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ success: false, message: "Vehicle not found." });

  const errors = validate(req.body);
  if (errors.length) return res.status(400).json({ success: false, errors });

  vehicles[idx] = {
    ...vehicles[idx],
    ...sanitize(req.body),
    id: vehicles[idx].id,
    documents: vehicles[idx].documents,
    createdAt: vehicles[idx].createdAt,
    updatedAt: new Date().toISOString(),
  };
  res.json({ success: true, data: vehicles[idx], message: "Vehicle updated successfully." });
});

// DELETE vehicle
app.delete("/api/vehicles/:id", (req, res) => {
  const idx = vehicles.findIndex(v => v.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ success: false, message: "Vehicle not found." });
  vehicles.splice(idx, 1);
  res.json({ success: true, message: "Vehicle deleted." });
});

// POST upload documents
app.post("/api/vehicles/:id/documents", upload.array("documents", 10), (req, res) => {
  const vehicle = vehicles.find(v => v.id === parseInt(req.params.id));
  if (!vehicle) return res.status(404).json({ success: false, message: "Vehicle not found." });

  const uploaded = req.files.map(f => ({
    filename:     f.filename,
    originalName: f.originalname,
    size:         f.size,
    url:          `/uploads/vehicles/${f.filename}`,
    uploadedAt:   new Date().toISOString(),
  }));
  vehicle.documents.push(...uploaded);
  vehicle.updatedAt = new Date().toISOString();
  res.json({ success: true, documents: vehicle.documents });
});

// GET expiry alerts across all vehicles
app.get("/api/vehicles/alerts/expiry", (req, res) => {
  const results = vehicles
    .map(v => ({ id: v.id, vehicleNo: v.vehicleNo, alerts: getExpiryAlerts(v) }))
    .filter(v => v.alerts.length > 0);
  res.json({ success: true, count: results.length, data: results });
});

// ── Start ──────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚛 Vehicle API running → http://localhost:${PORT}`);
  console.log(`   POST   /api/vehicles`);
  console.log(`   GET    /api/vehicles`);
  console.log(`   GET    /api/vehicles/:id`);
  console.log(`   PUT    /api/vehicles/:id`);
  console.log(`   DELETE /api/vehicles/:id`);
  console.log(`   POST   /api/vehicles/:id/documents`);
  console.log(`   GET    /api/vehicles/alerts/expiry`);
});