from fastapi import FastAPI
from app.routes.upload import router as upload_router
from app.routes.validation import router as validation_router 

app = FastAPI(
    title="AI Data Analyzer API",
    version="1.0.0"
)

app.include_router(upload_router)
app.include_router(validation_router)

@app.get("/")
def home():
    return {
        "message": "AI Data Analyzer Backend is running",
        "docs": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "message": "Backend is running"
    }