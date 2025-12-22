import { ResourceRequest, Status, Availability, Company } from '@/types/request';
import { SupplierKanbanBoard } from './supplier/SupplierKanbanBoard';

interface SupplierDashboardProps {
  requests: ResourceRequest[];
  onUpdateStatus: (id: string, status: Status, deliveryNotes?: string, assignedCompany?: Company) => void;
  onSetAvailability: (id: string, availability: Availability) => void;
}

export function SupplierDashboard({ requests, onUpdateStatus, onSetAvailability }: SupplierDashboardProps) {
  return (
    <div className="h-[calc(100vh-64px)]">
      <SupplierKanbanBoard
        requests={requests}
        onUpdateStatus={onUpdateStatus}
        onSetAvailability={onSetAvailability}
      />
    </div>
  );
}