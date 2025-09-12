class DiagramManager {
    constructor(baseUrl = '/api', userId = 'anonymous') {
        this.baseUrl = baseUrl;
        this.userId = userId;
    }

    async _request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'X-User-ID': this.userId,
                ...options.headers
            },
            ...options
        };

        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Request failed');
        }

        return data;
    }

    async saveDiagram(name, description = '', diagramData = {}) {
        return this._request('/diagrams', {
            method: 'POST',
            body: JSON.stringify({
                name,
                description,
                diagram_data: diagramData
            })
        });
    }

    async loadDiagram(diagramId) {
        return this._request(`/diagrams/${diagramId}`);
    }

    async getUserDiagrams() {
        return this._request('/diagrams');
    }

    async updateDiagram(diagramId, updates) {
        return this._request(`/diagrams/${diagramId}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    }

    async deleteDiagram(diagramId) {
        return this._request(`/diagrams/${diagramId}`, {
            method: 'DELETE'
        });
    }
}