from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import secrets

from ..database import get_db
from ..models import Users, Sessions
from ..schemas import (
    UserRegister,
    UserLogin,
    UserOut,
    AuthResponse,
)
from ..auth import verify_password, get_password_hash, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", status_code=201)
def register(body: UserRegister, db: Session = Depends(get_db)):
    if db.query(Users).filter(Users.username == body.username).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already taken",
        )
    hashed = get_password_hash(body.password)
    user = Users(
        username=body.username,
        password=hashed,
        full_name=body.full_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserOut.model_validate(user)


@router.post("/login")
def login(body: UserLogin, db: Session = Depends(get_db)):
    user = db.query(Users).filter(Users.username == body.username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    if not verify_password(body.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    token = secrets.token_hex(32)
    session = Sessions(token=token, user_id=user.id)
    db.add(session)
    db.commit()

    return AuthResponse(
        token=token,
        user=UserOut.model_validate(user),
    )


@router.post("/logout")
def logout(db: Session = Depends(get_db), user_id: int = Depends(get_current_user)):
    # Delete all sessions for the current user
    db.query(Sessions).filter(Sessions.user_id == user_id).delete()
    db.commit()
    return {"message": "Logged out"}


@router.get("/me", response_model=UserOut)
def me(db: Session = Depends(get_db), user_id: int = Depends(get_current_user)):
    user = db.query(Users).filter(Users.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return UserOut.model_validate(user)
