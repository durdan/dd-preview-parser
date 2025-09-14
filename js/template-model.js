class Template {
    constructor(id, name, category, description, elements = [], metadata = {}) {
        this.id = id || this.generateId();
        this.name = this.validateName(name);
        this.category = this.validateCategory(category);
        this.description = description || '';
        this.elements = elements;
        this.metadata = {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...metadata
        };
    }

    validateName(name) {
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            throw new Error('Template name is required');
        }
        return name.trim();
    }

    validateCategory(category) {
        if (!category || typeof category !== 'string' || category.trim().length === 0) {
            throw new Error('Template category is required');
        }
        return category.trim();
    }

    generateId() {
        return 'template_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    addElement(element) {
        if (!element || typeof element !== 'object') {
            throw new Error('Invalid element');
        }
        this.elements.push(element);
        this.metadata.updatedAt = new Date().toISOString();
    }

    removeElement(elementId) {
        this.elements = this.elements.filter(el => el.id !== elementId);
        this.metadata.updatedAt = new Date().toISOString();
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            category: this.category,
            description: this.description,
            elements: this.elements,
            metadata: this.metadata
        };
    }

    static fromJSON(data) {
        return new Template(
            data.id,
            data.name,
            data.category,
            data.description,
            data.elements,
            data.metadata
        );
    }
}

class DiagramElement {
    constructor(type, x, y, width, height, properties = {}) {
        this.id = this.generateId();
        this.type = type;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.properties = properties;
    }

    generateId() {
        return 'element_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}