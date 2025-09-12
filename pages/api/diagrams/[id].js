import { DiagramService } from '../../../lib/diagram-service.js';
import { extractUserFromRequest } from '../../../lib/auth.js';

const diagramService = new DiagramService();

export default async function handler(req, res) {
  const { id } = req.query;
  
  try {
    if (req.method === 'GET') {
      return await handleGet(req, res, id);
    } else if (req.method === 'PUT') {
      return await handleUpdate(req, res, id);
    } else if (req.method === 'DELETE') {
      return await handleDelete(req, res, id);
    } else {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGet(req, res, id) {
  const user = extractUserFromRequest(req);
  
  try {
    const diagram = await diagramService.getDiagram(id, user?.id);
    return res.status(200).json({ diagram });
  } catch (error) {
    if (error.message === 'Diagram not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Access denied') {
      return res.status(403).json({ error: error.message });
    }
    throw error;
  }
}

async function handleUpdate(req, res, id) {
  const user = extractUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const diagram = await diagramService.updateDiagram(id, req.body, user.id);
    return res.status(200).json({ diagram });
  } catch (error) {
    if (error.message === 'Diagram not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Access denied') {
      return res.status(403).json({ error: error.message });
    }
    return res.status(400).json({ error: error.message });
  }
}

async function handleDelete(req, res, id) {
  const user = extractUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const result = await diagramService.deleteDiagram(id, user.id);
    return res.status(200).json(result);
  } catch (error) {
    if (error.message === 'Diagram not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Access denied') {
      return res.status(403).json({ error: error.message });
    }
    throw error;
  }
}