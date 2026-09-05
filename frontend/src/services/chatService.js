const API_BASE_URL = 'http://localhost:8000';

export const chatService = {
  sendMessage: async (query, documentId = null) => {
    try {
      const payload = { query };
      if (documentId) {
        payload.document_id = documentId;
      }

      const user = JSON.parse(localStorage.getItem('qloxa_auth_user') || '{}');
      const authHeader = user.token ? { 'Authorization': `Bearer ${user.token}` } : {};

      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Chat request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.error('Error sending chat message:', err);
      throw err;
    }
  },

  getChatHistory: async () => {
    return [];
  }
};
