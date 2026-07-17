from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional

from ..database import get_db
from ..models import Products
from ..schemas import ProductCreate, ProductUpdate, ProductOut, MessageResponse
from ..auth import get_current_user

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("/", response_model=list[ProductOut])
def list_products(
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):
    q = db.query(Products)
    if search:
        like = f"%{search}%"
        q = q.filter(
            (Products.name.ilike(like)) | (Products.description.ilike(like))
        )
    return q.order_by(Products.id.desc()).all()


@router.get("/{id}", response_model=ProductOut)
def get_product(
    id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):
    product = db.query(Products).filter(Products.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/", response_model=ProductOut, status_code=201)
def create_product(
    body: ProductCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):
    product = Products(**body.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.put("/{id}", response_model=ProductOut)
def update_product(
    id: int,
    body: ProductUpdate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):
    product = db.query(Products).filter(Products.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    for key, value in body.model_dump().items():
        setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{id}", response_model=MessageResponse)
def delete_product(
    id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):
    product = db.query(Products).filter(Products.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    return {"message": "Product deleted"}
