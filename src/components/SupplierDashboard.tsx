import { ResourceRequest, Status, Availability, Purchase } from '@/types/request';
import { SupplierKanbanBoard } from './supplier/SupplierKanbanBoard';

interface SupplierDashboardProps {
  requests: ResourceRequest[];
  purchases: Purchase[];
  onUpdateStatus: (id: string, status: Status, deliveryNotes?: string) => void;
  onSetAvailability: (id: string, availability: Availability) => void;
  onSelectForPurchase: (ids: string[]) => void;
  onDeselectFromPurchase: (ids: string[]) => void;
  onCreatePurchase: (requestIds: string[], vendorId: string, estimatedDelivery: string, notes?: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onUpdateFulfilledQuantity: (id: string, fulfilledQuantity: number) => void;
}

export function SupplierDashboard({ 
  requests, 
  purchases,
  onUpdateStatus, 
  onSetAvailability,
  onSelectForPurchase,
  onDeselectFromPurchase,
  onCreatePurchase,
  onUpdateQuantity,
  onUpdateFulfilledQuantity,
}: SupplierDashboardProps) {
  return (
    <div className="h-[calc(100vh-64px)]">
      <SupplierKanbanBoard
        requests={requests}
        purchases={purchases}
        onUpdateStatus={onUpdateStatus}
        onSetAvailability={onSetAvailability}
        onSelectForPurchase={onSelectForPurchase}
        onDeselectFromPurchase={onDeselectFromPurchase}
        onCreatePurchase={onCreatePurchase}
        onUpdateQuantity={onUpdateQuantity}
        onUpdateFulfilledQuantity={onUpdateFulfilledQuantity}
      />
    </div>
  );
}