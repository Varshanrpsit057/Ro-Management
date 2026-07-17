from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .database import init_db
from .routers import (
    auth_router,
    customers_router,
    products_router,
    ro_systems_router,
    filter_replacements_router,
    service_history_router,
    dashboard_router,
    notifications_router,
    store_router,
    orders_router,
)

app = FastAPI(title="RO Service Management API", version="2.0.0")

# CORS — allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(customers_router)
app.include_router(products_router)
app.include_router(ro_systems_router)
app.include_router(filter_replacements_router)
app.include_router(service_history_router)
app.include_router(dashboard_router)
app.include_router(notifications_router)
app.include_router(store_router)
app.include_router(orders_router)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/api/health")
def health_check():
    return {"status": "ok"}


@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(status_code=404, content={"error": "Route not found"})


@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    return JSONResponse(status_code=500, content={"error": "Internal server error"})


if __name__ == "__main__":
    import uvicorn
    import os

    port = int(os.getenv("PORT", "8057"))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
