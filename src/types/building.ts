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

export const BUILDING_COLORS = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Green', value: '#22C55E' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Purple', value: '#A855F7' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Yellow', value: '#EAB308' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Cyan', value: '#06B6D4' },
] as const;

export interface Building {
  id: string;
  objectName: string;
  color: string;
  contractNumber?: string;
  startDate: Date;
  expectedEndDate: Date;
  totalPrice: number;
  usedMoney: number;
  pendingMoney: number;
  documents: BuildingDocument[];
  sections: BuildingSection[];
  createdAt: Date;
}
