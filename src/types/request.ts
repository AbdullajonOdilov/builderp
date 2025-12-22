export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type Status = 'pending' | 'selected' | 'ordered' | 'in_delivery' | 'delivered' | 'declined';
export type ResourceType = 'materials' | 'equipment' | 'services';
export type UserRole = 'manager' | 'supplier';
export type Availability = 'available' | 'limited' | 'not_available';
export type DeliveryStatus = 'pending' | 'partial' | 'complete';

export interface Vendor {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  deliveryDays: number;
  rating: number;
  priceLevel: 'low' | 'medium' | 'high';
  specialties: ResourceType[];
}

export const VENDORS: Vendor[] = [
  {
    id: 'v1',
    name: 'ABC Building Supplies',
    contact: 'James Wilson',
    email: 'james@abcsupplies.com',
    phone: '+1 555-0101',
    deliveryDays: 2,
    rating: 4.8,
    priceLevel: 'medium',
    specialties: ['materials'],
  },
  {
    id: 'v2',
    name: 'Metro Equipment Rentals',
    contact: 'Sarah Chen',
    email: 'sarah@metroequip.com',
    phone: '+1 555-0102',
    deliveryDays: 1,
    rating: 4.5,
    priceLevel: 'high',
    specialties: ['equipment'],
  },
  {
    id: 'v3',
    name: 'FastTrack Materials Co.',
    contact: 'Mike Johnson',
    email: 'mike@fasttrack.com',
    phone: '+1 555-0103',
    deliveryDays: 1,
    rating: 4.2,
    priceLevel: 'low',
    specialties: ['materials'],
  },
  {
    id: 'v4',
    name: 'Premier Construction Services',
    contact: 'Emily Brown',
    email: 'emily@premiercs.com',
    phone: '+1 555-0104',
    deliveryDays: 3,
    rating: 4.9,
    priceLevel: 'high',
    specialties: ['services', 'equipment'],
  },
  {
    id: 'v5',
    name: 'BuildRight Contractors',
    contact: 'David Lee',
    email: 'david@buildright.com',
    phone: '+1 555-0105',
    deliveryDays: 2,
    rating: 4.6,
    priceLevel: 'medium',
    specialties: ['materials', 'services'],
  },
];

export interface Purchase {
  id: string;
  requestIds: string[];
  vendorId: string;
  createdAt: string;
  estimatedDelivery: string;
  notes?: string;
  status: 'ordered' | 'in_delivery' | 'delivered';
}

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
  projectName?: string;
  notes?: string;
  deliveryNotes?: string;
  availability?: Availability;
  purchaseId?: string;
  fulfilledQuantity?: number;
  deliveryStatus?: DeliveryStatus;
}

export const PRIORITY_CONFIG = {
  critical: { label: 'Critical', color: 'priority-critical', order: 1 },
  high: { label: 'High', color: 'priority-high', order: 2 },
  medium: { label: 'Medium', color: 'priority-medium', order: 3 },
  low: { label: 'Low', color: 'priority-low', order: 4 },
} as const;

export const STATUS_CONFIG = {
  pending: { label: 'New Requests', color: 'status-pending' },
  selected: { label: 'Selected for Purchase', color: 'status-selected' },
  ordered: { label: 'Ordered', color: 'status-ordered' },
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
  { id: 'selected', label: 'Selected for Purchase', color: 'hsl(var(--status-selected))' },
  { id: 'ordered', label: 'Ordered', color: 'hsl(var(--status-ordered))' },
  { id: 'in_delivery', label: 'In Delivery', color: 'hsl(var(--status-delivery))' },
  { id: 'delivered', label: 'Completed', color: 'hsl(var(--status-delivered))' },
] as const;

export const RESOURCE_TYPES = {
  materials: { label: 'Materials', icon: 'Package' },
  equipment: { label: 'Equipment', icon: 'Wrench' },
  services: { label: 'Services', icon: 'Users' },
} as const;

// Color palette for purchase grouping (10 distinct colors)
export const PURCHASE_COLORS = [
  'hsl(220 90% 60%)',   // Blue
  'hsl(160 70% 45%)',   // Teal
  'hsl(280 70% 60%)',   // Purple
  'hsl(30 90% 55%)',    // Orange
  'hsl(340 75% 55%)',   // Pink
  'hsl(190 80% 45%)',   // Cyan
  'hsl(50 90% 50%)',    // Yellow
  'hsl(130 60% 45%)',   // Green
  'hsl(0 75% 55%)',     // Red
  'hsl(260 60% 55%)',   // Indigo
] as const;