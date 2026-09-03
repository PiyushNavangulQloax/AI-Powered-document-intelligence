import io
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_full_pipeline():
    print("\n--- 1. Testing Root Endpoint ---")
    res = client.get("/")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    print("[PASS] Root endpoint works:", res.json())

    print("\n--- 2. Testing User Registration ---")
    reg_payload = {
        "name": "Integration Tester",
        "email": "tester@qloax.com",
        "password": "SecurePassword123!"
    }
    res = client.post("/api/auth/register", json=reg_payload)
    if res.status_code == 400 and "already registered" in res.text:
        print("User already registered, proceeding to login...")
    else:
        assert res.status_code == 201, f"Expected 201, got {res.status_code}: {res.text}"
        print("[PASS] Registered user:", res.json())

    print("\n--- 3. Testing User Login ---")
    login_payload = {
        "email": "tester@qloax.com",
        "password": "SecurePassword123!"
    }
    res = client.post("/api/auth/login", json=login_payload)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    token_data = res.json()
    assert "access_token" in token_data, "No access token returned!"
    token = token_data["access_token"]
    print("[PASS] Login successful! Received access token.")

    headers = {"Authorization": f"Bearer {token}"}

    print("\n--- 4. Testing Get Current User (/me) ---")
    res = client.get("/api/auth/me", headers=headers)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    user_me = res.json()
    print("[PASS] Current user profile retrieved:", user_me["name"], f"({user_me['email']})")

    print("\n--- 5. Testing List Documents ---")
    res = client.get("/api/documents", headers=headers)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    docs = res.json()
    print(f"[PASS] Listed {len(docs)} documents successfully.")

    print("\n--- 6. Testing Document Upload ---")
    file_content = b"This is a test document content for DocMind neural parsing and vector indexing."
    files = {"file": ("test_report.txt", io.BytesIO(file_content), "text/plain")}
    res = client.post("/api/documents/upload", headers=headers, files=files)
    assert res.status_code == 201, f"Expected 201, got {res.status_code}: {res.text}"
    uploaded_doc = res.json()
    doc_id = uploaded_doc["id"]
    print(f"[PASS] Document uploaded successfully: ID={doc_id}, filename={uploaded_doc['filename']}")

    print("\n--- 7. Testing Document Status ---")
    res = client.get(f"/api/documents/{doc_id}/status", headers=headers)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    status_data = res.json()
    print("[PASS] Document status retrieved:", status_data["status"], f"progress={status_data['progress']}%")

    print("\n--- 8. Testing Document Deletion ---")
    res = client.delete(f"/api/documents/{doc_id}", headers=headers)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    print("[PASS] Document deleted successfully:", res.json())

    print("\n==========================================")
    print("ALL INTEGRATION TESTS PASSED SUCCESSFULLY!")
    print("==========================================")


if __name__ == "__main__":
    test_full_pipeline()
