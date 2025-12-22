import { ResourceRequest, Availability, AVAILABILITY_CONFIG } from '@/types/request';
import { PriorityBadge } from '../PriorityBadge';
import { ResourceIcon } from '../ResourceIcon';
import { Button } from '@/components/ui/button';
import { Calendar, Check, X, Eye, ChevronDown, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface KanbanCardProps {
  request: ResourceRequest;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  onMoveToReview: (id: string) => void;
  onStartDelivery: (id: string) => void;
  onComplete: (id: string) => void;
  onSetAvailability: (id: string, availability: Availability) => void;
  onViewDetails: (id: string) => void;
  isDragging?: boolean;
}

export function KanbanCard({
  request,
  onAccept,
  onDecline,
  onMoveToReview,
  onStartDelivery,
  onComplete,
  onSetAvailability,
  onViewDetails,
  isDragging,
}: KanbanCardProps) {
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
  const isUrgent = request.priority === 'critical' || request.priority === 'high';
  const isSoon = daysUntil <= 3;

  const availabilityOptions: Availability[] = ['available', 'limited', 'not_available'];

  return (
    <div
      className={cn(
        'p-4 bg-card rounded-xl border shadow-sm transition-all duration-200',
        'hover:shadow-md cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-50 rotate-2 scale-105 shadow-lg',
        isUrgent && request.status === 'pending' && 'ring-2 ring-status-critical/40 animate-pulse-soft',
        isSoon && request.status !== 'delivered' && 'border-l-4 border-l-status-critical'
      )}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('requestId', request.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
    >
      {/* Header with icon and priority */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-secondary">
            <ResourceIcon type={request.resourceType} className="h-4 w-4 text-muted-foreground" />
          </div>
          <PriorityBadge priority={request.priority} size="sm" />
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
          onClick={() => onViewDetails(request.id)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>

      {/* Resource name and description */}
      <h3 className="font-semibold text-foreground leading-tight mb-1 line-clamp-2">
        {request.resourceName}
      </h3>
      <p className="text-sm text-muted-foreground mb-3">
        {request.quantity} {request.unit}
      </p>

      {/* Manager and date info */}
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
        <span className="truncate max-w-[100px]">{request.managerName}</span>
        <span className={cn(
          'flex items-center gap-1 font-medium',
          isSoon ? 'text-status-critical' : ''
        )}>
          <Calendar className="h-3 w-3" />
          {formatDate(request.neededDate)}
          {isSoon && daysUntil >= 0 && (
            <span className="ml-0.5">
              ({daysUntil === 0 ? 'Today!' : `${daysUntil}d`})
            </span>
          )}
        </span>
      </div>

      {/* Assigned Company Badge */}
      {request.assignedCompany && (
        <div className="flex items-center gap-2 text-xs bg-status-accepted/10 text-status-accepted border border-status-accepted/20 rounded-lg px-2 py-1.5 mb-3">
          <Building2 className="h-3 w-3" />
          <span className="font-medium truncate">{request.assignedCompany.name}</span>
        </div>
      )}

      {/* Availability selector */}
      <div className="mb-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'w-full h-8 text-xs justify-between',
                request.availability && AVAILABILITY_CONFIG[request.availability].color
              )}
            >
              {request.availability 
                ? AVAILABILITY_CONFIG[request.availability].label 
                : 'Set Availability'}
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-full">
            {availabilityOptions.map((avail) => (
              <DropdownMenuItem
                key={avail}
                onClick={() => onSetAvailability(request.id, avail)}
                className={cn(
                  'text-xs cursor-pointer',
                  request.availability === avail && 'bg-secondary'
                )}
              >
                {AVAILABILITY_CONFIG[avail].label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Quick action buttons based on status */}
      <div className="flex gap-2">
        {request.status === 'pending' && (
          <>
            <Button
              size="sm"
              className="flex-1 h-9 bg-status-accepted hover:bg-status-accepted/90 text-white"
              onClick={() => onAccept(request.id)}
            >
              <Check className="h-4 w-4 mr-1" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-9 px-3 text-muted-foreground hover:text-destructive hover:border-destructive"
              onClick={() => onDecline(request.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        )}

        {request.status === 'in_review' && (
          <Button
            size="sm"
            className="flex-1 h-9 bg-status-accepted hover:bg-status-accepted/90 text-white"
            onClick={() => onAccept(request.id)}
          >
            <Check className="h-4 w-4 mr-1" />
            Confirm
          </Button>
        )}

        {request.status === 'accepted' && (
          <Button
            size="sm"
            className="flex-1 h-9 bg-status-delivery hover:bg-status-delivery/90 text-white"
            onClick={() => onStartDelivery(request.id)}
          >
            Start Delivery
          </Button>
        )}

        {request.status === 'in_delivery' && (
          <Button
            size="sm"
            className="flex-1 h-9 bg-status-delivered hover:bg-status-delivered/90 text-white"
            onClick={() => onComplete(request.id)}
          >
            Mark Complete
          </Button>
        )}

        {request.status === 'delivered' && (
          <div className="flex-1 text-center text-sm text-status-delivered font-medium py-2">
            ✓ Completed
          </div>
        )}
      </div>

      {/* Notes preview */}
      {request.notes && (
        <p className="text-xs text-muted-foreground mt-3 italic line-clamp-2 border-t pt-2">
          "{request.notes}"
        </p>
      )}
    </div>
  );
}