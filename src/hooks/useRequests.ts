import { useState } from 'react';
import { ResourceRequest, Priority, Status, ResourceType, Availability } from '@/types/request';

// Mock initial data
const initialRequests: ResourceRequest[] = [
  {
    id: '1',
    resourceType: 'materials',
    resourceName: 'Concrete Mix M30',
    quantity: 50,
    unit: 'bags',
    neededDate: '2025-12-23',
    priority: 'critical',
    status: 'pending',
    createdAt: '2025-12-20T10:00:00',
    managerName: 'John Smith',
    notes: 'Needed for foundation work',
  },
  {
    id: '2',
    resourceType: 'equipment',
    resourceName: 'Excavator CAT 320',
    quantity: 1,
    unit: 'unit',
    neededDate: '2025-12-26',
    priority: 'high',
    status: 'pending',
    createdAt: '2025-12-20T11:30:00',
    managerName: 'Maria Garcia',
  },
  {
    id: '3',
    resourceType: 'materials',
    resourceName: 'Steel Rebar 12mm',
    quantity: 200,
    unit: 'pieces',
    neededDate: '2025-12-28',
    priority: 'medium',
    status: 'accepted',
    createdAt: '2025-12-19T09:00:00',
    managerName: 'John Smith',
    deliveryNotes: 'Scheduled for Dec 27',
  },
  {
    id: '4',
    resourceType: 'services',
    resourceName: 'Electrical Inspection',
    quantity: 1,
    unit: 'service',
    neededDate: '2025-12-30',
    priority: 'low',
    status: 'delivered',
    createdAt: '2025-12-18T14:00:00',
    managerName: 'Maria Garcia',
  },
  {
    id: '5',
    resourceType: 'materials',
    resourceName: 'Lumber 2x4 Pine',
    quantity: 100,
    unit: 'pieces',
    neededDate: '2025-12-24',
    priority: 'high',
    status: 'pending',
    createdAt: '2025-12-21T08:00:00',
    managerName: 'Carlos Rodriguez',
    notes: 'For framing second floor',
  },
  {
    id: '6',
    resourceType: 'equipment',
    resourceName: 'Concrete Mixer',
    quantity: 2,
    unit: 'units',
    neededDate: '2025-12-25',
    priority: 'medium',
    status: 'in_review',
    createdAt: '2025-12-21T09:00:00',
    managerName: 'John Smith',
  },
  {
    id: '7',
    resourceType: 'materials',
    resourceName: 'Sand - Fine Grade',
    quantity: 10,
    unit: 'tons',
    neededDate: '2025-12-27',
    priority: 'low',
    status: 'in_delivery',
    createdAt: '2025-12-19T15:00:00',
    managerName: 'Maria Garcia',
  },
];

export function useRequests() {
  const [requests, setRequests] = useState<ResourceRequest[]>(initialRequests);

  const addRequest = (request: Omit<ResourceRequest, 'id' | 'createdAt' | 'status'>) => {
    const newRequest: ResourceRequest = {
      ...request,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    setRequests((prev) => [newRequest, ...prev]);
    return newRequest;
  };

  const updateStatus = (id: string, status: Status, deliveryNotes?: string) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, status, deliveryNotes: deliveryNotes || req.deliveryNotes } : req
      )
    );
  };

  const setAvailability = (id: string, availability: Availability) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, availability } : req
      )
    );
  };

  const getRequestsByStatus = (status?: Status) => {
    if (!status) return requests;
    return requests.filter((req) => req.status === status);
  };

  const getPendingRequests = () => requests.filter((req) => req.status === 'pending');
  
  const sortByPriority = (reqs: ResourceRequest[]) => {
    const priorityOrder = { critical: 1, high: 2, medium: 3, low: 4 };
    return [...reqs].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  };

  return {
    requests,
    addRequest,
    updateStatus,
    setAvailability,
    getRequestsByStatus,
    getPendingRequests,
    sortByPriority,
  };
}
