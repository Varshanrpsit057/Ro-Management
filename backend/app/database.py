from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import DATABASE_URL

# psycopg3 uses postgresql+psycopg:// scheme
DB_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://")

engine = create_engine(DB_URL, pool_pre_ping=True, pool_size=10)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables if they don't exist."""
    from .models import Customers  # noqa: F401
    from .models import Products  # noqa: F401
    from .models import ROSystems  # noqa: F401
    from .models import FilterReplacements  # noqa: F401
    from .models import ServiceHistory  # noqa: F401
    from .models import Users  # noqa: F401
    from .models import Sessions  # noqa: F401
    from .models import StoreProducts  # noqa: F401
    from .models import StoreCart  # noqa: F401
    from .models import StoreReviews  # noqa: F401
    from .models import StoreOrders  # noqa: F401
    from .models import StoreOrderItems  # noqa: F401
    from .models import ServiceBookings  # noqa: F401

    Base.metadata.create_all(bind=engine)
