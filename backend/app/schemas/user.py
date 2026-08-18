from typing import Optional

from pydantic import BaseModel, EmailStr


class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str = "User"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class GoogleLoginRequest(BaseModel):
    credential: str


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str
    is_active: bool

    provider: Optional[str] = None
    google_id: Optional[str] = None
    profile_picture: Optional[str] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None