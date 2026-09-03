import json
import urllib.request
import urllib.error

BASE_URL = "http://127.0.0.1:8000"


def make_request(path, method="GET", data=None, token=None, content_type="application/json"):
    url = f"{BASE_URL}{path}"
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = None
    if data is not None:
        if content_type == "application/json":
            headers["Content-Type"] = "application/json"
            body = json.dumps(data).encode("utf-8")
        else:
            headers["Content-Type"] = content_type
            body = data

    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            return response.status, json.loads(res_body) if res_body else {}
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        try:
            parsed = json.loads(err_body)
        except Exception:
            parsed = err_body
        return e.code, parsed


def main():
    print("--- 1. Testing GET / ---")
    status, body = make_request("/")
    print(f"Status: {status}, Body: {body}")
    assert status == 200, f"Expected 200, got {status}"

    print("\n--- 2. Testing POST /api/auth/register ---")
    reg_data = {
        "name": "Live Tester",
        "email": "livetester@qloax.com",
        "password": "SecurePassword123!"
    }
    status, body = make_request("/api/auth/register", method="POST", data=reg_data)
    print(f"Status: {status}, Body: {body}")
    assert status in (201, 400), f"Unexpected status {status}"

    print("\n--- 3. Testing POST /api/auth/login ---")
    login_data = {
        "email": "livetester@qloax.com",
        "password": "SecurePassword123!"
    }
    status, body = make_request("/api/auth/login", method="POST", data=login_data)
    print(f"Status: {status}, Token received: {'access_token' in body}")
    assert status == 200, f"Login failed with status {status}"
    token = body["access_token"]

    print("\n--- 4. Testing GET /api/auth/me ---")
    status, body = make_request("/api/auth/me", token=token)
    print(f"Status: {status}, User: {body.get('name')} ({body.get('email')}), Role: {body.get('role')}")
    assert status == 200

    print("\n--- 5. Testing GET /api/documents ---")
    status, docs = make_request("/api/documents", token=token)
    print(f"Status: {status}, Document count: {len(docs)}")
    assert status == 200
    for doc in docs:
        print(f"  - [{doc.get('file_type')}] {doc.get('filename')} (id: {doc.get('id')})")

    print("\n--- 6. Testing Multipart Upload /api/documents/upload ---")
    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    filename = "Sample_Audit_Report.pdf"
    file_bytes = b"%PDF-1.4 Mock document content for DocMind platform testing."

    parts = [
        f"--{boundary}".encode("utf-8"),
        f'Content-Disposition: form-data; name="file"; filename="{filename}"'.encode("utf-8"),
        b"Content-Type: application/pdf",
        b"",
        file_bytes,
        f"--{boundary}--".encode("utf-8"),
        b""
    ]
    payload = b"\r\n".join(parts)
    content_type = f"multipart/form-data; boundary={boundary}"

    status, upload_res = make_request(
        "/api/documents/upload",
        method="POST",
        data=payload,
        token=token,
        content_type=content_type
    )
    print(f"Status: {status}, Upload result: {upload_res}")
    assert status == 201, f"Upload failed: {upload_res}"
    new_doc_id = upload_res.get("id") or upload_res.get("document_id")

    print(f"\n--- 7. Testing GET /api/documents/{new_doc_id}/status ---")
    status, status_res = make_request(f"/api/documents/{new_doc_id}/status", token=token)
    print(f"Status: {status}, Processing status: {status_res}")
    assert status == 200

    print(f"\n--- 8. Testing DELETE /api/documents/{new_doc_id} ---")
    status, delete_res = make_request(f"/api/documents/{new_doc_id}", method="DELETE", token=token)
    print(f"Status: {status}, Delete result: {delete_res}")
    assert status == 200

    print("\n=======================================================")
    print("[SUCCESS] ALL 8 BACKEND HTTP INTEGRATION TESTS PASSED!")
    print("=======================================================")


if __name__ == "__main__":
    main()
