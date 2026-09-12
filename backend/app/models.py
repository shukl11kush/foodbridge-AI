import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False) # 'restaurant', 'shelter', 'admin'
    verification_status = Column(String(50), default="verified") # 'pending', 'verified'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    restaurant_profile = relationship("RestaurantProfile", back_populates="user", uselist=False)
    shelter_profile = relationship("ShelterProfile", back_populates="user", uselist=False)
    listings = relationship("FoodListing", back_populates="restaurant")


class RestaurantProfile(Base):
    __tablename__ = "restaurant_profiles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    address = Column(String(500), nullable=False)
    latitude = Column(Float, default=37.7749)
    longitude = Column(Float, default=-122.4194)
    food_safety_cert = Column(String(255), nullable=True)

    user = relationship("User", back_populates="restaurant_profile")


class ShelterProfile(Base):
    __tablename__ = "shelter_profiles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    address = Column(String(500), nullable=False)
    latitude = Column(Float, default=37.7749)
    longitude = Column(Float, default=-122.4194)
    capacity_servings = Column(Integer, default=100) # Available servings capacity
    storage_type = Column(String(100), default="Both") # 'Refrigerated', 'Dry', 'Both'
    dietary_notes = Column(String(500), default="All foods accepted")
    service_hours = Column(String(255), default="8 AM - 8 PM")
    need_tags = Column(String(255), default="Prepared Foods, Bakery, Fresh Produce")
    is_active = Column(Boolean, default=True)

    user = relationship("User", back_populates="shelter_profile")


class FoodListing(Base):
    __tablename__ = "food_listings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    restaurant_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(String(100), nullable=False) # 'Prepared Meals', 'Bakery', 'Produce', 'Dairy', 'Packaged'
    description = Column(Text, nullable=False)
    quantity_servings = Column(Integer, nullable=False)
    perishability_level = Column(String(50), nullable=False) # 'High' (within 4h), 'Medium' (24h), 'Low' (days)
    ready_by = Column(String(100), nullable=False)
    pickup_window_end = Column(String(100), nullable=False)
    status = Column(String(50), default="active") # 'active', 'matched', 'picked_up', 'cancelled', 'expired'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    restaurant = relationship("User", back_populates="listings")
    matches = relationship("Match", back_populates="listing", cascade="all, delete-orphan")


class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    listing_id = Column(Integer, ForeignKey("food_listings.id"), nullable=False)
    shelter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    ai_score = Column(Float, nullable=False)
    ai_rationale = Column(Text, nullable=False)
    is_fallback = Column(Boolean, default=False)
    status = Column(String(50), default="pending") # 'pending', 'accepted', 'declined', 'expired'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    listing = relationship("FoodListing", back_populates="matches")
    shelter = relationship("User")
    outcome = relationship("Outcome", back_populates="match", uselist=False)


class Outcome(Base):
    __tablename__ = "outcomes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    match_id = Column(Integer, ForeignKey("matches.id"), nullable=False)
    final_status = Column(String(50), nullable=False) # 'picked_up', 'no_show', 'cancelled'
    notes = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    match = relationship("Match", back_populates="outcome")
