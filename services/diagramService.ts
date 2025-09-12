interface DiagramData {
  id?: string;
  title: string;
  content: string;
}

interface SavedDiagram {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

class DiagramService {
  async saveDiagram(data: DiagramData): Promise<SavedDiagram> {
    const url = data.id ? `/api/diagrams/${data.id}` : '/api/diagrams';
    const method = data.id ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: data.title,
        content: data.content
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required');
      }
      if (response.status === 403) {
        throw new Error('Permission denied');
      }
      if (response.status === 400) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Invalid diagram data');
      }
      throw new Error('Failed to save diagram');
    }

    return response.json();
  }

  async getDiagram(id: string): Promise<SavedDiagram> {
    const response = await fetch(`/api/diagrams/${id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Diagram not found');
      }
      if (response.status === 401) {
        throw new Error('Authentication required');
      }
      throw new Error('Failed to load diagram');
    }

    return response.json();
  }

  async deleteDiagram(id: string): Promise<void> {
    const response = await fetch(`/api/diagrams/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Diagram not found');
      }
      if (response.status === 401) {
        throw new Error('Authentication required');
      }
      if (response.status === 403) {
        throw new Error('Permission denied');
      }
      throw new Error('Failed to delete diagram');
    }
  }
}

export const diagramService = new DiagramService();