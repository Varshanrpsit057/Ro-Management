from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional

from ..database import get_db
from ..models import Customers
from ..schemas import CustomerCreate, CustomerUpdate, CustomerOut, MessageResponse
from ..auth import get_current_user

router = APIRouter(prefix="/api/customers", tags=["customers"])


@router.get("/", response_model=list[CustomerOut])
def list_customers(
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):
    q = db.query(Customers)
    if search:
        like = f"%{search}%"
        q = q.filter((Customers.name.ilike(like)) | (Customers.phone.ilike(like)))
    return q.order_by(Customers.id.desc()).all()


@router.get("/{id}", response_model=CustomerOut)
def get_customer(
    id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):
    customer = db.query(Customers).filter(Customers.id == id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.post("/", response_model=CustomerOut, status_code=201)
def create_customer(
    body: CustomerCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):
    existing = db.query(Customers).filter(Customers.phone == body.phone).first()
    if existing:
        raise HTTPException(status_code=409, detail="Phone number already exists")
    customer = Customers(**body.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


@router.put("/{id}", response_model=CustomerOut)
def update_customer(
    id: int,
    body: CustomerUpdate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):
    customer = db.query(Customers).filter(Customers.id == id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Check phone uniqueness if changed
    if body.phone != customer.phone:
        existing = (
            db.query(Customers)
            .filter(Customers.phone == body.phone, Customers.id != id)
            .first()
        )
        if existing:
            raise HTTPException(status_code=409, detail="Phone number already exists")

    for key, value in body.model_dump().items():
        setattr(customer, key, value)
    db.commit()
    db.refresh(customer)
    return customer


@router.delete("/{id}", response_model=MessageResponse)
def delete_customer(
    id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):
    customer = db.query(Customers).filter(Customers.id == id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    db.delete(customer)
    db.commit()
    return {"message": "Customer deleted"}
