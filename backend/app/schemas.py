from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# Auth Schemas
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str # 'restaurant', 'shelter', 'admin'
    
    # Profile details
    address: str = "123 Main St, Cityville"
    food_safety_cert: Optional[str] = "CERT-99821"
    
    # Shelter specific
    capacity_servings: Optional[int] = 100
    storage_type: Optional[str] = "Both" # 'Refrigerated', 'Dry', 'Both'
    dietary_notes: Optional[str] = "All foods accepted"
    service_hours: Optional[str] = "8 AM - 8 PM"
    need_tags: Optional[str] = "Prepared Foods, Bakery, Fresh Produce"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    name: str
    email: str
    role: str

class UserProfileResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    verification_status: str
    restaurant_profile: Optional[dict] = None
    shelter_profile: Optional[dict] = None

    class Config:
        from_attributes = True

# Listing Schemas
class FoodListingCreate(BaseModel):
    category: str # 'Prepared Meals', 'Bakery', 'Produce', 'Dairy', 'Packaged'
    description: str
    quantity_servings: int
    perishability_level: str # 'High', 'Medium', 'Low'
    ready_by: str
    pickup_window_end: str

class MatchResponse(BaseModel):
    id: int
    listing_id: int
    shelter_id: int
    shelter_name: str
    shelter_address: str
    ai_score: float
    ai_rationale: str
    is_fallback: bool
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class FoodListingResponse(BaseModel):
    id: int
    restaurant_id: int
    restaurant_name: str
    category: str
    description: str
    quantity_servings: int
    perishability_level: str
    ready_by: str
    pickup_window_end: str
    status: str
    created_at: datetime
    matches: List[MatchResponse] = []

    class Config:
        from_attributes = True

class MatchRespondRequest(BaseModel):
    action: str # 'accept', 'decline'
    reason: Optional[str] = None

class ListingStatusUpdate(BaseModel):
    status: str # 'picked_up', 'cancelled'
