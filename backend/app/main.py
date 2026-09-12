import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal, DB_TYPE
from app import models
from app.services.auth_service import get_password_hash
from app.routers import auth, listings, matches, shelters, admin

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("foodbridge")

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="FoodBridge-AI Surplus Food Donation & AI Matching Platform"
)

# CORS Middleware setup for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(listings.router)
app.include_router(matches.router)
app.include_router(shelters.router)
app.include_router(admin.router)

@app.on_event("startup")
def seed_demo_data():
    """Seeds initial demo accounts and shelters if database is empty."""
    db = SessionLocal()
    try:
        if db.query(models.User).count() == 0:
            logger.info("Seeding initial demo data for FoodBridge-AI...")
            
            # 1. Admin Account
            admin_user = models.User(
                name="System Administrator",
                email="admin@foodbridge.org",
                password_hash=get_password_hash("admin123"),
                role="admin",
                verification_status="verified"
            )
            db.add(admin_user)

            # 2. Demo Restaurant (Donor)
            restaurant_user = models.User(
                name="Bistro Gourmet & Bakery",
                email="donor@bistrogourmet.com",
                password_hash=get_password_hash("donor123"),
                role="restaurant",
                verification_status="verified"
            )
            db.add(restaurant_user)
            db.commit()

            rest_prof = models.RestaurantProfile(
                user_id=restaurant_user.id,
                address="742 Market Street, San Francisco, CA",
                latitude=37.7882,
                longitude=-122.4024,
                food_safety_cert="CERT-SF-2026-99"
            )
            db.add(rest_prof)

            # 3. Demo Shelters (Recipients)
            shelter1 = models.User(
                name="St. Vincent Bay Hope Shelter",
                email="contact@bayhopeshelter.org",
                password_hash=get_password_hash("shelter123"),
                role="shelter",
                verification_status="verified"
            )
            db.add(shelter1)
            db.commit()

            s1_prof = models.ShelterProfile(
                user_id=shelter1.id,
                address="1050 Howard Street, San Francisco, CA",
                latitude=37.7801,
                longitude=-122.4080,
                capacity_servings=150,
                storage_type="Both",
                dietary_notes="Accommodates vegetarian, halal, and standard prepared hot meals.",
                service_hours="7 AM - 9 PM Daily",
                need_tags="Prepared Meals, Fresh Produce, Dairy"
            )
            db.add(s1_prof)

            shelter2 = models.User(
                name="Community Table & Urban Kitchen",
                email="info@communitytable.org",
                password_hash=get_password_hash("shelter123"),
                role="shelter",
                verification_status="verified"
            )
            db.add(shelter2)
            db.commit()

            s2_prof = models.ShelterProfile(
                user_id=shelter2.id,
                address="450 Mission Street, San Francisco, CA",
                latitude=37.7905,
                longitude=-122.3985,
                capacity_servings=80,
                storage_type="Refrigerated",
                dietary_notes="High priority for fresh produce, dairy, and cold bakery goods.",
                service_hours="8 AM - 6 PM Daily",
                need_tags="Fresh Produce, Bakery, Dairy"
            )
            db.add(s2_prof)

            shelter3 = models.User(
                name="Tenderloin Youth & Family Outreach",
                email="intake@tenderloinoutreach.org",
                password_hash=get_password_hash("shelter123"),
                role="shelter",
                verification_status="verified"
            )
            db.add(shelter3)
            db.commit()

            s3_prof = models.ShelterProfile(
                user_id=shelter3.id,
                address="220 Eddy Street, San Francisco, CA",
                latitude=37.7845,
                longitude=-122.4120,
                capacity_servings=200,
                storage_type="Both",
                dietary_notes="Seeks packaged items, sandwiches, baked goods, and fruit.",
                service_hours="24/7 Intake",
                need_tags="Packaged Goods, Bakery, Sandwiches"
            )
            db.add(s3_prof)

            db.commit()
            logger.info("Demo data seeding completed successfully.")
    except Exception as e:
        logger.error(f"Error seeding demo data: {e}")
    finally:
        db.close()

@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database_type": DB_TYPE
    }
