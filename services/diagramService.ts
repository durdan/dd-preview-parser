import { DiagramData, ValidationError } from '../types/diagram';

class DiagramService {
  private async request<T>(
    url: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async getDiagram(id: string): Promise<DiagramData> {
    return this.request<DiagramData>(`/api/diagrams/${id}`);
  }

  async createDiagram(diagram: Omit<DiagramData, 'id' | 'createdAt' | 'updatedAt'>): Promise<DiagramData> {
    return this.request<DiagramData>('/api/diagrams', {
      method: 'POST',
      body: JSON.stringify(diagram),
    });
  }

  async updateDiagram(id: string, diagram: DiagramData): Promise<DiagramData> {
    return this.request<DiagramData>(`/api/diagrams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(diagram),
    });
  }

  async deleteDiagram(id: string): Promise<void> {
    await this.request(`/api/diagrams/${id}`, {
      method: 'DELETE',
    });
  }

  async validateDiagram(diagram: DiagramData): Promise<ValidationError[]> {
    const response = await this.request<{ errors: ValidationError[] }>('/api/diagrams/validate', {
      method: 'POST',
      body: JSON.stringify(diagram),
    });
    
    return response.errors;
  }
}

export const diagramService = new DiagramService();