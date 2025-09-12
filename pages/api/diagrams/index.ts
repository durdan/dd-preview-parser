import { NextApiRequest, NextApiResponse } from 'next';
import { DiagramData } from '../../../types/diagram';

// Mock database - replace with your actual database
const diagrams: DiagramData[] = [];
let nextId = 1;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return handleGet(req, res);
    case 'POST':
      return handlePost(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
}

function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    res.status(200).json(diagrams);
  } catch (error) {
    console.error('Error fetching diagrams:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { name, data } = req.body;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ message: 'Name is required and must be a string' });
    }

    if (!data) {
      return res.status(400).json({ message: 'Data is required' });
    }

    const now = new Date();
    const newDiagram: DiagramData = {
      id: String(nextId++),
      name,
      data,
      createdAt: now,
      updatedAt: now,
    };

    diagrams.push(newDiagram);
    res.status(201).json(newDiagram);
  } catch (error) {
    console.error('Error creating diagram:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}