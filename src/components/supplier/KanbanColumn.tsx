import { ResourceRequest, Status, Availability } from '@/types/request';
import { KanbanCard } from './KanbanCard';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  id: Status;
  label: string;
  color: string;
  requests: ResourceRequest[];
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  onMoveToReview: (id: string) => void;
  onStartDelivery: (id: string) => void;
  onComplete: (id: string) => void;
  onSetAvailability: (id: string, availability: Availability) => void;
  onViewDetails: (id: string) => void;
  onDrop: (requestId: string, newStatus: Status) => void;
}

export function KanbanColumn({
  id,
  label,
  color,
  requests,
  onAccept,
  onDecline,
  onMoveToReview,
  onStartDelivery,
  onComplete,
  onSetAvailability,
  onViewDetails,
  onDrop,
}: KanbanColumnProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-secondary/50');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-secondary/50');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-secondary/50');
    const requestId = e.dataTransfer.getData('requestId');
    if (requestId) {
      onDrop(requestId, id);
    }
  };

  return (
    <div
      className="flex-shrink-0 w-80 flex flex-col bg-secondary/30 rounded-xl"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          <h2 className="font-semibold text-foreground">{label}</h2>
          <span className="ml-auto bg-muted text-muted-foreground text-sm font-medium px-2 py-0.5 rounded-full">
            {requests.length}
          </span>
        </div>
      </div>

      {/* Cards container */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-280px)] min-h-[200px]">
        {requests.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-sm text-muted-foreground border-2 border-dashed border-border/50 rounded-lg">
            Drop requests here
          </div>
        ) : (
          requests.map((request) => (
            <KanbanCard
              key={request.id}
              request={request}
              onAccept={onAccept}
              onDecline={onDecline}
              onMoveToReview={onMoveToReview}
              onStartDelivery={onStartDelivery}
              onComplete={onComplete}
              onSetAvailability={onSetAvailability}
              onViewDetails={onViewDetails}
            />
          ))
        )}
      </div>
    </div>
  );
}