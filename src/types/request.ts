export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type Status = 'pending' | 'accepted' | 'delivered' | 'declined';
export type ResourceType = 'materials' | 'equipment' | 'services';
export type UserRole = 'manager' | 'supplier';

export interface ResourceRequest {
  id: string;
  resourceType: ResourceType;
  resourceName: string;
  quantity: number;
  unit: string;
  neededDate: string;
  priority: Priority;
  status: Status;
  createdAt: string;
  managerName: string;
  notes?: string;
  deliveryNotes?: string;
}

export const PRIORITY_CONFIG = {
  critical: { label: 'Critical', color: 'priority-critical', order: 1 },
  high: { label: 'High', color: 'priority-high', order: 2 },
  medium: { label: 'Medium', color: 'priority-medium', order: 3 },
  low: { label: 'Low', color: 'priority-low', order: 4 },
} as const;

export const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'status-pending' },
  accepted: { label: 'Accepted', color: 'status-accepted' },
  delivered: { label: 'Delivered', color: 'status-delivered' },
  declined: { label: 'Declined', color: 'status-declined' },
} as const;

export const RESOURCE_TYPES = {
  materials: { label: 'Materials', icon: 'Package' },
  equipment: { label: 'Equipment', icon: 'Wrench' },
  services: { label: 'Services', icon: 'Users' },
} as const;
