import { DiagramService } from '../../../lib/diagram-service.js';
import { extractUserFromRequest } from '../../../lib/auth.js';

const diagramService = new DiagramService();

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      return await handleList(req, res);
    } else if (req.method === 'POST') {
      return await handleCreate(req, res);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleList(req, res) {
  const user = extractUserFromRequest(req);
  const includePublic = req.query.public !== 'false';
  
  const diagrams = await diagramService.listDiagrams(user?.id, includePublic);
  return res.status(200).json({ diagrams });
}

async function handleCreate(req, res) {
  const user = extractUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const diagram = await diagramService.createDiagram(req.body, user.id);
    return res.status(201).json({ diagram });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}