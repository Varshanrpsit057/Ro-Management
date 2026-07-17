from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import FilterReplacements
from ..schemas import (
    FilterReplacementCreate,
    FilterReplacementOut,
    MessageResponse,
)
from ..auth import get_current_user

router = APIRouter(prefix="/api", tags=["filter_replacements"])


@router.get(
    "/systems/{sysId}/filter-replacements", response_model=list[FilterReplacementOut]
)
def list_replacements(
    sysId: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):
    return (
        db.query(FilterReplacements)
        .filter(FilterReplacements.ro_system_id == sysId)
        .order_by(FilterReplacements.replaced_date.desc())
        .all()
    )


@router.post(
    "/systems/{sysId}/filter-replacements",
    response_model=FilterReplacementOut,
    status_code=201,
)
def create_replacement(
    sysId: int,
    body: FilterReplacementCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):
    # Auto-calculate next_due_date as replaced_date + 6 months if not provided
    next_due = body.next_due_date
    if not next_due and body.replaced_date:
        d = body.replaced_date
        y = d.year
        m = d.month
        day = d.day
        total_months = y * 12 + (m - 1) + 6
        ny = total_months // 12
        nm = (total_months % 12) + 1
        try:
            from datetime import date as dt_date

            next_due = dt_date(ny, nm, day)
        except ValueError:
            # Handle edge cases like Feb 30
            import calendar

            last_day = calendar.monthrange(ny, nm)[1]
            from datetime import date as dt_date

            next_due = dt_date(ny, nm, min(day, last_day))

    replacement = FilterReplacements(
        ro_system_id=sysId,
        filter_type=body.filter_type,
        replaced_date=body.replaced_date,
        next_due_date=next_due,
        cost=body.cost,
        notes=body.notes,
    )
    db.add(replacement)
    db.commit()
    db.refresh(replacement)
    return replacement


@router.delete(
    "/filter-replacements/{id}", response_model=MessageResponse
)
def delete_replacement(
    id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):
    replacement = (
        db.query(FilterReplacements)
        .filter(FilterReplacements.id == id)
        .first()
    )
    if not replacement:
        raise HTTPException(status_code=404, detail="Filter replacement not found")
    db.delete(replacement)
    db.commit()
    return {"message": "Filter replacement deleted"}
