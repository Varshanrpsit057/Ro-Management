from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Date,
    Numeric,
    Boolean,
    ForeignKey,
    DateTime,
    CheckConstraint,
    Index,
    text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB, ARRAY
from ..database import Base


class Users(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    full_name = Column(String(100))
    created_at = Column(
        DateTime(timezone=True), server_default=text("NOW()")
    )

    sessions = relationship("Sessions", back_populates="user", cascade="all, delete-orphan")


class Sessions(Base):
    __tablename__ = "sessions"

    token = Column(String(64), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(
        DateTime(timezone=True), server_default=text("NOW()")
    )

    user = relationship("Users", back_populates="sessions")


class Customers(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(15), unique=True, nullable=False)
    address = Column(Text)
    created_at = Column(
        DateTime(timezone=True), server_default=text("NOW()")
    )
    updated_at = Column(
        DateTime(timezone=True), server_default=text("NOW()"), onupdate=text("NOW()")
    )

    ro_systems = relationship("ROSystems", back_populates="customer", cascade="all, delete-orphan")


class ROSystems(Base):
    __tablename__ = "ro_systems"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(
        Integer, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False
    )
    model_name = Column(String(100))
    install_date = Column(Date)
    status = Column(String(20), default="active")
    notes = Column(Text)
    created_at = Column(
        DateTime(timezone=True), server_default=text("NOW()")
    )
    updated_at = Column(
        DateTime(timezone=True), server_default=text("NOW()"), onupdate=text("NOW()")
    )

    __table_args__ = (
        CheckConstraint(
            "status IN ('active', 'inactive', 'removed')",
            name="ro_systems_status_check",
        ),
    )

    customer = relationship("Customers", back_populates="ro_systems")
    filter_replacements = relationship(
        "FilterReplacements", back_populates="ro_system", cascade="all, delete-orphan"
    )
    service_history = relationship(
        "ServiceHistory", back_populates="ro_system", cascade="all, delete-orphan"
    )


class Products(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    description = Column(Text)
    price = Column(Numeric(10, 2), nullable=False)
    stock_qty = Column(Integer, default=0)
    image_url = Column(String(300))
    created_at = Column(
        DateTime(timezone=True), server_default=text("NOW()")
    )
    updated_at = Column(
        DateTime(timezone=True), server_default=text("NOW()"), onupdate=text("NOW()")
    )


class FilterReplacements(Base):
    __tablename__ = "filter_replacements"

    id = Column(Integer, primary_key=True, index=True)
    ro_system_id = Column(
        Integer, ForeignKey("ro_systems.id", ondelete="CASCADE"), nullable=False
    )
    filter_type = Column(String(50), nullable=False)
    replaced_date = Column(Date, nullable=False)
    next_due_date = Column(Date, nullable=False)
    cost = Column(Numeric(10, 2))
    notes = Column(Text)
    created_at = Column(
        DateTime(timezone=True), server_default=text("NOW()")
    )

    __table_args__ = (
        CheckConstraint(
            "filter_type IN ('sediment','carbon','RO_membrane','post_carbon','UF','UV','other')",
            name="filter_replacements_type_check",
        ),
    )

    ro_system = relationship("ROSystems", back_populates="filter_replacements")


class ServiceHistory(Base):
    __tablename__ = "service_history"

    id = Column(Integer, primary_key=True, index=True)
    ro_system_id = Column(
        Integer, ForeignKey("ro_systems.id", ondelete="CASCADE"), nullable=False
    )
    service_date = Column(Date, nullable=False)
    description = Column(Text, nullable=False)
    cost = Column(Numeric(10, 2))
    created_at = Column(
        DateTime(timezone=True), server_default=text("NOW()")
    )

    ro_system = relationship("ROSystems", back_populates="service_history")


class StoreProducts(Base):
    __tablename__ = "store_products"

    id = Column(Integer, primary_key=True, index=True)
    store_type = Column(String(10), nullable=False)
    name = Column(String(200), nullable=False)
    category = Column(String(100), nullable=False)
    brand = Column(String(100))
    model = Column(String(100))
    description = Column(Text)
    features = Column(Text)
    specs = Column(JSONB)
    price = Column(Numeric(10, 2), nullable=False)
    stock_qty = Column(Integer, default=0)
    images = Column(ARRAY(Text))
    warranty = Column(String(100))
    is_featured = Column(Boolean, default=False)
    created_at = Column(
        DateTime(timezone=True), server_default=text("NOW()")
    )

    __table_args__ = (
        CheckConstraint(
            "store_type IN ('ro', 'ups')", name="store_products_type_check"
        ),
        Index("idx_store_products_type", "store_type"),
        Index("idx_store_products_category", "category"),
    )

    cart_items = relationship("StoreCart", back_populates="product", cascade="all, delete-orphan")
    reviews = relationship("StoreReviews", back_populates="product", cascade="all, delete-orphan")


class StoreCart(Base):
    __tablename__ = "store_cart"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(64), nullable=False)
    product_id = Column(
        Integer, ForeignKey("store_products.id", ondelete="CASCADE"), nullable=False
    )
    qty = Column(Integer, default=1)
    created_at = Column(
        DateTime(timezone=True), server_default=text("NOW()")
    )

    __table_args__ = (Index("idx_store_cart_session", "session_id"),)

    product = relationship("StoreProducts", back_populates="cart_items")


class StoreReviews(Base):
    __tablename__ = "store_reviews"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(
        Integer, ForeignKey("store_products.id", ondelete="CASCADE"), nullable=False
    )
    author = Column(String(100), default="Anonymous")
    rating = Column(Integer, nullable=False)
    comment = Column(Text)
    created_at = Column(
        DateTime(timezone=True), server_default=text("NOW()")
    )

    __table_args__ = (
        CheckConstraint("rating BETWEEN 1 AND 5", name="store_reviews_rating_check"),
        Index("idx_store_reviews_product", "product_id"),
    )

    product = relationship("StoreProducts", back_populates="reviews")


class StoreOrders(Base):
    __tablename__ = "store_orders"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(64), nullable=False)
    customer_name = Column(String(100), nullable=False)
    customer_phone = Column(String(15), nullable=False)
    customer_address = Column(Text, nullable=False)
    payment_method = Column(String(20), default="cod")
    total_amount = Column(Numeric(10, 2), nullable=False)
    status = Column(String(20), default="pending")
    notes = Column(Text)
    created_at = Column(
        DateTime(timezone=True), server_default=text("NOW()")
    )
    updated_at = Column(
        DateTime(timezone=True), server_default=text("NOW()"), onupdate=text("NOW()")
    )

    __table_args__ = (
        CheckConstraint(
            "payment_method IN ('cod','pay_at_shop','phone_order')",
            name="store_orders_payment_check",
        ),
        CheckConstraint(
            "status IN ('pending','accepted','rejected','shipped','delivered')",
            name="store_orders_status_check",
        ),
    )

    items = relationship("StoreOrderItems", back_populates="order", cascade="all, delete-orphan")


class StoreOrderItems(Base):
    __tablename__ = "store_order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(
        Integer, ForeignKey("store_orders.id", ondelete="CASCADE"), nullable=False
    )
    product_id = Column(
        Integer, ForeignKey("store_products.id", ondelete="SET NULL")
    )
    product_name = Column(String(200), nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    qty = Column(Integer, nullable=False, default=1)

    order = relationship("StoreOrders", back_populates="items")


class ServiceBookings(Base):
    __tablename__ = "service_bookings"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String(100), nullable=False)
    customer_phone = Column(String(15), nullable=False)
    customer_address = Column(Text, nullable=False)
    service_type = Column(String(50), nullable=False)
    preferred_date = Column(Date)
    description = Column(Text)
    status = Column(String(20), default="pending")
    technician = Column(String(100))
    admin_notes = Column(Text)
    created_at = Column(
        DateTime(timezone=True), server_default=text("NOW()")
    )
    updated_at = Column(
        DateTime(timezone=True), server_default=text("NOW()"), onupdate=text("NOW()")
    )

    __table_args__ = (
        CheckConstraint(
            "service_type IN ('installation','repair','filter_replacement','amc','other')",
            name="service_bookings_type_check",
        ),
        CheckConstraint(
            "status IN ('pending','approved','assigned','completed','cancelled')",
            name="service_bookings_status_check",
        ),
    )
