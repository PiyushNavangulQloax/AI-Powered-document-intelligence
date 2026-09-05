// searchService.js
const API_BASE_URL = 'http://localhost:8000';

export const searchService = {
  searchDocuments: async (query, documentId = null, topK = 10) => {
    try {
      const user = JSON.parse(localStorage.getItem('qloxa_auth_user') || '{}');
      const authHeader = user.token ? { 'Authorization': `Bearer ${user.token}` } : {};

      const payload = { query, top_k: topK };
      if (documentId) {
        payload.document_id = documentId;
      }

      const response = await fetch(`${API_BASE_URL}/api/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Search failed with status ${response.status}`);
      }

      const data = await response.json();
      return data.results || [];
    } catch (err) {
      console.error('searchDocuments error:', err);
      throw err;
    }
  }
};
