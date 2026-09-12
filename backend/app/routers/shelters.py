from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.database import get_db
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/shelters", tags=["Shelters"])

@router.get("/dashboard")
def get_shelter_dashboard(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "shelter":
        raise HTTPException(status_code=403, detail="Only shelters can view shelter dashboard")

    # Fetch matches assigned to this shelter
    matches = db.query(models.Match).filter(models.Match.shelter_id == current_user.id).order_by(models.Match.created_at.desc()).all()

    offers = []
    for m in matches:
        listing = m.listing
        if not listing:
            continue
        rest_u = db.query(models.User).filter(models.User.id == listing.restaurant_id).first()
        rest_p = rest_u.restaurant_profile if rest_u else None
        
        offers.append({
            "match_id": m.id,
            "listing_id": listing.id,
            "restaurant_name": rest_u.name if rest_u else "Local Restaurant",
            "restaurant_address": rest_p.address if rest_p else "123 Main St",
            "category": listing.category,
            "description": listing.description,
            "quantity_servings": listing.quantity_servings,
            "perishability_level": listing.perishability_level,
            "ready_by": listing.ready_by,
            "pickup_window_end": listing.pickup_window_end,
            "ai_score": m.ai_score,
            "ai_rationale": m.ai_rationale,
            "is_fallback": m.is_fallback,
            "match_status": m.status,
            "listing_status": listing.status,
            "created_at": m.created_at
        })

    profile = current_user.shelter_profile
    return {
        "shelter_info": {
            "name": current_user.name,
            "address": profile.address if profile else "San Francisco, CA",
            "capacity_servings": profile.capacity_servings if profile else 100,
            "storage_type": profile.storage_type if profile else "Both",
            "dietary_notes": profile.dietary_notes if profile else "All accepted",
            "need_tags": profile.need_tags if profile else "General"
        },
        "offers": offers
    }
