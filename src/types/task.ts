export const TASK_CATEGORIES = [
  'Demolition',
  'Concrete',
  'Masonry',
  'Steel Structure',
  'Carpentry',
  'Roofing',
  'Insulation',
  'Plumbing',
  'Electrical',
  'HVAC',
  'Painting',
  'Flooring',
  'Landscaping',
  'General',
] as const;

export type TaskCategory = (typeof TASK_CATEGORIES)[number];

export const UNIT_TYPES = [
  'pcs', 'kg', 'ton', 'm', 'm²', 'm³', 'L', 'set', 'lot', 'hr', 'day', 'month',
] as const;

export type UnitType = (typeof UNIT_TYPES)[number];

export const SUB_RESOURCE_CATEGORIES = [
  'Salary',
  'Material',
  'Instrument',
  'Techniques',
  'Other',
] as const;

export type SubResourceCategory = (typeof SUB_RESOURCE_CATEGORIES)[number];

export interface SubResource {
  id: string;
  categoryName: SubResourceCategory;
  resourceCode: string;
  resourceName: string;
  unit: UnitType;
  resourceAmount: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Task {
  id: string;
  categoryName: TaskCategory;
  resourceCode: string;
  taskName: string;
  unit: UnitType;
  taskAmount: number;
  buildingId: string;
  subResources: SubResource[];
  createdAt: Date;
}
