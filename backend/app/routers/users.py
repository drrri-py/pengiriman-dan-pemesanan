from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud, schemas
from app.database import get_db

router = APIRouter()

# --- USERS ---
@router.post("/users/", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return crud.create_user(db=db, user=user)

@router.get("/users/", response_model=list[schemas.UserResponse])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_users(db, skip=skip, limit=limit)

@router.patch("/users/{user_id}", response_model=schemas.UserResponse)
def update_user(user_id: int, user_update: schemas.UserUpdate, db: Session = Depends(get_db)):
    # prevent duplicate usernames
    if user_update.username:
        existing = crud.get_user_by_username(db, username=user_update.username)
        if existing and existing.user_id != user_id:
            raise HTTPException(status_code=400, detail="Username already registered")
    return crud.update_user(db=db, user_id=user_id, user_update=user_update)

@router.delete("/users/{user_id}", response_model=dict)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    crud.delete_user(db=db, user_id=user_id)
    return {"ok": True}

# --- OWNER PROFILE ---
@router.post("/profile/", response_model=schemas.OwnerProfileResponse)
def create_owner_profile(profile: schemas.OwnerProfileCreate, db: Session = Depends(get_db)):
    db_profile = crud.get_owner_profile(db)
    if db_profile:
        raise HTTPException(status_code=400, detail="Owner profile already exists")
    return crud.create_owner_profile(db=db, profile=profile)

@router.get("/profile/", response_model=schemas.OwnerProfileResponse)
def read_owner_profile(db: Session = Depends(get_db)):
    db_profile = crud.get_owner_profile(db)
    if not db_profile:
        raise HTTPException(status_code=404, detail="Owner profile not found")
    return db_profile

@router.put("/profile/", response_model=schemas.OwnerProfileResponse)
def update_owner_profile(profile: schemas.OwnerProfileCreate, db: Session = Depends(get_db)):
    """
    Update profil pemilik. Jika belum ada, akan dibuat baru.
    """
    db_profile = crud.get_owner_profile(db)
    if not db_profile:
        return crud.create_owner_profile(db=db, profile=profile)

    data = profile.model_dump()
    for field, value in data.items():
        setattr(db_profile, field, value)

    db.commit()
    db.refresh(db_profile)
    return db_profile
