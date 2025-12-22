import { useState } from 'react';
import { ResourceRequest, Priority, Status, ResourceType, Availability, Purchase, Vendor } from '@/types/request';

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
    projectName: 'Tower Block A',
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
    projectName: 'Site Preparation',
  },
  {
    id: '3',
    resourceType: 'materials',
    resourceName: 'Steel Rebar 12mm',
    quantity: 200,
    unit: 'pieces',
    neededDate: '2025-12-28',
    priority: 'medium',
    status: 'ordered',
    createdAt: '2025-12-19T09:00:00',
    managerName: 'John Smith',
    projectName: 'Tower Block A',
    deliveryNotes: 'Scheduled for Dec 27',
    purchaseId: 'p1',
    fulfilledQuantity: 0,
    deliveryStatus: 'pending',
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
    projectName: 'Phase 2 Wiring',
    fulfilledQuantity: 1,
    deliveryStatus: 'complete',
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
    projectName: 'Framing Works',
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
    status: 'pending',
    createdAt: '2025-12-21T09:00:00',
    managerName: 'John Smith',
    projectName: 'Tower Block A',
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
    projectName: 'Landscaping',
    purchaseId: 'p2',
    fulfilledQuantity: 5,
    deliveryStatus: 'partial',
  },
  {
    id: '8',
    resourceType: 'materials',
    resourceName: 'Cement Portland Type I',
    quantity: 100,
    unit: 'bags',
    neededDate: '2025-12-24',
    priority: 'critical',
    status: 'pending',
    createdAt: '2025-12-21T10:00:00',
    managerName: 'John Smith',
    projectName: 'Tower Block A',
  },
  {
    id: '9',
    resourceType: 'materials',
    resourceName: 'Gravel 20mm',
    quantity: 15,
    unit: 'tons',
    neededDate: '2025-12-25',
    priority: 'medium',
    status: 'pending',
    createdAt: '2025-12-21T11:00:00',
    managerName: 'Carlos Rodriguez',
    projectName: 'Driveway Construction',
  },
];

const initialPurchases: Purchase[] = [
  {
    id: 'p1',
    requestIds: ['3'],
    vendorId: 'v1',
    createdAt: '2025-12-19T10:00:00',
    estimatedDelivery: '2025-12-27',
    status: 'ordered',
  },
  {
    id: 'p2',
    requestIds: ['7'],
    vendorId: 'v3',
    createdAt: '2025-12-20T14:00:00',
    estimatedDelivery: '2025-12-26',
    status: 'in_delivery',
  },
];

export function useRequests() {
  const [requests, setRequests] = useState<ResourceRequest[]>(initialRequests);
  const [purchases, setPurchases] = useState<Purchase[]>(initialPurchases);

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
        req.id === id ? { 
          ...req, 
          status, 
          deliveryNotes: deliveryNotes || req.deliveryNotes,
        } : req
      )
    );
  };

  const updateQuantity = (id: string, quantity: number) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, quantity } : req
      )
    );
  };

  const updateFulfilledQuantity = (id: string, fulfilledQuantity: number) => {
    setRequests((prev) =>
      prev.map((req) => {
        if (req.id !== id) return req;
        const deliveryStatus: 'pending' | 'partial' | 'complete' = 
          fulfilledQuantity === 0 ? 'pending' :
          fulfilledQuantity >= req.quantity ? 'complete' : 'partial';
        return { 
          ...req, 
          fulfilledQuantity,
          deliveryStatus,
          status: deliveryStatus === 'complete' ? 'delivered' : req.status,
        };
      })
    );
  };

  const setAvailability = (id: string, availability: Availability) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, availability } : req
      )
    );
  };

  const selectForPurchase = (ids: string[]) => {
    setRequests((prev) =>
      prev.map((req) =>
        ids.includes(req.id) ? { ...req, status: 'selected' as Status } : req
      )
    );
  };

  const deselectFromPurchase = (ids: string[]) => {
    setRequests((prev) =>
      prev.map((req) =>
        ids.includes(req.id) && req.status === 'selected' 
          ? { ...req, status: 'pending' as Status } 
          : req
      )
    );
  };

  const createPurchase = (
    requestIds: string[], 
    vendorId: string, 
    estimatedDelivery: string,
    notes?: string
  ) => {
    const purchaseId = `p${Date.now()}`;
    const newPurchase: Purchase = {
      id: purchaseId,
      requestIds,
      vendorId,
      createdAt: new Date().toISOString(),
      estimatedDelivery,
      notes,
      status: 'ordered',
    };
    
    setPurchases((prev) => [...prev, newPurchase]);
    
    setRequests((prev) =>
      prev.map((req) =>
        requestIds.includes(req.id) ? { 
          ...req, 
          status: 'ordered' as Status,
          purchaseId,
          fulfilledQuantity: 0,
          deliveryStatus: 'pending' as const,
        } : req
      )
    );
    
    return newPurchase;
  };

  const updatePurchaseStatus = (purchaseId: string, status: Purchase['status']) => {
    setPurchases((prev) =>
      prev.map((p) =>
        p.id === purchaseId ? { ...p, status } : p
      )
    );
    
    // Update all requests in this purchase
    const purchase = purchases.find((p) => p.id === purchaseId);
    if (purchase) {
      const newStatus: Status = status === 'delivered' ? 'delivered' : 
                                status === 'in_delivery' ? 'in_delivery' : 'ordered';
      setRequests((prev) =>
        prev.map((req) =>
          purchase.requestIds.includes(req.id) ? { ...req, status: newStatus } : req
        )
      );
    }
  };

  const getPurchaseById = (id: string) => purchases.find((p) => p.id === id);

  const getPurchaseForRequest = (requestId: string) => {
    const request = requests.find((r) => r.id === requestId);
    if (!request?.purchaseId) return null;
    return purchases.find((p) => p.id === request.purchaseId);
  };

  const getRequestsByStatus = (status?: Status) => {
    if (!status) return requests;
    return requests.filter((req) => req.status === status);
  };

  const getPendingRequests = () => requests.filter((req) => req.status === 'pending');
  const getSelectedRequests = () => requests.filter((req) => req.status === 'selected');
  
  const sortByPriority = (reqs: ResourceRequest[]) => {
    const priorityOrder = { critical: 1, high: 2, medium: 3, low: 4 };
    return [...reqs].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  };

  return {
    requests,
    purchases,
    addRequest,
    updateStatus,
    updateQuantity,
    updateFulfilledQuantity,
    setAvailability,
    selectForPurchase,
    deselectFromPurchase,
    createPurchase,
    updatePurchaseStatus,
    getPurchaseById,
    getPurchaseForRequest,
    getRequestsByStatus,
    getPendingRequests,
    getSelectedRequests,
    sortByPriority,
  };
}