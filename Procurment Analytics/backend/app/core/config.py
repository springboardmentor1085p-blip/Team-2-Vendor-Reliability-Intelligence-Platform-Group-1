from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Procurement Analytics API"
    APP_VERSION: str = "1.0.0"
    DATABASE_URL: str = "sqlite:///./procurement.db"


settings = Settings()
