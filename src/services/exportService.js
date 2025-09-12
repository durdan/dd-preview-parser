import apiClient from './apiClient.js';

export class ExportService {
  async getExportHistory(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return apiClient.get(`/exports${params ? `?${params}` : ''}`);
  }

  async exportDiagram(diagramId, format) {
    if (!diagramId || !format) {
      throw new Error('Diagram ID and format are required');
    }
    return apiClient.post('/exports', { diagramId, format });
  }
}

export default new ExportService();