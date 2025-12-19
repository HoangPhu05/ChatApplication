from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.core.config import settings
from app.routers import auth, users, messages, conversations, cloud
from app.database.connection import SessionLocal
from app.database import models

app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG
)

@app.on_event("startup")
async def startup_event():
    """Reset all users to offline when server starts"""
    db = SessionLocal()
    try:
        db.query(models.User).update({"is_online": False})
        db.commit()
        print("✅ All users set to offline on startup")
    except Exception as e:
        print(f"❌ Error resetting user status: {e}") 
    finally:
        db.close()

# CORS middleware - Edge compatible
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cho phép tất cả origins trong development
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Mount uploads directory for static file serving
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(conversations.router, prefix="/api/conversations", tags=["Conversations"])
app.include_router(messages.router, prefix="/api/messages", tags=["Messages"])
app.include_router(cloud.router, prefix="/api/cloud", tags=["Cloud Storage"])

@app.get("/")
async def root():
    return {"message": "ChatApp API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
