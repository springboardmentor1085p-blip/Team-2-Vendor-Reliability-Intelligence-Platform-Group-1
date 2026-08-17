from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from auth_schemas import RegisterRequest, LoginRequest
from database import get_db
from jwt import create_access_token
from models.user import User


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

password_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user: RegisterRequest, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    hashed_password = password_context.hash(user.password)

    new_user = User(
        name=user.name,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role
        }
    }


@router.post("/login")
def login(user: LoginRequest, db: Session = Depends(get_db)):

    database_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not database_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    password_valid = password_context.verify(
        user.password,
        database_user.hashed_password
    )

    if not password_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    token = create_access_token({
        "sub": database_user.email,
        "user_id": database_user.id,
        "role": database_user.role
    })

    return {
        "message": "Login successful",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": database_user.id,
            "name": database_user.name,
            "email": database_user.email,
            "role": database_user.role
        }
    }