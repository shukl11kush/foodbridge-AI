from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import models, schemas
from app.database import get_db
from app.services.auth_service import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/register", response_model=schemas.TokenResponse)
def register_user(req: schemas.UserRegister, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = models.User(
        name=req.name,
        email=req.email,
        password_hash=get_password_hash(req.password),
        role=req.role,
        verification_status="verified"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create associated profile
    if req.role == "restaurant":
        rest_prof = models.RestaurantProfile(
            user_id=new_user.id,
            address=req.address,
            food_safety_cert=req.food_safety_cert
        )
        db.add(rest_prof)
    elif req.role == "shelter":
        shelter_prof = models.ShelterProfile(
            user_id=new_user.id,
            address=req.address,
            capacity_servings=req.capacity_servings or 100,
            storage_type=req.storage_type or "Both",
            dietary_notes=req.dietary_notes or "All accepted",
            service_hours=req.service_hours or "8 AM - 8 PM",
            need_tags=req.need_tags or "Prepared Foods"
        )
        db.add(shelter_prof)
    db.commit()

    token = create_access_token({"sub": new_user.id, "role": new_user.role})
    return schemas.TokenResponse(
        access_token=token,
        user_id=new_user.id,
        name=new_user.name,
        email=new_user.email,
        role=new_user.role
    )

@router.post("/login", response_model=schemas.TokenResponse)
def login_user(req: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == req.email).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    token = create_access_token({"sub": user.id, "role": user.role})
    return schemas.TokenResponse(
        access_token=token,
        user_id=user.id,
        name=user.name,
        email=user.email,
        role=user.role
    )

@router.get("/me")
def get_user_me(current_user: models.User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "verification_status": current_user.verification_status
    }
