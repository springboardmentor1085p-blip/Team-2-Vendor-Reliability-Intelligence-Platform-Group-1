from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User

from app.schemas.user import (
    UserRegister,
    UserResponse,
    UserLogin,
    GoogleLoginRequest,
    Token,
)

from app.services.auth_service import (
    register_user_service,
    login_user_service,
    google_login_service,
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_user(
    user: UserRegister,
    db: Session = Depends(get_db),
):
    return register_user_service(
        db,
        user,
    )


@router.post(
    "/login",
    response_model=Token,
)
def login_user(
    user: UserLogin,
    db: Session = Depends(get_db),
):
    return login_user_service(
        db,
        user,
    )


@router.post(
    "/google",
    response_model=Token,
)
def google_login(
    request: GoogleLoginRequest,
    db: Session = Depends(get_db),
):
    return google_login_service(
        db,
        request.credential,
    )


@router.get(
    "/me",
    response_model=UserResponse,
)
def get_current_logged_in_user(
    current_user: User = Depends(get_current_user),
):
    return current_user