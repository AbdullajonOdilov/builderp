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

export interface SubResource {
  id: string;
  categoryName: TaskCategory;
  resourceCode: string;
  resourceName: string;
  resourceAmount: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Task {
  id: string;
  categoryName: TaskCategory;
  resourceCode: string;
  taskName: string;
  taskAmount: number;
  buildingId: string;
  subResources: SubResource[];
  createdAt: Date;
}
