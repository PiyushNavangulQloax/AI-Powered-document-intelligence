const API_BASE_URL = 'http://localhost:8000';

const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem('qloxa_auth_user') || '{}');
  return user.token ? { 'Authorization': `Bearer ${user.token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
};

export const dashboardService = {
  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/stats`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch dashboard stats');
    return await response.json();
  }
};
