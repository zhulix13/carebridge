from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Multilingual Hospital Appointment API"
    database_url: str = "sqlite:///./hospital.db"
    jwt_secret: str = "change-this-secret-before-deployment"
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 60
    cors_origin: str = "http://localhost:5173"
    language_model_path: str = "../ml/language_model.pkl"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origin.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
