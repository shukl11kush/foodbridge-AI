import math
import logging
from typing import List
from sqlalchemy.orm import Session
from app import models
from app.services.ai_service import generate_ai_matches

logger = logging.getLogger(__name__)

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance in kilometers between two lat/lon points."""
    R = 6371.0 # Radius of earth in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

def run_matching_engine(listing: models.FoodListing, db: Session) -> List[models.Match]:
    # 1. Fetch restaurant location
    restaurant_profile = db.query(models.RestaurantProfile).filter(models.RestaurantProfile.user_id == listing.restaurant_id).first()
    rest_lat = restaurant_profile.latitude if restaurant_profile else 37.7749
    rest_lng = restaurant_profile.longitude if restaurant_profile else -122.4194

    # 2. Retrieve all active shelters
    shelter_users = db.query(models.User).filter(
        models.User.role == "shelter",
        models.User.verification_status == "verified"
    ).all()

    if not shelter_users:
        # Fallback to all shelter users regardless of verification for dev demo
        shelter_users = db.query(models.User).filter(models.User.role == "shelter").all()

    candidates = []
    candidates_dict = []
    
    for s_user in shelter_users:
        sp = s_user.shelter_profile
        s_lat = sp.latitude if sp else 37.7749
        s_lng = sp.longitude if sp else -122.4194
        dist_km = haversine_distance(rest_lat, rest_lng, s_lat, s_lng)
        
        c_info = {
            "shelter_id": s_user.id,
            "shelter_name": s_user.name,
            "address": sp.address if sp else "Local Shelter",
            "distance_km": dist_km,
            "capacity_servings": sp.capacity_servings if sp else 100,
            "storage_type": sp.storage_type if sp else "Both",
            "dietary_notes": sp.dietary_notes if sp else "All accepted",
            "need_tags": sp.need_tags if sp else "General"
        }
        candidates.append(c_info)
        candidates_dict.append(c_info)

    if not candidates:
        logger.warning("No candidate shelters found.")
        return []

    # 3. Format listing payload for AI
    listing_info = {
        "category": listing.category,
        "description": listing.description,
        "quantity_servings": listing.quantity_servings,
        "perishability_level": listing.perishability_level,
        "ready_by": listing.ready_by,
        "pickup_window_end": listing.pickup_window_end
    }

    # 4. Attempt Gemini AI Matching
    ai_results = generate_ai_matches(listing_info, candidates_dict)
    
    created_matches = []
    
    if ai_results:
        logger.info("Successfully received AI matches from Gemini.")
        for item in ai_results[:5]: # Top 5
            s_id = item.get("shelter_id")
            score = float(item.get("score", 80))
            rationale = item.get("rationale", "Matched based on AI capacity and perishability evaluation.")
            
            # Verify shelter exists
            if any(c["shelter_id"] == s_id for c in candidates):
                match_obj = models.Match(
                    listing_id=listing.id,
                    shelter_id=s_id,
                    ai_score=score,
                    ai_rationale=rationale,
                    is_fallback=False,
                    status="pending"
                )
                db.add(match_obj)
                created_matches.append(match_obj)
        db.commit()
        if created_matches:
            return created_matches

    # 5. Deterministic Rule-Based Fallback Engine
    logger.info("Using Rule-Based Fallback Engine.")
    for c in candidates:
        dist_km = c["distance_km"]
        capacity = c["capacity_servings"]
        storage = c["storage_type"]

        # Base score starts at 100
        score = 100.0

        # Distance penalty (-5 per km)
        score -= min(dist_km * 5.0, 40.0)

        # Capacity evaluation
        if capacity < listing.quantity_servings:
            score -= 25.0

        # Storage compatibility
        if listing.perishability_level == "High" and storage == "Dry":
            score -= 30.0

        score = max(round(score, 1), 35.0)

        storage_str = f"refrigerated storage available ({storage})" if storage != "Dry" else "dry storage"
        rationale = f"[Rule Engine] Located {dist_km} km away with capacity for {capacity} servings and {storage_str}."

        match_obj = models.Match(
            listing_id=listing.id,
            shelter_id=c["shelter_id"],
            ai_score=score,
            ai_rationale=rationale,
            is_fallback=True,
            status="pending"
        )
        db.add(match_obj)
        created_matches.append(match_obj)

    # Sort fallback matches by score descending
    created_matches.sort(key=lambda m: m.ai_score, reverse=True)
    db.commit()

    return created_matches[:5]
