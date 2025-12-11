from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/chatapp"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days
    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:8000", "http://localhost:3000"]
    
    # Application
    DEBUG: bool = True
    APP_NAME: str = "ChatApp"
    
    class Config:
        env_file = ".env"

settings = Settings()
