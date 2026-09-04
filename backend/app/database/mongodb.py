import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv(override=True)

_client = None

def get_db():
    global _client
    uri = os.getenv("MONGODB_URI")
    db_name = os.getenv("MONGODB_DATABASE", "docmind")
    
    if not uri:
        raise ValueError("MONGODB_URI environment variable is not set")
        
    if _client is None:
        _client = MongoClient(uri, serverSelectionTimeoutMS=10000)
        
    return _client[db_name]
