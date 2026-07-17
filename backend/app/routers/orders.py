from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import StoreOrders, StoreOrderItems, StoreCart, ServiceBookings
from ..schemas import (
    OrderCreate,
    OrderOut,
    OrderItemOut,
    OrderStatusUpdate,
    BookingCreate,
    BookingUpdate,
    BookingOut,
    MessageResponse,
)
from ..auth import get_current_user

router = APIRouter(tags=["orders_bookings"])


# ─── Public: Place order ───
@router.post("/api/store/orders", status_code=201)
def place_order(body: OrderCreate, db: Session = Depends(get_db)):
    total = sum(it.price * it.qty for it in body.items)

    order = StoreOrders(
        session_id=body.session_id or "",
        customer_name=body.customer_name,
        customer_phone=body.customer_phone,
        customer_address=body.customer_address,
        payment_method=body.payment_method or "cod",
        total_amount=total,
        notes=body.notes,
    )
    db.add(order)
    db.flush()

    for item in body.items:
        oi = StoreOrderItems(
            order_id=order.id,
            product_id=item.product_id,
            product_name=item.product_name,
            price=item.price,
            qty=item.qty,
        )
        db.add(oi)

    # Clear cart
    if body.session_id:
        db.query(StoreCart).filter(StoreCart.session_id == body.session_id).delete()

    db.commit()
    db.refresh(order)

    items_out = (
        db.query(StoreOrderItems).filter(StoreOrderItems.order_id == order.id).all()
    )

    return OrderOut(
        id=order.id,
        session_id=order.session_id,
        customer_name=order.customer_name,
        customer_phone=order.customer_phone,
        customer_address=order.customer_address,
        payment_method=order.payment_method,
        total_amount=float(order.total_amount),
        status=order.status,
        notes=order.notes,
        created_at=order.created_at,
        updated_at=order.updated_at,
        items=[OrderItemOut.model_validate(i) for i in items_out],
    )


# ─── Public: Track order ───
@router.get("/api/store/orders/{id}")
def track_order(id: int, db: Session = Depends(get_db)):
    order = db.query(StoreOrders).filter(StoreOrders.id == id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    items = (
        db.query(StoreOrderItems)
        .filter(StoreOrderItems.order_id == id)
        .all()
    )

    return OrderOut(
        id=order.id,
        session_id=order.session_id,
        customer_name=order.customer_name,
        customer_phone=order.customer_phone,
        customer_address=order.customer_address,
        payment_method=order.payment_method,
        total_amount=float(order.total_amount),
        status=order.status,
        notes=order.notes,
        created_at=order.created_at,
        updated_at=order.updated_at,
        items=[OrderItemOut.model_validate(i) for i in items],
    )


# ─── Public: Create booking ───
@router.post("/api/store/bookings", status_code=201)
def create_booking(body: BookingCreate, db: Session = Depends(get_db)):
    booking = ServiceBookings(**body.model_dump())
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return BookingOut.model_validate(booking)


# ─── Admin: List orders ───
@router.get("/api/admin/orders", response_model=list[OrderOut])
def admin_list_orders(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):
    orders = (
        db.query(StoreOrders).order_by(StoreOrders.created_at.desc()).all()
    )
    result = []
    for o in orders:
        items = (
            db.query(StoreOrderItems)
            .filter(StoreOrderItems.order_id == o.id)
            .all()
        )
        result.append(
            OrderOut(
                id=o.id,
                session_id=o.session_id,
                customer_name=o.customer_name,
                customer_phone=o.customer_phone,
                customer_address=o.customer_address,
                payment_method=o.payment_method,
                total_amount=float(o.total_amount),
                status=o.status,
                notes=o.notes,
                created_at=o.created_at,
                updated_at=o.updated_at,
                items=[OrderItemOut.model_validate(i) for i in items],
            )
        )
    return result


# ─── Admin: Update order status ───
@router.put("/api/admin/orders/{id}", response_model=OrderOut)
def admin_update_order(
    id: int,
    body: OrderStatusUpdate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):
    order = db.query(StoreOrders).filter(StoreOrders.id == id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = body.status
    db.commit()
    db.refresh(order)

    items = (
        db.query(StoreOrderItems)
        .filter(StoreOrderItems.order_id == order.id)
        .all()
    )

    return OrderOut(
        id=order.id,
        session_id=order.session_id,
        customer_name=order.customer_name,
        customer_phone=order.customer_phone,
        customer_address=order.customer_address,
        payment_method=order.payment_method,
        total_amount=float(order.total_amount),
        status=order.status,
        notes=order.notes,
        created_at=order.created_at,
        updated_at=order.updated_at,
        items=[OrderItemOut.model_validate(i) for i in items],
    )


# ─── Admin: List bookings ───
@router.get("/api/admin/bookings", response_model=list[BookingOut])
def admin_list_bookings(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):
    bookings = (
        db.query(ServiceBookings)
        .order_by(ServiceBookings.created_at.desc())
        .all()
    )
    return [BookingOut.model_validate(b) for b in bookings]


# ─── Admin: Update booking ───
@router.put("/api/admin/bookings/{id}", response_model=BookingOut)
def admin_update_booking(
    id: int,
    body: BookingUpdate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):
    booking = db.query(ServiceBookings).filter(ServiceBookings.id == id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    update_data = body.model_dump(exclude_unset=True, exclude_none=True)
    for key, value in update_data.items():
        setattr(booking, key, value)

    db.commit()
    db.refresh(booking)
    return BookingOut.model_validate(booking)
