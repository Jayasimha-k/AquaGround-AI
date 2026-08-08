import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    gemini_model: str = os.getenv("GEMINI_MODEL", "gemini-flash-latest")
    app_name: str = "AquaGround AI Backend"
    debug: bool = False
    
    # Auth & Database
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./aquaground.db")
    jwt_secret: str = os.getenv("JWT_SECRET", "aquaground_super_secret_key_2026")
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24
    
    # SMTP Email Configuration
    smtp_host: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port: int = int(os.getenv("SMTP_PORT", "587"))
    smtp_user: str = os.getenv("SMTP_USER", "")
    smtp_password: str = os.getenv("SMTP_PASSWORD", "")
    smtp_from_email: str = os.getenv("SMTP_FROM_EMAIL", "alerts@aquaground.gov.in")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
