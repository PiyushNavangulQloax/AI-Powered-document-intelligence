import os
import certifi
from dotenv import load_dotenv
from pymongo import MongoClient

# Load environment variables
load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "DocMindDB")

# Check required environment variables
if not MONGODB_URI:
    raise ValueError("MONGODB_URI is missing from .env")

# Collections prepared for DocMind platform
COLLECTIONS = {
    "users": "users",
    "documents": "documents",
    "document_chunks": "document_chunks",
    "chat_sessions": "chat_sessions",
    "chat_messages": "chat_messages",
}

client = None
database = None


def get_client():
    global client, database
    if client is None:
        try:
            client = MongoClient(
                MONGODB_URI,
                tlsCAFile=certifi.where(),
                tlsAllowInvalidCertificates=True,
                serverSelectionTimeoutMS=4000,
                connectTimeoutMS=4000,
                socketTimeoutMS=4000
            )
            database = client[DATABASE_NAME]
        except Exception as e:
            print(f"Notice: MongoDB client initialization deferred: {e}")
            client = None
            database = None
    return client


def get_database():
    global database
    if database is None:
        get_client()
    if database is None:
        raise ConnectionError("MongoDB is currently unreachable")
    return database


def check_database_connection(raise_on_error: bool = False):
    try:
        c = get_client()
        if c is None:
            if raise_on_error:
                raise ConnectionError("MongoDB client could not be initialized")
            return False
        c.admin.command("ping")
        return True
    except Exception as e:
        if raise_on_error:
            raise
        print(f"Notice: MongoDB connection check failed: {e}")
        return False


def init_database_indexes():
    try:
        db = get_database()
        db["users"].create_index("email", unique=True)
        db["documents"].create_index("uploaded_by")
        db["document_chunks"].create_index("document_id")
        db["chat_messages"].create_index("session_id")
        print("Database indexes initialized successfully.")
    except Exception as e:
        print(f"Notice: Database index initialization skipped: {e}")