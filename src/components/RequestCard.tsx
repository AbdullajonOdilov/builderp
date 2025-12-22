import { ResourceRequest, Status } from '@/types/request';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { ResourceIcon } from './ResourceIcon';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Package, Check, X, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RequestCardProps {
  request: ResourceRequest;
  role: 'manager' | 'supplier';
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
  onDeliver?: (id: string) => void;
}

export function RequestCard({ request, role, onAccept, onDecline, onDeliver }: RequestCardProps) {
  const isSupplier = role === 'supplier';
  const isPending = request.status === 'pending';
  const isOrdered = request.status === 'ordered';

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getDaysUntil = (dateStr: string) => {
    const today = new Date();
    const target = new Date(dateStr);
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const daysUntil = getDaysUntil(request.neededDate);

  return (
    <Card className={cn(
      'p-4 transition-all duration-200 hover:shadow-card-hover animate-fade-in',
      request.priority === 'critical' && isPending && 'ring-2 ring-status-critical/30'
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="p-2 rounded-lg bg-secondary">
            <ResourceIcon type={request.resourceType} className="text-muted-foreground" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-semibold text-foreground truncate">
                {request.resourceName}
              </h3>
              <PriorityBadge priority={request.priority} size="sm" />
            </div>
            
            <p className="text-sm text-muted-foreground mb-2">
              {request.quantity} {request.unit} • {request.managerName}
            </p>
            
            <div className="flex items-center gap-4 text-sm">
              <span className={cn(
                'flex items-center gap-1',
                daysUntil <= 2 ? 'text-status-critical font-medium' : 'text-muted-foreground'
              )}>
                <Calendar className="h-4 w-4" />
                {formatDate(request.neededDate)}
                {daysUntil <= 2 && daysUntil >= 0 && (
                  <span className="ml-1">({daysUntil === 0 ? 'Today' : `${daysUntil}d`})</span>
                )}
              </span>
              
              <StatusBadge status={request.status} size="sm" />
            </div>
            
            {request.notes && (
              <p className="text-sm text-muted-foreground mt-2 italic">
                "{request.notes}"
              </p>
            )}
            
            {request.deliveryNotes && (
              <p className="text-sm text-status-ordered mt-2">
                📦 {request.deliveryNotes}
              </p>
            )}
          </div>
        </div>
        
        {isSupplier && (
          <div className="flex flex-col gap-2 shrink-0">
            {isPending && (
              <>
                <Button
                  size="sm"
                  onClick={() => onAccept?.(request.id)}
                  className="bg-status-ordered hover:bg-status-ordered/90"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDecline?.(request.id)}
                  className="text-muted-foreground hover:text-destructive hover:border-destructive"
                >
                  <X className="h-4 w-4 mr-1" />
                  Decline
                </Button>
              </>
            )}
            {isOrdered && (
              <Button
                size="sm"
                onClick={() => onDeliver?.(request.id)}
                className="bg-status-delivered hover:bg-status-delivered/90"
              >
                <Truck className="h-4 w-4 mr-1" />
                Delivered
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}