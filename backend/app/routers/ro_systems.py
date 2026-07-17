from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import ROSystems
from ..schemas import (
    ROSystemCreate,
    ROSystemUpdate,
    ROSystemOut,
    MessageResponse,
)
from ..auth import get_current_user

router = APIRouter(prefix="/api", tags=["ro_systems"])


@router.get("/customers/{custId}/systems", response_model=list[ROSystemOut])
def list_systems(
    custId: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):
    return (
        db.query(ROSystems)
        .filter(ROSystems.customer_id == custId)
        .order_by(ROSystems.id.desc())
        .all()
    )


@router.get("/systems/{id}", response_model=ROSystemOut)
def get_system(
    id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):
    system = db.query(ROSystems).filter(ROSystems.id == id).first()
    if not system:
        raise HTTPException(status_code=404, detail="RO system not found")
    return system


@router.post(
    "/customers/{custId}/systems", response_model=ROSystemOut, status_code=201
)
def create_system(
    custId: int,
    body: ROSystemCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):
    system = ROSystems(customer_id=custId, **body.model_dump())
    db.add(system)
    db.commit()
    db.refresh(system)
    return system


@router.put("/systems/{id}", response_model=ROSystemOut)
def update_system(
    id: int,
    body: ROSystemUpdate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):
    system = db.query(ROSystems).filter(ROSystems.id == id).first()
    if not system:
        raise HTTPException(status_code=404, detail="RO system not found")
    for key, value in body.model_dump().items():
        setattr(system, key, value)
    db.commit()
    db.refresh(system)
    return system


@router.delete("/systems/{id}", response_model=MessageResponse)
def delete_system(
    id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):
    system = db.query(ROSystems).filter(ROSystems.id == id).first()
    if not system:
        raise HTTPException(status_code=404, detail="RO system not found")
    db.delete(system)
    db.commit()
    return {"message": "RO system deleted"}
