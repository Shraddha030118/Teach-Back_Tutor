import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

load_dotenv()

# ---------------------------------------------------------------------------
# Lifespan: connect/disconnect MongoDB on startup/shutdown
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    from database.mongodb import connect_to_mongo
    await connect_to_mongo()
    yield
    # Shutdown
    from database.mongodb import close_mongo_connection
    await close_mongo_connection()


# ---------------------------------------------------------------------------
# FastAPI application
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Teach-Back Tutor API",
    description="Backend service for Teach-Back Tutor — learn by teaching an inquisitive AI student.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# ---------------------------------------------------------------------------
# CORS — support local dev, preview URLs, and deployed production frontends
# ---------------------------------------------------------------------------
default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

env_origins = [
    o.strip()
    for o in os.getenv("ALLOWED_ORIGINS", "").split(",")
    if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(set(default_origins + env_origins)),
    allow_origin_regex=r"^https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Custom error handlers
# ---------------------------------------------------------------------------
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "message": exc.detail,
            "status_code": exc.status_code
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "status": "error",
            "message": "Validation error in request data",
            "details": exc.errors()
        }
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "status": "error",
            "message": "An unexpected server error occurred",
            "detail": str(exc)
        }
    )

# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/health", tags=["Health"], summary="Health Check")
async def health():
    from database.mongodb import is_mongo_available
    return {
        "status": "success",
        "message": "Teach-Back Tutor API is running",
        "mongodb": "connected" if is_mongo_available() else "in-memory mode"
    }

@app.get("/", tags=["Root"], summary="Root")
async def root():
    return {
        "status": "success",
        "name": "Teach-Back Tutor API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

# ---------------------------------------------------------------------------
# Mount routers
# ---------------------------------------------------------------------------
try:
    from routes.session import router as session_router
    app.include_router(session_router)
    print("[App] Session router mounted successfully.")
except Exception as e:
    print(f"[Warning] Could not mount session router: {e}")

try:
    from routes.auth import router as auth_router
    app.include_router(auth_router)
    print("[App] Auth router mounted successfully.")
except Exception as e:
    print(f"[Warning] Could not mount auth router: {e}")

# ---------------------------------------------------------------------------
# Dev entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    print(f"Starting Teach-Back Tutor API on http://{host}:{port}")
    uvicorn.run("main:app", host=host, port=port, reload=True)
