const API_BASE_URL = 'http://localhost:8000';

const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem('qloxa_auth_user') || '{}');
  return user.token ? { 'Authorization': `Bearer ${user.token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
};

export const chatService = {
  createConversation: async (payload) => {
    const response = await fetch(`${API_BASE_URL}/api/conversations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to create conversation');
    return await response.json();
  },

  getConversations: async () => {
    const response = await fetch(`${API_BASE_URL}/api/conversations`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to get conversations');
    return await response.json();
  },

  getConversation: async (convId) => {
    const response = await fetch(`${API_BASE_URL}/api/conversations/${convId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to get conversation');
    return await response.json();
  },

  sendMessage: async (convId, query, documentId = null, signal = null) => {
    const payload = { query };
    if (documentId) {
      payload.document_id = documentId;
    }

    const response = await fetch(`${API_BASE_URL}/api/conversations/${convId}/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
      signal
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Chat request failed: ${response.statusText}`);
    }

    return await response.json();
  }
};
