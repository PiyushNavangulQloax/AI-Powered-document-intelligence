// searchService.js
const API_BASE_URL = 'http://localhost:8000';

export const searchService = {
  searchDocuments: async (query) => {
    try {
      const user = JSON.parse(localStorage.getItem('qloxa_auth_user') || '{}');
      const authHeader = user.token ? { 'Authorization': `Bearer ${user.token}` } : {};

      const response = await fetch(`${API_BASE_URL}/api/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        },
        body: JSON.stringify({ query })
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data.results || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  }
};
