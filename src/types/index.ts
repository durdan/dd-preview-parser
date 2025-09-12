import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDiagram extends Document {
  _id: Types.ObjectId;
  title: string;
  content: string;
  owner: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  email: string;
  password: string;
}

export interface CreateDiagramInput {
  title: string;
  content: string;
  owner: string;
}

export interface UpdateDiagramInput {
  title?: string;
  content?: string;
}