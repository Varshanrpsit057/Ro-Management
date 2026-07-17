from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import ServiceHistory
from ..schemas import (
    ServiceHistoryCreate,
    ServiceHistoryOut,
)
from ..auth import get_current_user

router = APIRouter(prefix="/api", tags=["service_history"])


@router.get(
    "/systems/{sysId}/service-history", response_model=list[ServiceHistoryOut]
)
def list_history(
    sysId: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):
    return (
        db.query(ServiceHistory)
        .filter(ServiceHistory.ro_system_id == sysId)
        .order_by(ServiceHistory.service_date.desc())
        .all()
    )


@router.post(
    "/systems/{sysId}/service-history",
    response_model=ServiceHistoryOut,
    status_code=201,
)
def create_record(
    sysId: int,
    body: ServiceHistoryCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):
    record = ServiceHistory(
        ro_system_id=sysId,
        service_date=body.service_date,
        description=body.description,
        cost=body.cost,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record
