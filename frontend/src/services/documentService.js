const API_BASE_URL = 'http://localhost:8000';

export const documentService = {
  getDocuments: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/documents/`);
      if (!response.ok) {
        throw new Error(`Failed to fetch documents: ${response.statusText}`);
      }
      const data = await response.json();
      return data.documents || [];
    } catch (err) {
      console.error('Error fetching documents:', err);
      throw err;
    }
  },

  uploadDocument: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/api/documents/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Upload failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.error('Error uploading document:', err);
      throw err;
    }
  },

  deleteDocument: async (documentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Failed to delete document: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.error('Error deleting document:', err);
      throw err;
    }
  },

  getDocumentChunks: async (documentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/documents/${documentId}/chunks`);
      if (!response.ok) {
        throw new Error(`Failed to fetch chunks: ${response.statusText}`);
      }
      const data = await response.json();
      return data.chunks || [];
    } catch (err) {
      console.error('Error fetching chunks:', err);
      throw err;
    }
  }
};
