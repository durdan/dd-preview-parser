import apiClient from './apiClient.js';

export class DiagramService {
  async getUserDiagrams() {
    return apiClient.get('/diagrams');
  }

  async getDiagram(id) {
    if (!id) throw new Error('Diagram ID is required');
    return apiClient.get(`/diagrams/${id}`);
  }

  async createDiagram(diagramData) {
    if (!diagramData.name) throw new Error('Diagram name is required');
    return apiClient.post('/diagrams', diagramData);
  }

  async updateDiagram(id, diagramData) {
    if (!id) throw new Error('Diagram ID is required');
    return apiClient.put(`/diagrams/${id}`, diagramData);
  }

  async deleteDiagram(id) {
    if (!id) throw new Error('Diagram ID is required');
    return apiClient.delete(`/diagrams/${id}`);
  }
}

export default new DiagramService();