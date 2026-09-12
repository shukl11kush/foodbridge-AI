# Product Requirements Document (PRD)
## FoodBridge-AI

**Version:** 1.0
**Status:** Draft
**Author:** Product Team
**Last Updated:** September 13, 2026

---

## 1. Executive Summary

FoodBridge-AI is a web platform that connects restaurants and food businesses with surplus edible food to the shelters and community organizations best equipped to receive, store, and distribute it. The platform uses an AI orchestration layer to intelligently match surplus food listings to the most suitable recipient — factoring in food type, quantity, perishability, location/distance, shelter capacity, and urgency — reducing food waste and improving food security outcomes for underserved communities.

---

## 2. Problem Statement

- Restaurants and food businesses regularly discard usable surplus food due to lack of an easy, fast way to identify a nearby shelter that can actually use it (right quantity, right food type, right time window).
- Shelters and community kitchens often have unpredictable food supply and no visibility into what surplus is available nearby, when, or in what quantity.
- Manual coordination (phone calls, word of mouth, generic donation apps) is slow, doesn't account for shelter-specific constraints (storage, dietary restrictions, capacity, pickup logistics), and often results in mismatched or missed donations.

**Opportunity:** An AI-assisted matching layer can turn a simple "I have surplus food" listing into a ranked, explainable shortlist of the best-fit shelters — increasing successful handoffs and reducing waste.

---

## 3. Goals & Success Metrics

### Goals
1. Make it fast (under 2 minutes) for a restaurant to list surplus food.
2. Automatically surface the best-matched shelters/communities for each listing using AI.
3. Give shelters a simple dashboard to view, accept, and manage incoming donations.
4. Track outcomes (accepted, picked up, expired) to improve future matching.

### Success Metrics (KPIs)
| Metric | Target (Post-MVP, 3 months) |
|---|---|
| Avg. time from listing creation to shelter match shown | < 30 seconds |
| Listing-to-acceptance conversion rate | > 60% |
| Food listings expiring unclaimed | < 15% |
| Restaurant retention (repeat listings/month) | > 50% |
| Shelter satisfaction (match relevance rating) | > 4/5 avg |

---

## 4. Target Users & Personas

### Persona 1: Restaurant/Food Business ("Donor")
Restaurant manager or staff member with leftover prepared food, bakery items, or produce at end of day/service. Needs a fast, low-friction way to list food and trust that it goes somewhere useful.

### Persona 2: Shelter / Community Organization ("Recipient")
Shelter coordinator or NGO staff managing food intake for people in need. Needs visibility into available donations that actually fit their capacity, dietary needs, and pickup logistics.

### Persona 3: Platform Admin
Oversees verification of restaurants/shelters, monitors matching quality, and handles disputes or data issues.

---

## 5. Scope

### In Scope (MVP)
- Restaurant and shelter account registration & profile management
- Surplus food listing creation (type, quantity, perishability, pickup window, location)
- AI-powered shelter matching and ranking per listing
- Shelter-side dashboard to view/accept/decline matches
- Basic notification of match status
- Admin view for user verification and monitoring

### Out of Scope (MVP)
- Payment/billing processing
- Real-time delivery/logistics tracking (e.g., live courier GPS)
- Native mobile apps (web-responsive only for MVP)
- Multi-language support (English only for MVP)
- Nutrition/allergen certification workflows

---

## 6. Core Features

### 6.1 Restaurant (Donor) Features
- **Sign up / Login** with restaurant profile (name, address, contact, food safety cert optional)
- **Create Surplus Listing**: food category, description, quantity/servings estimate, perishability level, ready-by and pickup-window time, photos (optional)
- **View Match Results**: AI-ranked list of best-fit shelters with match rationale (e.g., "2.1 km away, accepts perishables, capacity available")
- **Confirm Handoff**: mark listing as picked up / cancelled
- **Listing History**: past donations and outcomes

### 6.2 Shelter (Recipient) Features
- **Sign up / Login** with shelter profile (capacity, dietary restrictions/accommodations, storage type — refrigerated/dry, service hours, population served/day)
- **Incoming Matches Dashboard**: see AI-suggested listings relevant to them, ranked by fit
- **Accept / Decline** a match, with optional reason
- **Availability Settings**: toggle current capacity/needs (e.g., "need protein," "no refrigeration this week")

### 6.3 AI Matching Engine (Core Differentiator)
For each new listing, the AI orchestration layer:
1. Extracts/normalizes structured attributes from the listing (food type, quantity, perishability, urgency).
2. Retrieves candidate shelters from the database filtered by hard constraints (distance radius, active status, storage compatibility).
3. Scores/ranks candidates using the Gen AI model considering:
   - Distance / travel feasibility within pickup window
   - Shelter capacity vs. quantity offered
   - Dietary/storage compatibility (e.g., refrigerated items require cold storage)
   - Historical reliability (past accept/pickup rate)
   - Urgency (perishability vs. shelter's next service time)
4. Returns a ranked shortlist (top 3–5) with a short natural-language rationale per shelter, shown to the restaurant.
5. Learns from outcomes (accepted/declined/expired) to refine future ranking signals.

### 6.4 Admin Features
- Verify restaurant/shelter accounts
- Monitor active listings and match success rates
- Basic reporting dashboard (listings created, matched, expired)

---

## 7. Technical Architecture

### 7.1 Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React.js (Vite scaffold), Tailwind CSS / clean inline CSS, slate/blue theme, `lucide-react` icons (Sparkles, Package, MapPin, MessageSquare, RefreshCw, CheckCircle2) |
| Backend API | Python 3.x, FastAPI, Uvicorn (port 5000), Pydantic schemas |
| Database | Oracle Database (Thin Mode), `oracledb` library, isolated schema user |
| AI Orchestration | Google Gen AI SDK (`google-genai`), Gemini model on free tier |

> **Note:** Please confirm the exact Gemini model name/version available on your Google AI free tier at implementation time — model availability and naming change periodically, and the free tier has rate limits worth checking before committing to a production matching flow.

### 7.2 High-Level Architecture
```
[React + Vite Frontend]
        |  (REST/JSON over HTTPS)
        v
[FastAPI Backend on Uvicorn :5000]
   |-- Auth & Profile Services
   |-- Listings Service
   |-- Matching Orchestration Service ---> [Google Gen AI SDK / Gemini]
   |-- Notification Service
        |
        v
[Oracle Database (oracledb, Thin Mode)]
   - Users, Restaurants, Shelters
   - Listings, Matches, Outcomes
```

### 7.3 Core Data Model (Simplified)
- **User** (id, role: restaurant/shelter/admin, name, email, auth info, verification_status)
- **RestaurantProfile** (user_id, address, lat/long, food_safety_cert)
- **ShelterProfile** (user_id, address, lat/long, capacity, storage_type, dietary_notes, service_hours)
- **FoodListing** (id, restaurant_id, category, description, quantity, perishability, ready_by, pickup_window_start/end, status, created_at)
- **Match** (id, listing_id, shelter_id, ai_score, ai_rationale, status: pending/accepted/declined/expired, created_at)
- **Outcome** (match_id, final_status: picked_up/no_show/cancelled, timestamp)

### 7.4 Key API Endpoints (Illustrative)
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register restaurant/shelter/admin |
| POST | `/api/auth/login` | Login |
| POST | `/api/listings` | Create surplus food listing |
| GET | `/api/listings/{id}/matches` | Get AI-ranked shelter matches |
| POST | `/api/matches/{id}/respond` | Shelter accepts/declines a match |
| PATCH | `/api/listings/{id}/status` | Update listing status (picked up/cancelled) |
| GET | `/api/shelters/{id}/dashboard` | Shelter's incoming matches |
| GET | `/api/admin/overview` | Admin monitoring dashboard |

---

## 8. Non-Functional Requirements

- **Performance**: Match results returned within ~2–5 seconds of listing submission (dependent on Gen AI API latency).
- **Reliability**: Graceful fallback to a rule-based scoring method if the Gen AI API is unavailable or rate-limited (important given free-tier constraints).
- **Security**: Password hashing, role-based access control, isolated Oracle schema per environment, HTTPS everywhere.
- **Data Privacy**: Minimal PII collection; shelter/restaurant location data used only for matching, not exposed publicly beyond approximate distance.
- **Scalability**: Stateless FastAPI service design to allow horizontal scaling behind a load balancer later.
- **Auditability**: Log AI match rationale and scores per decision for transparency and future model evaluation.

---

## 9. Assumptions & Risks

| Item | Type | Notes |
|---|---|---|
| Gemini free-tier rate limits | Risk | May throttle matching during high-listing-volume periods; need caching/fallback logic |
| Oracle DB thin-mode connectivity | Risk | Requires correct network/firewall config to Oracle instance; verify early |
| Shelter data accuracy (capacity, hours) | Risk | Stale shelter profiles could reduce match quality; consider periodic re-confirmation prompts |
| Restaurant adoption | Assumption | Restaurants are willing to spend 1–2 minutes per listing |
| Model output reliability | Risk | Gen AI rationale/scoring should be validated against hard constraints server-side, not trusted blindly |

---

## 10. Milestones (Suggested)

| Phase | Deliverable |
|---|---|
| Phase 1 | Auth, profiles, DB schema, basic listing CRUD |
| Phase 2 | Rule-based matching (distance + capacity filters) as fallback baseline |
| Phase 3 | AI orchestration layer integrated for ranked matching + rationale |
| Phase 4 | Shelter dashboard, notifications, admin panel |
| Phase 5 | Pilot with a small set of real restaurants/shelters, gather feedback, iterate |

---

## 11. Open Questions

1. Should restaurants be able to see shelter contact info directly, or should the platform mediate pickup coordination (e.g., in-app messaging)?
2. What geographic radius should be the default search boundary for matching?
3. Do shelters need to specify dietary/allergen restrictions in structured form, or free text parsed by AI?
4. How should the system handle listings that get zero eligible shelter matches?
5. What's the plan if Gemini free-tier limits are hit during peak hours — queue, delay, or fallback to rule-based only?

