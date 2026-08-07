import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.ai import router as ai_router
from routes.telemetry import router as telemetry_router
from config.settings import settings

app = FastAPI(
    title=settings.app_name,
    description="Intelligent Decision Support Assistant for Central Ground Water Board",
    version="1.0.0"
)

# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Supports direct dev server local mapping
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(ai_router)
app.include_router(telemetry_router)


@app.get("/")
async def root():
    return {
        "status": "online",
        "service": settings.app_name,
        "gemini_api_configured": bool(settings.gemini_api_key and "YOUR_GEMINI_API_KEY" not in settings.gemini_api_key)
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
