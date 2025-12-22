import { useState, useMemo } from 'react';
import { ResourceRequest, Vendor, VENDORS, ResourceType } from '@/types/request';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ResourceIcon } from '../ResourceIcon';
import { PriorityBadge } from '../PriorityBadge';
import { 
  ShoppingCart, 
  X, 
  Truck, 
  Star, 
  Phone, 
  Mail, 
  Clock, 
  DollarSign,
  Check,
  ChevronDown,
  ChevronUp,
  Package
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PurchasePanelProps {
  selectedRequests: ResourceRequest[];
  onRemoveRequest: (id: string) => void;
  onCreatePurchase: (vendorId: string, deliveryDate: string, notes: string) => void;
  onClose: () => void;
}

export function PurchasePanel({
  selectedRequests,
  onRemoveRequest,
  onCreatePurchase,
  onClose,
}: PurchasePanelProps) {
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [showVendorComparison, setShowVendorComparison] = useState(true);
  const [sortVendorsBy, setSortVendorsBy] = useState<'rating' | 'delivery' | 'price'>('rating');

  // Calculate aggregated quantities by resource
  const aggregatedResources = useMemo(() => {
    const map = new Map<string, { name: string; type: ResourceType; quantity: number; unit: string }>();
    selectedRequests.forEach((req) => {
      const key = `${req.resourceName}-${req.unit}`;
      const existing = map.get(key);
      if (existing) {
        existing.quantity += req.quantity;
      } else {
        map.set(key, {
          name: req.resourceName,
          type: req.resourceType,
          quantity: req.quantity,
          unit: req.unit,
        });
      }
    });
    return Array.from(map.values());
  }, [selectedRequests]);

  // Get relevant vendors (those that match the resource types)
  const resourceTypes = useMemo(() => {
    const types = new Set<ResourceType>();
    selectedRequests.forEach((req) => types.add(req.resourceType));
    return types;
  }, [selectedRequests]);

  const relevantVendors = useMemo(() => {
    return VENDORS.filter((v) => 
      v.specialties.some((s) => resourceTypes.has(s))
    );
  }, [resourceTypes]);

  // Sort vendors
  const sortedVendors = useMemo(() => {
    return [...relevantVendors].sort((a, b) => {
      switch (sortVendorsBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'delivery':
          return a.deliveryDays - b.deliveryDays;
        case 'price':
          const priceOrder = { low: 1, medium: 2, high: 3 };
          return priceOrder[a.priceLevel] - priceOrder[b.priceLevel];
        default:
          return 0;
      }
    });
  }, [relevantVendors, sortVendorsBy]);

  const selectedVendor = VENDORS.find((v) => v.id === selectedVendorId);

  const handleCreatePurchase = () => {
    if (!selectedVendorId || !deliveryDate) return;
    onCreatePurchase(selectedVendorId, deliveryDate, notes);
  };

  const getPriceLevelColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return 'text-status-delivered';
      case 'medium': return 'text-status-medium';
      case 'high': return 'text-status-critical';
    }
  };

  const getPriceLevelLabel = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return '$';
      case 'medium': return '$$';
      case 'high': return '$$$';
    }
  };

  if (selectedRequests.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-2xl animate-slide-up">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <ShoppingCart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Create Purchase</h3>
              <p className="text-sm text-muted-foreground">
                {selectedRequests.length} request{selectedRequests.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row max-h-[70vh]">
          {/* Left: Selected requests */}
          <div className="lg:w-1/3 border-r">
            <ScrollArea className="h-[350px] lg:h-[450px]">
              <div className="p-4 space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Included Requests</h4>
                {selectedRequests.map((req) => (
                  <div 
                    key={req.id}
                    className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg group"
                  >
                    <ResourceIcon type={req.resourceType} className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{req.resourceName}</p>
                      <p className="text-xs text-muted-foreground">
                        {req.quantity} {req.unit} • {req.projectName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={req.priority} size="sm" />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onRemoveRequest(req.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Aggregated totals */}
                <div className="pt-4 border-t mt-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Total Quantities
                  </h4>
                  <div className="space-y-2">
                    {aggregatedResources.map((res, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{res.name}</span>
                        <span className="font-medium">{res.quantity} {res.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Right: Vendor selection & details */}
          <div className="lg:w-2/3 flex flex-col">
            <ScrollArea className="flex-1 h-[350px] lg:h-[450px]">
              <div className="p-6 space-y-6">
                {/* Vendor comparison */}
                <Collapsible open={showVendorComparison} onOpenChange={setShowVendorComparison}>
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between cursor-pointer group">
                      <h4 className="text-sm font-medium">Select Vendor</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Compare vendors</span>
                        {showVendorComparison ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4">
                    {/* Sort options */}
                    <div className="flex gap-2 mb-4">
                      <span className="text-xs text-muted-foreground">Sort by:</span>
                      <Button
                        variant={sortVendorsBy === 'rating' ? 'secondary' : 'ghost'}
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => setSortVendorsBy('rating')}
                      >
                        <Star className="h-3 w-3 mr-1" />
                        Rating
                      </Button>
                      <Button
                        variant={sortVendorsBy === 'delivery' ? 'secondary' : 'ghost'}
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => setSortVendorsBy('delivery')}
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        Delivery
                      </Button>
                      <Button
                        variant={sortVendorsBy === 'price' ? 'secondary' : 'ghost'}
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => setSortVendorsBy('price')}
                      >
                        <DollarSign className="h-3 w-3 mr-1" />
                        Price
                      </Button>
                    </div>

                    {/* Vendor cards */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      {sortedVendors.map((vendor) => (
                        <div
                          key={vendor.id}
                          className={cn(
                            'p-4 rounded-xl border-2 cursor-pointer transition-all',
                            'hover:shadow-md hover:border-primary/30',
                            selectedVendorId === vendor.id 
                              ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                              : 'border-border'
                          )}
                          onClick={() => setSelectedVendorId(vendor.id)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-semibold text-sm">{vendor.name}</h5>
                            {selectedVendorId === vendor.id && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              <span className="font-medium">{vendor.rating}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Truck className="h-3 w-3 text-muted-foreground" />
                              <span>{vendor.deliveryDays}d</span>
                            </div>
                            <div className={cn("font-medium", getPriceLevelColor(vendor.priceLevel))}>
                              {getPriceLevelLabel(vendor.priceLevel)}
                            </div>
                          </div>

                          <div className="flex gap-1 mt-2">
                            {vendor.specialties.map((s) => (
                              <Badge key={s} variant="secondary" className="text-xs px-1.5 py-0">
                                {s}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Selected vendor details */}
                {selectedVendor && (
                  <div className="p-4 bg-secondary/30 rounded-xl border">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h5 className="font-semibold">{selectedVendor.name}</h5>
                        <p className="text-sm text-muted-foreground">{selectedVendor.contact}</p>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="font-medium">{selectedVendor.rating}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <a 
                        href={`mailto:${selectedVendor.email}`}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                      >
                        <Mail className="h-4 w-4" />
                        {selectedVendor.email}
                      </a>
                      <a 
                        href={`tel:${selectedVendor.phone}`}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                      >
                        <Phone className="h-4 w-4" />
                        {selectedVendor.phone}
                      </a>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Truck className="h-4 w-4" />
                        <span>Typical delivery: {selectedVendor.deliveryDays} days</span>
                      </div>
                      <div className={cn("flex items-center gap-2", getPriceLevelColor(selectedVendor.priceLevel))}>
                        <DollarSign className="h-4 w-4" />
                        <span>Price level: {selectedVendor.priceLevel}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Delivery date & notes */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="delivery-date">Estimated Delivery Date</Label>
                    <Input
                      id="delivery-date"
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any notes for this purchase..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="h-10 resize-none"
                    />
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* Footer with action */}
            <div className="p-4 border-t bg-muted/30">
              <Button
                className="w-full h-12 text-lg bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={!selectedVendorId || !deliveryDate}
                onClick={handleCreatePurchase}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Confirm Purchase Order
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}