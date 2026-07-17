from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import date, datetime
from decimal import Decimal


# ─── Auth ───
class UserRegister(BaseModel):
    username: str
    password: str = Field(min_length=4)
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    full_name: Optional[str] = None

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    token: str
    user: UserOut


# ─── Customers ───
class CustomerBase(BaseModel):
    name: str
    phone: str
    address: Optional[str] = None


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(CustomerBase):
    pass


class CustomerOut(CustomerBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── RO Systems ───
class ROSystemBase(BaseModel):
    model_name: str
    install_date: Optional[date] = None
    status: Optional[str] = "active"
    notes: Optional[str] = None


class ROSystemCreate(ROSystemBase):
    pass


class ROSystemUpdate(ROSystemBase):
    pass


class ROSystemOut(ROSystemBase):
    id: int
    customer_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Products (admin inventory) ───
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    stock_qty: Optional[int] = 0
    image_url: Optional[str] = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(ProductBase):
    pass


class ProductOut(ProductBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Filter Replacements ───
class FilterReplacementBase(BaseModel):
    filter_type: str
    replaced_date: date
    next_due_date: Optional[date] = None
    cost: Optional[float] = None
    notes: Optional[str] = None


class FilterReplacementCreate(FilterReplacementBase):
    pass


class FilterReplacementOut(FilterReplacementBase):
    id: int
    ro_system_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Service History ───
class ServiceHistoryBase(BaseModel):
    service_date: date
    description: str
    cost: Optional[float] = None


class ServiceHistoryCreate(ServiceHistoryBase):
    pass


class ServiceHistoryOut(ServiceHistoryBase):
    id: int
    ro_system_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Store Products ───
class StoreProductOut(BaseModel):
    id: int
    store_type: str
    name: str
    category: str
    brand: Optional[str] = None
    model: Optional[str] = None
    description: Optional[str] = None
    features: Optional[str] = None
    specs: Optional[Any] = None
    price: float
    stock_qty: Optional[int] = 0
    images: Optional[List[str]] = None
    warranty: Optional[str] = None
    is_featured: Optional[bool] = False
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class StoreProductDetail(StoreProductOut):
    reviews: List["StoreReviewOut"] = []


# ─── Store Reviews ───
class StoreReviewBase(BaseModel):
    product_id: int
    author: Optional[str] = "Anonymous"
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None


class StoreReviewCreate(StoreReviewBase):
    pass


class StoreReviewOut(StoreReviewBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Store Cart ───
class CartItemBase(BaseModel):
    session_id: str
    product_id: int
    qty: Optional[int] = 1


class CartItemCreate(CartItemBase):
    pass


class CartItemUpdate(BaseModel):
    qty: int


class CartItemOut(BaseModel):
    id: int
    session_id: str
    product_id: int
    qty: int
    # joined fields from store_products
    name: Optional[str] = None
    brand: Optional[str] = None
    category: Optional[str] = None
    store_type: Optional[str] = None
    price: Optional[float] = None
    images: Optional[List[str]] = None
    specs: Optional[Any] = None
    description: Optional[str] = None
    features: Optional[str] = None
    warranty: Optional[str] = None
    is_featured: Optional[bool] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Orders ───
class OrderItemIn(BaseModel):
    product_id: int
    product_name: str
    price: float
    qty: int


class OrderCreate(BaseModel):
    session_id: Optional[str] = ""
    customer_name: str
    customer_phone: str
    customer_address: str
    payment_method: Optional[str] = "cod"
    items: List[OrderItemIn]
    notes: Optional[str] = None


class OrderItemOut(BaseModel):
    id: int
    order_id: int
    product_id: Optional[int] = None
    product_name: str
    price: float
    qty: int

    class Config:
        from_attributes = True


class OrderOut(BaseModel):
    id: int
    session_id: str
    customer_name: str
    customer_phone: str
    customer_address: str
    payment_method: str
    total_amount: float
    status: str
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    items: Optional[List[OrderItemOut]] = None

    class Config:
        from_attributes = True


class OrderStatusUpdate(BaseModel):
    status: str


# ─── Service Bookings ───
class BookingCreate(BaseModel):
    customer_name: str
    customer_phone: str
    customer_address: str
    service_type: str
    preferred_date: Optional[date] = None
    description: Optional[str] = None


class BookingUpdate(BaseModel):
    status: Optional[str] = None
    technician: Optional[str] = None
    admin_notes: Optional[str] = None


class BookingOut(BaseModel):
    id: int
    customer_name: str
    customer_phone: str
    customer_address: str
    service_type: str
    preferred_date: Optional[date] = None
    description: Optional[str] = None
    status: str
    technician: Optional[str] = None
    admin_notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Dashboard ───
class DashboardStats(BaseModel):
    totalCustomers: int
    totalROSystems: int
    availableProducts: int
    upcomingReplacements: int
    overdueReplacements: int


# ─── Notifications ───
class NotificationItem(BaseModel):
    id: int
    ro_system_id: int
    filter_type: str
    replaced_date: date
    next_due_date: date
    cost: Optional[float] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    model_name: Optional[str] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None

    class Config:
        from_attributes = True


class NotificationsOut(BaseModel):
    upcoming: List[NotificationItem]
    overdue: List[NotificationItem]


# ─── Generic ───
class MessageResponse(BaseModel):
    message: str


class ErrorResponse(BaseModel):
    error: str
