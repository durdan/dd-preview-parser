import { Schema, model } from 'mongoose';
import { IDiagram } from '../types';

const diagramSchema = new Schema<IDiagram>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    maxlength: [50000, 'Content cannot exceed 50000 characters']
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner is required']
  }
}, {
  timestamps: true
});

// Index for faster owner-based queries
diagramSchema.index({ owner: 1 });
diagramSchema.index({ owner: 1, createdAt: -1 });

export const Diagram = model<IDiagram>('Diagram', diagramSchema);