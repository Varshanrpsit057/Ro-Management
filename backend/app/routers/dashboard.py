from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, text

from ..database import get_db
from ..models import Customers, ROSystems, Products, FilterReplacements
from ..schemas import DashboardStats
from ..auth import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/", response_model=DashboardStats)
def get_dashboard(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):
    total_customers = db.query(func.count(Customers.id)).scalar() or 0
    total_ro_systems = (
        db.query(func.count(ROSystems.id))
        .filter(ROSystems.status == "active")
        .scalar()
        or 0
    )
    available_products = (
        db.query(func.count(Products.id))
        .filter(Products.stock_qty > 0)
        .scalar()
        or 0
    )
    upcoming = (
        db.query(func.count(FilterReplacements.id))
        .filter(
            FilterReplacements.next_due_date.between(
                func.current_date(),
                func.current_date() + text("INTERVAL '7 days'"),
            )
        )
        .scalar()
        or 0
    )
    overdue = (
        db.query(func.count(FilterReplacements.id))
        .filter(FilterReplacements.next_due_date < func.current_date())
        .scalar()
        or 0
    )

    return DashboardStats(
        totalCustomers=total_customers,
        totalROSystems=total_ro_systems,
        availableProducts=available_products,
        upcomingReplacements=upcoming,
        overdueReplacements=overdue,
    )
