from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import models, schemas
from app.database import get_db
from app.services.auth_service import get_current_user
from app.services.matching_engine import run_matching_engine

router = APIRouter(prefix="/api/listings", tags=["Listings"])

@router.post("", response_model=schemas.FoodListingResponse)
def create_listing(
    req: schemas.FoodListingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "restaurant":
        raise HTTPException(status_code=403, detail="Only restaurants can create food listings")

    listing = models.FoodListing(
        restaurant_id=current_user.id,
        category=req.category,
        description=req.description,
        quantity_servings=req.quantity_servings,
        perishability_level=req.perishability_level,
        ready_by=req.ready_by,
        pickup_window_end=req.pickup_window_end,
        status="active"
    )
    db.add(listing)
    db.commit()
    db.refresh(listing)

    # Automatically trigger matching engine
    run_matching_engine(listing, db)
    db.refresh(listing)

    # Format matches response
    matches_res = []
    for m in listing.matches:
        shelter_u = db.query(models.User).filter(models.User.id == m.shelter_id).first()
        shelter_p = shelter_u.shelter_profile if shelter_u else None
        matches_res.append(schemas.MatchResponse(
            id=m.id,
            listing_id=m.listing_id,
            shelter_id=m.shelter_id,
            shelter_name=shelter_u.name if shelter_u else "Local Shelter",
            shelter_address=shelter_p.address if shelter_p else "San Francisco, CA",
            ai_score=m.ai_score,
            ai_rationale=m.ai_rationale,
            is_fallback=m.is_fallback,
            status=m.status,
            created_at=m.created_at
        ))

    return schemas.FoodListingResponse(
        id=listing.id,
        restaurant_id=listing.restaurant_id,
        restaurant_name=current_user.name,
        category=listing.category,
        description=listing.description,
        quantity_servings=listing.quantity_servings,
        perishability_level=listing.perishability_level,
        ready_by=listing.ready_by,
        pickup_window_end=listing.pickup_window_end,
        status=listing.status,
        created_at=listing.created_at,
        matches=matches_res
    )

@router.get("", response_model=List[schemas.FoodListingResponse])
def get_user_listings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role == "restaurant":
        listings = db.query(models.FoodListing).filter(models.FoodListing.restaurant_id == current_user.id).order_by(models.FoodListing.created_at.desc()).all()
    else:
        listings = db.query(models.FoodListing).order_by(models.FoodListing.created_at.desc()).all()

    result = []
    for listing in listings:
        rest_u = db.query(models.User).filter(models.User.id == listing.restaurant_id).first()
        matches_res = []
        for m in listing.matches:
            shelter_u = db.query(models.User).filter(models.User.id == m.shelter_id).first()
            shelter_p = shelter_u.shelter_profile if shelter_u else None
            matches_res.append(schemas.MatchResponse(
                id=m.id,
                listing_id=m.listing_id,
                shelter_id=m.shelter_id,
                shelter_name=shelter_u.name if shelter_u else "Local Shelter",
                shelter_address=shelter_p.address if shelter_p else "San Francisco, CA",
                ai_score=m.ai_score,
                ai_rationale=m.ai_rationale,
                is_fallback=m.is_fallback,
                status=m.status,
                created_at=m.created_at
            ))

        result.append(schemas.FoodListingResponse(
            id=listing.id,
            restaurant_id=listing.restaurant_id,
            restaurant_name=rest_u.name if rest_u else "Restaurant",
            category=listing.category,
            description=listing.description,
            quantity_servings=listing.quantity_servings,
            perishability_level=listing.perishability_level,
            ready_by=listing.ready_by,
            pickup_window_end=listing.pickup_window_end,
            status=listing.status,
            created_at=listing.created_at,
            matches=matches_res
        ))
    return result

@router.patch("/{listing_id}/status")
def update_listing_status(
    listing_id: int,
    req: schemas.ListingStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    listing = db.query(models.FoodListing).filter(models.FoodListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    if listing.restaurant_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    listing.status = req.status
    db.commit()
    return {"message": f"Listing status updated to {req.status}"}
