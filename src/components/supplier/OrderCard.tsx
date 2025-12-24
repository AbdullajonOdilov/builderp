import { Purchase, ResourceRequest, VENDORS, PURCHASE_COLORS } from '@/types/request';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Calendar, Truck, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OrderCardProps {
  purchase: Purchase;
  requests: ResourceRequest[];
  colorIndex: number;
  onViewDetails?: (purchaseId: string) => void;
  onStartDelivery?: (purchaseId: string) => void;
}

export function OrderCard({
  purchase,
  requests,
  colorIndex,
  onViewDetails,
  onStartDelivery,
}: OrderCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  const vendor = VENDORS.find((v) => v.id === purchase.vendorId);
  const color = PURCHASE_COLORS[colorIndex % PURCHASE_COLORS.length];
  
  const totalItems = requests.length;
  const totalQuantity = requests.reduce((sum, r) => sum + r.quantity, 0);
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const daysUntilDelivery = () => {
    const today = new Date();
    const delivery = new Date(purchase.estimatedDelivery);
    const diff = Math.ceil((delivery.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const days = daysUntilDelivery();

  return (
    <Card
      className="overflow-hidden transition-all duration-200 hover:shadow-md"
      style={{ borderLeftWidth: '4px', borderLeftColor: color }}
    >
      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${color}20` }}
            >
              <Package className="h-4 w-4" style={{ color }} />
            </div>
            <div>
              <h3 className="font-semibold text-sm">
                PO #{purchase.id.slice(-4).toUpperCase()}
              </h3>
              <p className="text-xs text-muted-foreground">
                {vendor?.name || 'Unknown Vendor'}
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            onClick={() => onViewDetails?.(purchase.id)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Package className="h-3 w-3" />
            <span>{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span 
              className={cn(
                days <= 1 && 'text-status-critical font-medium',
                days > 1 && days <= 3 && 'text-status-high font-medium'
              )}
            >
              {formatDate(purchase.estimatedDelivery)}
              {days >= 0 && ` (${days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days}d`})`}
            </span>
          </div>
        </div>

        {/* Expand/Collapse button */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full h-8 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3 w-3 mr-1" />
              Hide Items
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 mr-1" />
              Show {totalItems} Items
            </>
          )}
        </Button>

        {/* Expanded items list */}
        {expanded && (
          <div className="mt-3 pt-3 border-t space-y-2">
            {requests.map((req) => (
              <div 
                key={req.id}
                className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded-lg"
              >
                <span className="font-medium truncate flex-1">{req.resourceName}</span>
                <span className="text-muted-foreground text-xs ml-2">
                  {req.quantity} {req.unit}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Action button */}
        {purchase.status === 'ordered' && onStartDelivery && (
          <Button
            size="sm"
            className="w-full mt-3 bg-status-delivery hover:bg-status-delivery/90"
            onClick={() => onStartDelivery(purchase.id)}
          >
            <Truck className="h-4 w-4 mr-2" />
            Start Delivery
          </Button>
        )}
      </div>
    </Card>
  );
}
