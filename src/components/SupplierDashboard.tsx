import { ResourceRequest, Status } from '@/types/request';
import { RequestList } from './RequestList';
import { toast } from 'sonner';

interface SupplierDashboardProps {
  requests: ResourceRequest[];
  onUpdateStatus: (id: string, status: Status, deliveryNotes?: string) => void;
}

export function SupplierDashboard({ requests, onUpdateStatus }: SupplierDashboardProps) {
  const handleAccept = (id: string) => {
    onUpdateStatus(id, 'accepted', 'Processing your request');
    toast.success('Request accepted!');
  };

  const handleDecline = (id: string) => {
    onUpdateStatus(id, 'declined');
    toast.info('Request declined');
  };

  const handleDeliver = (id: string) => {
    onUpdateStatus(id, 'delivered', 'Delivered successfully');
    toast.success('Marked as delivered!');
  };

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <div className="container py-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Incoming Requests</h1>
        <p className="text-muted-foreground">
          {pendingCount > 0
            ? `You have ${pendingCount} pending request${pendingCount > 1 ? 's' : ''}`
            : 'All caught up!'}
        </p>
      </div>

      <RequestList
        requests={requests}
        role="supplier"
        onAccept={handleAccept}
        onDecline={handleDecline}
        onDeliver={handleDeliver}
      />
    </div>
  );
}
