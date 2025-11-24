# backend/app/config.py
from pydantic_settings import BaseSettings
from pydantic_settings import SettingsConfigDict

class Settings(BaseSettings):
    ARANGO_ENDPOINT: str = "http://localhost:8529"
    ARANGO_USER: str = "root"
    ARANGO_PASS: str = "root"
    ARANGO_DB: str = "musicdb"
    PORT: int = 8000

    model_config = SettingsConfigDict(
        env_file = "../.env",      # <-- si tienes el .env en backend/
        env_file_encoding = "utf-8",
        extra="ignore"
    )
settings = Settings()