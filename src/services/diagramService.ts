import { Diagram } from '../models/Diagram';
import { CreateDiagramInput, UpdateDiagramInput, IDiagram } from '../types';
import { Types } from 'mongoose';

export class DiagramService {
  static async createDiagram(diagramData: CreateDiagramInput): Promise<IDiagram> {
    if (!Types.ObjectId.isValid(diagramData.owner)) {
      throw new Error('Invalid owner ID');
    }
    
    const diagram = new Diagram(diagramData);
    return await diagram.save();
  }

  static async findDiagramById(id: string): Promise<IDiagram | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid diagram ID');
    }
    return await Diagram.findById(id).populate('owner', 'email');
  }

  static async findDiagramsByOwner(ownerId: string): Promise<IDiagram[]> {
    if (!Types.ObjectId.isValid(ownerId)) {
      throw new Error('Invalid owner ID');
    }
    return await Diagram.find({ owner: ownerId }).sort({ createdAt: -1 });
  }

  static async updateDiagram(id: string, updates: UpdateDiagramInput): Promise<IDiagram | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid diagram ID');
    }
    
    return await Diagram.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );
  }

  static async deleteDiagram(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid diagram ID');
    }
    const result = await Diagram.findByIdAndDelete(id);
    return !!result;
  }

  static async deleteDiagramsByOwner(ownerId: string): Promise<number> {
    if (!Types.ObjectId.isValid(ownerId)) {
      throw new Error('Invalid owner ID');
    }
    const result = await Diagram.deleteMany({ owner: ownerId });
    return result.deletedCount || 0;
  }
}