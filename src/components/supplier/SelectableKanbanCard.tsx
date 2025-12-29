import { ResourceRequest, Availability, AVAILABILITY_CONFIG, PURCHASE_COLORS, Vendor, VENDORS } from '@/types/request';
import { PriorityBadge } from '../PriorityBadge';
import { ResourceIcon } from '../ResourceIcon';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Eye, ChevronDown, Package, Truck, CircleCheck, Minus, Plus, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface SelectableKanbanCardProps {
  request: ResourceRequest;
  isSelected?: boolean;
  purchaseColorIndex?: number;
  onSelect?: (id: string, selected: boolean) => void;
  onAccept?: (id: string) => void;
  onSetAvailability?: (id: string, availability: Availability) => void;
  onViewDetails: (id: string) => void;
  onUpdateQuantity?: (id: string, quantity: number) => void;
  onUpdateFulfilled?: (id: string, fulfilled: number) => void;
  onDecline?: (id: string) => void;
  isDragging?: boolean;
  showActions?: boolean;
}

export function SelectableKanbanCard({
  request,
  isSelected = false,
  purchaseColorIndex,
  onSelect,
  onAccept,
  onSetAvailability,
  onViewDetails,
  onUpdateQuantity,
  onUpdateFulfilled,
  onDecline,
  isDragging,
  showActions = true,
}: SelectableKanbanCardProps) {
  const [isEditingQty, setIsEditingQty] = useState(false);
  const [tempQty, setTempQty] = useState(request.quantity);

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

  const purchaseColor = purchaseColorIndex !== undefined 
    ? PURCHASE_COLORS[purchaseColorIndex % PURCHASE_COLORS.length] 
    : null;

  const vendor = request.purchaseId 
    ? VENDORS.find(v => v.id === request.purchaseId?.replace('p', 'v')) // Mock vendor lookup
    : null;

  const handleQuantityChange = () => {
    if (tempQty !== request.quantity && onUpdateQuantity) {
      onUpdateQuantity(request.id, tempQty);
    }
    setIsEditingQty(false);
  };

  const handleFulfilledChange = (delta: number) => {
    if (!onUpdateFulfilled) return;
    const newValue = Math.max(0, Math.min(request.quantity, (request.fulfilledQuantity || 0) + delta));
    onUpdateFulfilled(request.id, newValue);
  };

  const deliveryProgress = request.fulfilledQuantity !== undefined 
    ? (request.fulfilledQuantity / request.quantity) * 100 
    : 0;

  return (
    <div
      className={cn(
        'p-4 bg-card rounded-xl border-2 shadow-sm transition-all duration-200',
        'hover:shadow-md',
        isDragging && 'opacity-50 rotate-2 scale-105 shadow-lg',
        isUrgent && request.status === 'pending' && 'ring-2 ring-status-critical/40 animate-pulse-soft',
        isSoon && request.status !== 'delivered' && 'border-l-4 border-l-status-critical',
        isSelected && 'ring-2 ring-primary bg-primary/5',
        purchaseColor && `border-l-4`,
      )}
      style={purchaseColor ? { borderLeftColor: purchaseColor } : undefined}
    >
      {/* Simplified single-row layout for pending and selected requests */}
      {(request.status === 'pending' || request.status === 'selected') ? (
        <div className="flex items-center gap-3">
          {request.status === 'pending' && onSelect && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => onSelect(request.id, !!checked)}
              className="h-4 w-4 shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <h3 className="font-semibold text-foreground leading-tight truncate">
                {request.resourceName}
              </h3>
              <span className="text-sm text-muted-foreground shrink-0">
                {request.quantity} {request.unit}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {request.status === 'pending' && onAccept && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-green-600 hover:bg-green-50"
                onClick={() => onAccept(request.id)}
                title="Accept"
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
            {request.status === 'pending' && onDecline && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                onClick={() => onDecline(request.id)}
                title="Decline"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => onViewDetails(request.id)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Full layout for other statuses */}
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

          <h3 className="font-semibold text-foreground leading-tight mb-1 line-clamp-2">
            {request.resourceName}
          </h3>

          {/* Quantity */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <span>{request.quantity} {request.unit}</span>
          </div>

          {/* Project and Manager */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span className="truncate max-w-[120px] font-medium">{request.projectName || 'General'}</span>
            <span className="truncate max-w-[80px]">{request.managerName}</span>
          </div>

          {/* Date */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
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

          {/* Purchase group indicator */}
          {purchaseColor && request.purchaseId && (
            <div 
              className="flex items-center gap-2 text-xs rounded-lg px-2 py-1.5 mb-3"
              style={{ backgroundColor: `${purchaseColor}20`, color: purchaseColor }}
            >
              <Package className="h-3 w-3" />
              <span className="font-medium">Purchase #{request.purchaseId.slice(-4)}</span>
            </div>
          )}

          {/* Delivery progress for in_delivery status */}
          {(request.status === 'in_delivery' || request.status === 'ordered') && request.fulfilledQuantity !== undefined && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Delivered</span>
                <span className="font-medium">
                  {request.fulfilledQuantity} / {request.quantity} {request.unit}
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className={cn(
                    'h-full rounded-full transition-all',
                    deliveryProgress === 100 ? 'bg-status-delivered' :
                    deliveryProgress > 0 ? 'bg-status-delivery' : 'bg-muted'
                  )}
                  style={{ width: `${deliveryProgress}%` }}
                />
              </div>
              {onUpdateFulfilled && request.status === 'in_delivery' && (
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => handleFulfilledChange(-1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="text-xs font-medium w-16 text-center">
                    {request.fulfilledQuantity} received
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => handleFulfilledChange(1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Quick actions for non-pending/selected */}
          {showActions && (
            <div className="flex gap-2">
              {request.status === 'in_delivery' && (
                <div className="flex-1 flex items-center justify-center gap-2 text-sm text-status-delivery font-medium py-2">
                  <Truck className="h-4 w-4" />
                  In Transit
                </div>
              )}

              {request.status === 'delivered' && (
                <div className="flex-1 flex items-center justify-center gap-2 text-sm text-status-delivered font-medium py-2">
                  <CircleCheck className="h-4 w-4" />
                  Completed
                </div>
              )}
            </div>
          )}

          {/* Notes preview */}
          {request.notes && (
            <p className="text-xs text-muted-foreground mt-3 italic line-clamp-2 border-t pt-2">
              "{request.notes}"
            </p>
          )}
        </>
      )}
    </div>
  );
}