from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from google.oauth2 import id_token
from google.auth.transport import requests

from app.core.config import settings
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
)

from app.crud.user import (
    create_user,
    update_user,
    get_user_by_email,
    get_user_by_google_id,
)

from app.models.user import User

from app.schemas.user import (
    UserRegister,
    UserLogin,
)

# -------------------------------------------------------
# Normal Registration
# -------------------------------------------------------

def register_user_service(
    db: Session,
    user: UserRegister,
):

    email = user.email.strip().lower()

    existing_user = get_user_by_email(
        db,
        email,
    )

    if existing_user:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    new_user = User(

        full_name=user.full_name.strip(),

        email=email,

        hashed_password=hash_password(
            user.password
        ),

        role=user.role,

        provider="local",

        google_id=None,

        profile_picture=None,

        is_active=True,

    )

    return create_user(
        db,
        new_user,
    )


# -------------------------------------------------------
# Normal Login
# -------------------------------------------------------

def login_user_service(
    db: Session,
    user: UserLogin,
):

    email = user.email.strip().lower()

    existing_user = get_user_by_email(
        db,
        email,
    )

    if existing_user is None:

        raise HTTPException(

            status_code=status.HTTP_401_UNAUTHORIZED,

            detail="Invalid email or password",

        )

    if existing_user.provider == "google":

        raise HTTPException(

            status_code=status.HTTP_400_BAD_REQUEST,

            detail="Please login using Google Sign In.",

        )

    if not verify_password(

        user.password,

        existing_user.hashed_password,

    ):

        raise HTTPException(

            status_code=status.HTTP_401_UNAUTHORIZED,

            detail="Invalid email or password",

        )

    if not existing_user.is_active:

        raise HTTPException(

            status_code=status.HTTP_403_FORBIDDEN,

            detail="User account inactive",

        )

    token = create_access_token(

        {

            "sub": existing_user.email

        }

    )

    return {

        "access_token": token,

        "token_type": "bearer",

    }


# -------------------------------------------------------
# Verify Google Token
# -------------------------------------------------------

def verify_google_token(
    credential: str,
):

    try:

        info = id_token.verify_oauth2_token(

            credential,

            requests.Request(),

            settings.GOOGLE_CLIENT_ID,

        )

        return info

    except Exception:

        raise HTTPException(

            status_code=401,

            detail="Invalid Google Token",

        )
        
        # -------------------------------------------------------
# Google Login Service
# -------------------------------------------------------

def google_login_service(
    db: Session,
    credential: str,
):

    google_user = verify_google_token(
        credential
    )

    google_id = google_user["sub"]

    email = google_user["email"].strip().lower()

    full_name = google_user.get(
        "name",
        "Google User",
    )

    picture = google_user.get(
        "picture",
        None,
    )

    existing_google_user = get_user_by_google_id(
        db,
        google_id,
    )

    if existing_google_user:

        token = create_access_token(
            {
                "sub": existing_google_user.email
            }
        )

        return {
            "access_token": token,
            "token_type": "bearer",
        }

    existing_email_user = get_user_by_email(
        db,
        email,
    )

    if existing_email_user:

        existing_email_user.provider = "google"
        existing_email_user.google_id = google_id
        existing_email_user.profile_picture = picture

        update_user(
            db,
            existing_email_user,
        )

        token = create_access_token(
            {
                "sub": existing_email_user.email
            }
        )

        return {
            "access_token": token,
            "token_type": "bearer",
        }

    new_user = User(

        full_name=full_name,

        email=email,

        hashed_password="",

        role="User",

        provider="google",

        google_id=google_id,

        profile_picture=picture,

        is_active=True,

    )

    create_user(
        db,
        new_user,
    )

    token = create_access_token(
        {
            "sub": email
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
    }