// frontend/src/services/api.js
const API_BASE = 'http://127.0.0.1:8000';

/**
 * Helper for making API requests with JSON parsing and error handling
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  let data;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage = (data && data.detail) || (typeof data === 'string' && data) || response.statusText || 'An error occurred';
    const error = new Error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Authentication
  register: async (name, email, password) => {
    return request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
  },

  login: async (email, password) => {
    return request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  getMe: async (token) => {
    return request('/api/auth/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  // Documents
  getDocuments: async (token) => {
    return request('/api/documents', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  getDocument: async (documentId, token) => {
    return request(`/api/documents/${documentId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  deleteDocument: async (documentId, token) => {
    return request(`/api/documents/${documentId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  uploadDocument: async (file, token) => {
    const formData = new FormData();
    formData.append('file', file);
    const url = `${API_BASE}/api/documents/upload`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMessage = (data && data.detail) || (typeof data === 'string' && data) || response.statusText || 'Upload failed';
      const error = new Error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
      error.status = response.status;
      error.data = data;
      throw error;
    }
    return data;
  },

  getDocumentStatus: async (documentId, token) => {
    return request(`/api/documents/${documentId}/status`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  // Semantic Search
  searchDocuments: async (query, threshold = 0.5, documentIds = null, token = null) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return request('/api/search', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query,
        threshold: threshold / 100.0,
        document_ids: documentIds
      })
    });
  },

  // RAG Chat & Q&A
  sendChatMessage: async (message, documentId = null, history = [], token = null) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return request('/api/chat', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message,
        document_id: documentId,
        history
      })
    });
  },

  streamChatMessage: (message, documentId = null, token = '', onToken, onDone, onError) => {
    const encodedMessage = encodeURIComponent(message);
    const docParam = documentId ? `&document_id=${encodeURIComponent(documentId)}` : '';
    const url = `${API_BASE}/api/chat/stream?message=${encodedMessage}${docParam}&token=${encodeURIComponent(token)}`;

    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'token') {
          if (onToken) onToken(payload.content);
        } else if (payload.type === 'done') {
          eventSource.close();
          if (onDone) onDone(payload);
        }
      } catch (err) {
        console.error('Error parsing SSE event:', err);
      }
    };

    eventSource.onerror = (err) => {
      eventSource.close();
      if (onError) onError(err);
    };

    return eventSource;
  }
};

export default api;
