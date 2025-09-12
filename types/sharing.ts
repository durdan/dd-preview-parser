export interface SharingSettings {
  isPublic: boolean;
  shareToken?: string;
  sharedAt?: Date;
}

export interface SharedDiagram {
  id: string;
  title: string;
  content: any;
  createdAt: Date;
  updatedAt: Date;
  author: {
    name: string;
  };
}