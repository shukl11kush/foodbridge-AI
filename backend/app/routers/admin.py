from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models
from app.database import get_db
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/admin", tags=["Admin"])

@router.get("/overview")
def get_admin_overview(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin authorization required")

    total_users = db.query(models.User).count()
    restaurants_count = db.query(models.User).filter(models.User.role == "restaurant").count()
    shelters_count = db.query(models.User).filter(models.User.role == "shelter").count()
    
    total_listings = db.query(models.FoodListing).count()
    active_listings = db.query(models.FoodListing).filter(models.FoodListing.status == "active").count()
    matched_listings = db.query(models.FoodListing).filter(models.FoodListing.status == "matched").count()
    picked_up_listings = db.query(models.FoodListing).filter(models.FoodListing.status == "picked_up").count()

    total_matches = db.query(models.Match).count()
    accepted_matches = db.query(models.Match).filter(models.Match.status == "accepted").count()
    ai_matches = db.query(models.Match).filter(models.Match.is_fallback == False).count()
    rule_matches = db.query(models.Match).filter(models.Match.is_fallback == True).count()

    conversion_rate = round((accepted_matches / total_matches * 100), 1) if total_matches > 0 else 0.0

    return {
        "metrics": {
            "total_users": total_users,
            "restaurants_count": restaurants_count,
            "shelters_count": shelters_count,
            "total_listings": total_listings,
            "active_listings": active_listings,
            "matched_listings": matched_listings,
            "picked_up_listings": picked_up_listings,
            "total_matches": total_matches,
            "accepted_matches": accepted_matches,
            "conversion_rate_pct": conversion_rate,
            "ai_matches_count": ai_matches,
            "rule_matches_count": rule_matches
        }
    }

@router.get("/users")
def get_admin_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin authorization required")
    
    users = db.query(models.User).all()
    res = []
    for u in users:
        res.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "verification_status": u.verification_status,
            "created_at": u.created_at
        })
    return res
