export interface BuildingDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
}

export interface BuildingSection {
  id: string;
  buildingId: string;
  name: string;
  startDate?: Date;
  expectedEndDate?: Date;
  sectionPrice?: number;
  documents: BuildingDocument[];
  createdAt: Date;
}

export interface Building {
  id: string;
  objectName: string;
  contractNumber?: string;
  startDate: Date;
  expectedEndDate: Date;
  totalPrice: number;
  usedMoney: number;
  documents: BuildingDocument[];
  sections: BuildingSection[];
  createdAt: Date;
}
