from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
import jwt

from app.database import get_db
from app.models import User
from app.crud import pwd_context

router = APIRouter()

SECRET_KEY = "PTYUSUF_SUPER_SECRET_KEY_REPLACE_IN_PRODUCTION"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 7 days

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/login", response_model=dict)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    OAuth2 compatible token login, gets username and password from form data
    """
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Pack role and user_id directly inside the token
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role.value, "user_id": user.user_id},
        expires_delta=access_token_expires
    )
    
    # Return token as per OAuth2 spec (+ additional helpful data for the frontend)
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "role": user.role.value,
        "nama_lengkap": user.nama_lengkap,
        "user_id": user.user_id,
        "username": user.username,
    }
