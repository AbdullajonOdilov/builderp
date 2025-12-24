import { Purchase, ResourceRequest, VENDORS, PURCHASE_COLORS, STATUS_CONFIG } from '@/types/request';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Package, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  Building, 
  Clock,
  Truck,
  CheckCircle2,
  FileText,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderDetailsDialogProps {
  purchase: Purchase | null;
  requests: ResourceRequest[];
  colorIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailsDialog({
  purchase,
  requests,
  colorIndex,
  open,
  onOpenChange,
}: OrderDetailsDialogProps) {
  if (!purchase) return null;

  const vendor = VENDORS.find((v) => v.id === purchase.vendorId);
  const color = PURCHASE_COLORS[colorIndex % PURCHASE_COLORS.length];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const daysUntilDelivery = () => {
    const today = new Date();
    const delivery = new Date(purchase.estimatedDelivery);
    const diff = Math.ceil((delivery.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const days = daysUntilDelivery();

  const totalItems = requests.length;
  const totalQuantity = requests.reduce((sum, r) => sum + r.quantity, 0);

  const getStatusIcon = () => {
    switch (purchase.status) {
      case 'ordered':
        return <Package className="h-4 w-4" />;
      case 'in_delivery':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle2 className="h-4 w-4" />;
    }
  };

  const getStatusColor = () => {
    switch (purchase.status) {
      case 'ordered':
        return 'bg-status-ordered/20 text-status-ordered border-status-ordered/30';
      case 'in_delivery':
        return 'bg-status-delivery/20 text-status-delivery border-status-delivery/30';
      case 'delivered':
        return 'bg-status-delivered/20 text-status-delivered border-status-delivered/30';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0 overflow-hidden">
        {/* Header with color accent */}
        <div 
          className="p-6 pb-4"
          style={{ borderBottom: `3px solid ${color}` }}
        >
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div 
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <Package className="h-6 w-6" style={{ color }} />
                </div>
                <div>
                  <DialogTitle className="text-xl">
                    PO #{purchase.id.slice(-4).toUpperCase()}
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Created {formatDate(purchase.createdAt)}
                  </p>
                </div>
              </div>
              <Badge 
                variant="outline" 
                className={cn("flex items-center gap-1.5", getStatusColor())}
              >
                {getStatusIcon()}
                {STATUS_CONFIG[purchase.status]?.label || purchase.status}
              </Badge>
            </div>
          </DialogHeader>
        </div>

        <ScrollArea className="max-h-[calc(90vh-200px)]">
          <div className="p-6 pt-4 space-y-6">
            {/* Vendor Information */}
            {vendor && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Vendor Information
                </h3>
                <div className="p-4 rounded-xl bg-secondary/50 border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-lg">{vendor.name}</span>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-medium">{vendor.rating}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{vendor.contact}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{vendor.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{vendor.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Badge variant="secondary" className="text-xs">
                      {vendor.priceLevel.charAt(0).toUpperCase() + vendor.priceLevel.slice(1)} Price
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {vendor.deliveryDays} day delivery
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Delivery Information */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Delivery Schedule
              </h3>
              <div className="p-4 rounded-xl bg-secondary/50 border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{formatDate(purchase.estimatedDelivery)}</p>
                      <p className="text-xs text-muted-foreground">Estimated Delivery</p>
                    </div>
                  </div>
                  <Badge 
                    variant="outline"
                    className={cn(
                      days <= 1 && 'bg-status-critical/20 text-status-critical border-status-critical/30',
                      days > 1 && days <= 3 && 'bg-status-high/20 text-status-high border-status-high/30',
                      days > 3 && 'bg-status-delivered/20 text-status-delivered border-status-delivered/30'
                    )}
                  >
                    {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : days < 0 ? `${Math.abs(days)}d overdue` : `${days} days`}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <Package className="h-4 w-4" />
                Order Items ({totalItems})
              </h3>
              <div className="rounded-xl border overflow-hidden">
                {requests.map((req, index) => (
                  <div 
                    key={req.id}
                    className={cn(
                      "flex items-center justify-between p-3",
                      index !== requests.length - 1 && "border-b"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{req.resourceName}</p>
                      <p className="text-xs text-muted-foreground">
                        Requested by {req.managerName}
                        {req.projectName && ` • ${req.projectName}`}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold">
                        {req.quantity} {req.unit}
                      </p>
                      {req.fulfilledQuantity !== undefined && req.fulfilledQuantity > 0 && (
                        <p className="text-xs text-status-delivered">
                          {req.fulfilledQuantity} delivered
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {purchase.notes && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Notes
                </h3>
                <div className="p-4 rounded-xl bg-secondary/50 border">
                  <p className="text-sm whitespace-pre-wrap">{purchase.notes}</p>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Timeline
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-status-ordered" />
                  <span className="text-muted-foreground">Order created:</span>
                  <span>{formatDate(purchase.createdAt)} at {formatTime(purchase.createdAt)}</span>
                </div>
                {purchase.status !== 'ordered' && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-status-delivery" />
                    <span className="text-muted-foreground">Delivery started</span>
                  </div>
                )}
                {purchase.status === 'delivered' && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-status-delivered" />
                    <span className="text-muted-foreground">Order completed</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}