from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Import the routers we created
from app.api import search, chat, documents, auth, conversations, dashboard

app = FastAPI(title="DocMind AI API")

# Configure CORS so the React frontend can communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all origins.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the routers with /api prefix and root for compatibility
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(search.router, prefix="/api/search", tags=["search"])
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(conversations.router, prefix="/api/conversations", tags=["conversations"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(search.router, tags=["Search"])
app.include_router(chat.router, tags=["Chat"])

@app.get("/")
async def root():
    return {"message": "Welcome to the DocMind AI API"}
