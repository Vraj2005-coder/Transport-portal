"""
Transport Management Portal — FastAPI Application Entry Point
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import close_mongo_connection, connect_to_mongo
from app.routes import auth, vehicles, admin, driver


# ──────────────────────────────────────────────────────────────────────────────
# Lifespan: startup and shutdown events
# ──────────────────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle MongoDB connection on startup and cleanup on shutdown."""
    await connect_to_mongo()
    yield
    await close_mongo_connection()


# ──────────────────────────────────────────────────────────────────────────────
# App initialization
# ──────────────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Transport Management Portal API",
    description="""
## 🚛 Transport Management Portal

Backend API for managing transport fleets, drivers, and operations.

### Roles
- **Owner** — Manages trucks, creates driver accounts, tracks fleet
- **Driver** — Assigned to a truck by an owner, views their own data

### Auth Flow
1. Owner registers via `/api/auth/register/owner`
2. Owner logs in → gets `access_token` + `refresh_token`
3. Owner creates drivers via `/api/auth/drivers` (requires Bearer token)
4. Driver logs in via `/api/auth/login` → gets their own tokens
5. Frontend uses `role` field to redirect to correct dashboard
    """,
    version="1.0.0",
    lifespan=lifespan,
)


# ──────────────────────────────────────────────────────────────────────────────
# CORS — allow React/Next.js frontend
# ──────────────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",    # Next.js dev
        "http://localhost:5173",    # Vite/React dev
        "http://localhost:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────────────────────────────────────────────────────────────────────
# Routers
# ──────────────────────────────────────────────────────────────────────────────

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(vehicles.router, prefix="/api/vehicles", tags=["Vehicles"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(driver.router, prefix="/api/driver", tags=["Driver"])


# ──────────────────────────────────────────────────────────────────────────────
# Health check
# ──────────────────────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
async def root():
    return {
        "service": "Transport Management Portal API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy"}
