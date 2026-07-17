from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional

from ..database import get_db
from ..models import StoreProducts, StoreCart, StoreReviews
from ..schemas import (
    StoreProductOut,
    StoreProductDetail,
    StoreReviewCreate,
    StoreReviewOut,
    CartItemCreate,
    CartItemUpdate,
    CartItemOut,
    MessageResponse,
)

router = APIRouter(prefix="/api/store", tags=["store"])


# ─── Products ───
@router.get("/products", response_model=list[StoreProductOut])
def list_products(
    store_type: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    featured: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(StoreProducts)
    conditions = []

    if store_type:
        conditions.append(StoreProducts.store_type == store_type)
    if category:
        conditions.append(StoreProducts.category == category)
    if search:
        like = f"%{search}%"
        conditions.append(
            (StoreProducts.name.ilike(like))
            | (StoreProducts.description.ilike(like))
            | (StoreProducts.brand.ilike(like))
        )
    if featured == "true":
        conditions.append(StoreProducts.is_featured == True)

    if conditions:
        from sqlalchemy import and_

        q = q.filter(and_(*conditions))

    return q.order_by(StoreProducts.is_featured.desc(), StoreProducts.id).all()


@router.get("/products/{id}", response_model=StoreProductDetail)
def get_product(id: int, db: Session = Depends(get_db)):
    product = db.query(StoreProducts).filter(StoreProducts.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    reviews = (
        db.query(StoreReviews)
        .filter(StoreReviews.product_id == id)
        .order_by(StoreReviews.created_at.desc())
        .all()
    )
    result = StoreProductDetail.model_validate(product)
    result.reviews = [StoreReviewOut.model_validate(r) for r in reviews]
    return result


@router.get("/categories", response_model=list[str])
def list_categories(
    store_type: Optional[str] = Query("ro"),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(StoreProducts.category)
        .filter(StoreProducts.store_type == store_type)
        .distinct()
        .order_by(StoreProducts.category)
        .all()
    )
    return [r[0] for r in rows]


# ─── Cart ───
@router.get("/cart", response_model=list[CartItemOut])
def get_cart(
    session_id: str = Query(...),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(StoreCart, StoreProducts)
        .join(StoreProducts, StoreCart.product_id == StoreProducts.id)
        .filter(StoreCart.session_id == session_id)
        .order_by(StoreCart.id)
        .all()
    )
    result = []
    for cart_item, product in rows:
        item = CartItemOut(
            id=cart_item.id,
            session_id=cart_item.session_id,
            product_id=cart_item.product_id,
            qty=cart_item.qty,
            name=product.name,
            brand=product.brand,
            category=product.category,
            store_type=product.store_type,
            price=float(product.price) if product.price else None,
            images=product.images,
            specs=product.specs,
            description=product.description,
            features=product.features,
            warranty=product.warranty,
            is_featured=product.is_featured,
            created_at=cart_item.created_at,
        )
        result.append(item)
    return result


@router.post("/cart", status_code=201)
def add_to_cart(
    body: CartItemCreate,
    db: Session = Depends(get_db),
):
    existing = (
        db.query(StoreCart)
        .filter(
            StoreCart.session_id == body.session_id,
            StoreCart.product_id == body.product_id,
        )
        .first()
    )
    if existing:
        existing.qty += body.qty or 1
        db.commit()
        db.refresh(existing)
        return {
            "id": existing.id,
            "session_id": existing.session_id,
            "product_id": existing.product_id,
            "qty": existing.qty,
        }

    cart_item = StoreCart(
        session_id=body.session_id,
        product_id=body.product_id,
        qty=body.qty or 1,
    )
    db.add(cart_item)
    db.commit()
    db.refresh(cart_item)
    return {
        "id": cart_item.id,
        "session_id": cart_item.session_id,
        "product_id": cart_item.product_id,
        "qty": cart_item.qty,
    }


@router.put("/cart/{id}")
def update_cart(
    id: int,
    body: CartItemUpdate,
    db: Session = Depends(get_db),
):
    if body.qty <= 0:
        db.query(StoreCart).filter(StoreCart.id == id).delete()
        db.commit()
        return {"message": "Removed"}

    cart_item = db.query(StoreCart).filter(StoreCart.id == id).first()
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    cart_item.qty = body.qty
    db.commit()
    db.refresh(cart_item)
    return {
        "id": cart_item.id,
        "session_id": cart_item.session_id,
        "product_id": cart_item.product_id,
        "qty": cart_item.qty,
    }


@router.delete("/cart/{id}", response_model=MessageResponse)
def remove_from_cart(id: int, db: Session = Depends(get_db)):
    db.query(StoreCart).filter(StoreCart.id == id).delete()
    db.commit()
    return {"message": "Removed"}


# ─── Reviews ───
@router.post("/reviews", response_model=StoreReviewOut, status_code=201)
def add_review(body: StoreReviewCreate, db: Session = Depends(get_db)):
    review = StoreReviews(**body.model_dump())
    db.add(review)
    db.commit()
    db.refresh(review)
    return review
