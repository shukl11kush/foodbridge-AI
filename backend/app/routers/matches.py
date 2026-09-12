from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.database import get_db
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/matches", tags=["Matches"])

@router.post("/{match_id}/respond")
def respond_to_match(
    match_id: int,
    req: schemas.MatchRespondRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    match_obj = db.query(models.Match).filter(models.Match.id == match_id).first()
    if not match_obj:
        raise HTTPException(status_code=404, detail="Match not found")

    if match_obj.shelter_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only assigned shelter can respond to match")

    if req.action == "accept":
        match_obj.status = "accepted"
        # Update listing status to matched
        if match_obj.listing:
            match_obj.listing.status = "matched"
            
        # Log outcome record
        outcome = models.Outcome(
            match_id=match_obj.id,
            final_status="accepted",
            notes=req.reason or "Shelter accepted offer."
        )
        db.add(outcome)
    elif req.action == "decline":
        match_obj.status = "declined"
        outcome = models.Outcome(
            match_id=match_obj.id,
            final_status="declined",
            notes=req.reason or "Shelter declined offer."
        )
        db.add(outcome)

    db.commit()
    return {"message": f"Match {req.action}ed successfully", "status": match_obj.status}
