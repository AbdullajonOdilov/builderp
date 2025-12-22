export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type Status = 'pending' | 'in_review' | 'accepted' | 'in_delivery' | 'delivered' | 'declined';
export type ResourceType = 'materials' | 'equipment' | 'services';
export type UserRole = 'manager' | 'supplier';
export type Availability = 'available' | 'limited' | 'not_available';

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
  availability?: Availability;
}

export const PRIORITY_CONFIG = {
  critical: { label: 'Critical', color: 'priority-critical', order: 1 },
  high: { label: 'High', color: 'priority-high', order: 2 },
  medium: { label: 'Medium', color: 'priority-medium', order: 3 },
  low: { label: 'Low', color: 'priority-low', order: 4 },
} as const;

export const STATUS_CONFIG = {
  pending: { label: 'New', color: 'status-pending' },
  in_review: { label: 'In Review', color: 'status-review' },
  accepted: { label: 'Accepted', color: 'status-accepted' },
  in_delivery: { label: 'In Delivery', color: 'status-delivery' },
  delivered: { label: 'Completed', color: 'status-delivered' },
  declined: { label: 'Declined', color: 'status-declined' },
} as const;

export const AVAILABILITY_CONFIG = {
  available: { label: 'Available', color: 'bg-status-delivered/20 text-status-delivered border-status-delivered/30' },
  limited: { label: 'Limited', color: 'bg-status-medium/20 text-status-medium border-status-medium/30' },
  not_available: { label: 'Not Available', color: 'bg-status-critical/20 text-status-critical border-status-critical/30' },
} as const;

export const KANBAN_COLUMNS = [
  { id: 'pending', label: 'New Requests', color: 'hsl(var(--status-pending))' },
  { id: 'in_review', label: 'In Review', color: 'hsl(var(--status-review))' },
  { id: 'accepted', label: 'Accepted', color: 'hsl(var(--status-accepted))' },
  { id: 'in_delivery', label: 'In Delivery', color: 'hsl(var(--status-delivery))' },
  { id: 'delivered', label: 'Completed', color: 'hsl(var(--status-delivered))' },
] as const;

export const RESOURCE_TYPES = {
  materials: { label: 'Materials', icon: 'Package' },
  equipment: { label: 'Equipment', icon: 'Wrench' },
  services: { label: 'Services', icon: 'Users' },
} as const;
