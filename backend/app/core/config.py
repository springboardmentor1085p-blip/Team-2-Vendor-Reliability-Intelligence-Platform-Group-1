from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    PROJECT_NAME: str
    PROJECT_VERSION: str

    DATABASE_URL: str

    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    GOOGLE_CLIENT_ID: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
    )


settings = Settings()