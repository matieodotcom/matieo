"""
MATIEO ML Service — Configuration
Loads environment variables with validation via Pydantic Settings
"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Environment
    environment: str = "development"
    port: int = 8000

    # Supabase (service role — read mortality_data)
    supabase_url: str
    supabase_service_role_key: str

    # Security — only accept requests from Node API
    node_api_secret: str          # Shared secret between Node API and ML service
    allowed_origins: List[str] = ["http://localhost:3001"]

    class Config:
        env_file = f".env.{__import__('os').getenv('APP_ENV', 'development')}"
        env_file_encoding = "utf-8"


settings = Settings()
