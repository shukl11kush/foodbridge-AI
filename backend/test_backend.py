import os
import sys

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base, SessionLocal
from app import models
from app.services.auth_service import get_password_hash
from app.services.matching_engine import run_matching_engine

def test_full_pipeline():
    print("--- Testing Database & Models Setup ---")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Clear previous test data
    db.query(models.Outcome).delete()
    db.query(models.Match).delete()
    db.query(models.FoodListing).delete()
    db.query(models.ShelterProfile).delete()
    db.query(models.RestaurantProfile).delete()
    db.query(models.User).delete()
    db.commit()

    # Create Users
    rest_user = models.User(
        name="Artisan Bakery",
        email="bakery@test.com",
        password_hash=get_password_hash("pass123"),
        role="restaurant"
    )
    shelter_user = models.User(
        name="Hope Shelter SF",
        email="shelter@test.com",
        password_hash=get_password_hash("pass123"),
        role="shelter"
    )
    db.add(rest_user)
    db.add(shelter_user)
    db.commit()

    rest_p = models.RestaurantProfile(user_id=rest_user.id, address="100 Market St, SF", latitude=37.79, longitude=-122.40)
    shelter_p = models.ShelterProfile(user_id=shelter_user.id, address="200 Howard St, SF", latitude=37.78, longitude=-122.41, capacity_servings=100, storage_type="Both")
    db.add(rest_p)
    db.add(shelter_p)
    db.commit()

    # Create Surplus Listing
    listing = models.FoodListing(
        restaurant_id=rest_user.id,
        category="Bakery",
        description="50 freshly baked artisan croissants and sourdough bread",
        quantity_servings=50,
        perishability_level="Medium",
        ready_by="Now",
        pickup_window_end="9:00 PM"
    )
    db.add(listing)
    db.commit()

    print(f"Created listing ID: {listing.id} - '{listing.description}'")

    # Run Matching Engine
    matches = run_matching_engine(listing, db)
    print(f"Matching Engine produced {len(matches)} matches.")
    for idx, m in enumerate(matches, 1):
        print(f"  Match #{idx}: Shelter ID {m.shelter_id} | Score: {m.ai_score}% | Rationale: {m.ai_rationale}")

    print("--- Full Pipeline Test PASSED ---")

if __name__ == "__main__":
    test_full_pipeline()
