export interface DiagramData {
  id: string;
  name: string;
  data: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface ValidationError {
  field: string;
  message: string;
}