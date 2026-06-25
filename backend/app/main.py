from fastapi import FastAPI
from app.routes.upload import router as upload_router
from app.routes.validation import router as validation_router
from app.routes.categories import router as categories_router
from app.routes.query import router as query_router
from app.routes.questions import router as questions_router
from app.routes.execute_question import router as execute_question_router
from app.routes.profile import router as profile_router
from app.routes.dashboard import router as dashboard_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AI Data Analyzer API",
    version="1.0.0"
)

app.include_router(upload_router)
app.include_router(validation_router)
app.include_router(categories_router)
app.include_router(query_router)
app.include_router(questions_router)
app.include_router(execute_question_router)
app.include_router(profile_router)
app.include_router(dashboard_router)

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