from typing import Optional
from pydantic import BaseModel, EmailStr

class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    is_active: bool

    class Config:
        from_attributes = True


class UpdateProfileRequest(BaseModel):
    name: str
    email: EmailStr
    profile_image_url: Optional[str] = None


class ProfileResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    is_active: bool
    profile_image_url: Optional[str] = None

    class Config:
        from_attributes = True
