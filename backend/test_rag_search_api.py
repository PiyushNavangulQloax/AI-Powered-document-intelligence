import json
import urllib.request
import urllib.parse

BASE_URL = "http://127.0.0.1:8000"


def make_request(path, method="GET", data=None, token=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            resp_body = resp.read().decode("utf-8")
            return resp.status, json.loads(resp_body) if resp_body else {}
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(err_body)
        except Exception:
            return e.code, {"error": err_body}


def test_rag_search():
    print("=== STARTING DOCMIND SEMANTIC SEARCH & RAG API VERIFICATION ===")

    # 1. Login as Admin
    print("\n--- 1. Login ---")
    status, res = make_request("/api/auth/login", method="POST", data={
        "email": "samarth@qloax.com",
        "password": "password123"
    })
    print(f"Login Status: {status}")
    assert status == 200, f"Login failed: {res}"
    token = res["access_token"]

    # 2. Semantic Search: Financial Revenue
    print("\n--- 2. POST /api/search (Query: 'revenue growth and cloud expansion') ---")
    status, search_res = make_request("/api/search", method="POST", data={
        "query": "revenue growth and cloud expansion",
        "threshold": 0.4,
        "limit": 5
    }, token=token)
    print(f"Search Status: {status}, Matches Found: {search_res.get('total_results')}")
    assert status == 200, f"Search failed: {search_res}"
    assert search_res["total_results"] > 0, "Expected at least 1 search result"
    top_result = search_res["results"][0]
    print(f"Top Match: {top_result['document_name']} (Score: {top_result['score_percentage']}, Page: {top_result['page']})")
    print(f"Snippet: {top_result['snippet'][:100]}...")

    # 3. Semantic Search: Strict Threshold
    print("\n--- 3. POST /api/search (Strict Threshold 0.95) ---")
    status, strict_res = make_request("/api/search", method="POST", data={
        "query": "totally random unindexed query xyz123",
        "threshold": 0.95
    }, token=token)
    print(f"Strict Threshold Status: {status}, Matches Found: {strict_res.get('total_results')}")
    assert status == 200

    # 4. RAG Chat: Summarize Q3 Financial Metrics
    print("\n--- 4. POST /api/chat (Financial Q&A with Citations) ---")
    status, chat_res = make_request("/api/chat", method="POST", data={
        "message": "Summarize key financial highlights and revenue breakdown from Q3_Financial_Analysis.pdf"
    }, token=token)
    print(f"Chat Status: {status}, Grounded: {chat_res.get('grounded')}")
    print(f"AI Answer: {chat_res.get('answer')[:120]}...")
    print(f"Citations Count: {len(chat_res.get('citations', []))}")
    assert status == 200
    assert len(chat_res.get("citations", [])) > 0
    assert "48.2" in chat_res.get("answer") or "revenue" in chat_res.get("answer").lower()

    # 5. RAG Chat: Legal Liability Extraction
    print("\n--- 5. POST /api/chat (Legal Risk & Liability Extraction) ---")
    status, legal_res = make_request("/api/chat", method="POST", data={
        "message": "What is the liability cap and breach notification SLA in Vendor_Contract_v4.docx?"
    }, token=token)
    print(f"Chat Status: {status}")
    print(f"AI Answer: {legal_res.get('answer')[:120]}...")
    assert status == 200
    assert len(legal_res.get("citations", [])) > 0

    # 6. RAG Chat: Insufficient Evidence Handling
    print("\n--- 6. POST /api/chat (Anti-Hallucination Guardrail for Out-of-Domain Question) ---")
    status, hall_res = make_request("/api/chat", method="POST", data={
        "message": "What is the secret recipe for quantum gravitational dark matter propulsion?"
    }, token=token)
    print(f"Chat Status: {status}, Has Insufficient Evidence: {hall_res.get('has_insufficient_evidence')}")
    print(f"Guardrail Answer: {hall_res.get('answer')[:100]}...")
    assert status == 200
    assert hall_res.get("has_insufficient_evidence") is True

    # 7. SSE Stream Check
    print("\n--- 7. GET /api/chat/stream (Server-Sent Events) ---")
    stream_url = f"{BASE_URL}/api/chat/stream?message={urllib.parse.quote('Summarize parental leave policy')}&token={urllib.parse.quote(token)}"
    req = urllib.request.Request(stream_url)
    with urllib.request.urlopen(req) as resp:
        stream_data = resp.read().decode("utf-8")
        print(f"Stream status: {resp.status}")
        assert resp.status == 200
        assert "data:" in stream_data
        print(f"Received {len(stream_data)} bytes of SSE stream tokens.")

    print("\n=======================================================")
    print("[SUCCESS] ALL SEMANTIC SEARCH & RAG CHAT TESTS PASSED!")
    print("=======================================================")


if __name__ == "__main__":
    test_rag_search()
