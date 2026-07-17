from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, text

from ..database import get_db
from ..models import FilterReplacements, ROSystems, Customers
from ..schemas import NotificationsOut, NotificationItem
from ..auth import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("/", response_model=NotificationsOut)
def get_notifications(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):
    # Upcoming — due within next 7 days
    upcoming_rows = (
        db.query(
            FilterReplacements,
            ROSystems.model_name,
            Customers.name.label("customer_name"),
            Customers.phone.label("customer_phone"),
        )
        .join(ROSystems, FilterReplacements.ro_system_id == ROSystems.id)
        .join(Customers, ROSystems.customer_id == Customers.id)
        .filter(
            FilterReplacements.next_due_date.between(
                func.current_date(),
                func.current_date() + text("INTERVAL '7 days'"),
            )
        )
        .order_by(FilterReplacements.next_due_date.asc())
        .all()
    )

    # Overdue
    overdue_rows = (
        db.query(
            FilterReplacements,
            ROSystems.model_name,
            Customers.name.label("customer_name"),
            Customers.phone.label("customer_phone"),
        )
        .join(ROSystems, FilterReplacements.ro_system_id == ROSystems.id)
        .join(Customers, ROSystems.customer_id == Customers.id)
        .filter(FilterReplacements.next_due_date < func.current_date())
        .order_by(FilterReplacements.next_due_date.asc())
        .all()
    )

    def make_items(rows):
        items = []
        for fr, model_name, customer_name, customer_phone in rows:
            items.append(
                NotificationItem(
                    id=fr.id,
                    ro_system_id=fr.ro_system_id,
                    filter_type=fr.filter_type,
                    replaced_date=fr.replaced_date,
                    next_due_date=fr.next_due_date,
                    cost=float(fr.cost) if fr.cost else None,
                    notes=fr.notes,
                    created_at=fr.created_at,
                    model_name=model_name,
                    customer_name=customer_name,
                    customer_phone=customer_phone,
                )
            )
        return items

    return NotificationsOut(
        upcoming=make_items(upcoming_rows),
        overdue=make_items(overdue_rows),
    )
