import { useState, useMemo } from 'react';
import { ResourceRequest, Vendor, VENDORS, ResourceType } from '@/types/request';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  ShoppingCart, 
  X, 
  Plus,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface PurchasePanelProps {
  selectedRequests: ResourceRequest[];
  onRemoveRequest: (id: string) => void;
  onCreatePurchase: (vendorId: string, deliveryDate: string, notes: string) => void;
  onClose: () => void;
}

interface RequestLineItem {
  id: string;
  unitPrice: number;
  givenAmount: number;
}

// Vendor pricing history stored in localStorage
interface PricingHistory {
  [vendorId: string]: {
    [resourceName: string]: {
      unitPrice: number;
      lastUsed: string;
    };
  };
}

const PRICING_HISTORY_KEY = 'vendor-pricing-history';

const getPricingHistory = (): PricingHistory => {
  try {
    const stored = localStorage.getItem(PRICING_HISTORY_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const savePricingHistory = (history: PricingHistory) => {
  localStorage.setItem(PRICING_HISTORY_KEY, JSON.stringify(history));
};

export function PurchasePanel({
  selectedRequests,
  onRemoveRequest,
  onCreatePurchase,
  onClose,
}: PurchasePanelProps) {
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [vendors, setVendors] = useState<Vendor[]>(VENDORS);
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [newVendor, setNewVendor] = useState({
    name: '',
    contact: '',
    phone: '',
  });
  
  // Track unit price and given amount per request
  const [lineItems, setLineItems] = useState<Record<string, RequestLineItem>>(() => {
    const items: Record<string, RequestLineItem> = {};
    selectedRequests.forEach((req) => {
      items[req.id] = {
        id: req.id,
        unitPrice: 0,
        givenAmount: req.quantity,
      };
    });
    return items;
  });

  // Auto-suggest prices when vendor changes
  const applyPricingSuggestions = (vendorId: string) => {
    const history = getPricingHistory();
    const vendorPricing = history[vendorId] || {};
    
    setLineItems((prev) => {
      const updated = { ...prev };
      selectedRequests.forEach((req) => {
        const savedPrice = vendorPricing[req.resourceName];
        if (savedPrice && updated[req.id]) {
          updated[req.id] = {
            ...updated[req.id],
            unitPrice: savedPrice.unitPrice,
          };
        }
      });
      return updated;
    });
  };

  // Handle vendor selection with price suggestions
  const handleVendorChange = (vendorId: string) => {
    setSelectedVendorId(vendorId);
    applyPricingSuggestions(vendorId);
  };

  // Update line items when requests change
  useMemo(() => {
    selectedRequests.forEach((req) => {
      if (!lineItems[req.id]) {
        setLineItems((prev) => ({
          ...prev,
          [req.id]: {
            id: req.id,
            unitPrice: 0,
            givenAmount: req.quantity,
          },
        }));
      }
    });
  }, [selectedRequests]);

  // Get relevant vendors (those that match the resource types)
  const resourceTypes = useMemo(() => {
    const types = new Set<ResourceType>();
    selectedRequests.forEach((req) => types.add(req.resourceType));
    return types;
  }, [selectedRequests]);

  const relevantVendors = useMemo(() => {
    return vendors.filter((v) => 
      v.specialties.some((s) => resourceTypes.has(s))
    );
  }, [vendors, resourceTypes]);

  const handleCreatePurchase = () => {
    if (!selectedVendorId || !deliveryDate) return;
    
    // Save pricing history before creating purchase
    const history = getPricingHistory();
    if (!history[selectedVendorId]) {
      history[selectedVendorId] = {};
    }
    
    selectedRequests.forEach((req) => {
      const item = lineItems[req.id];
      if (item && item.unitPrice > 0) {
        history[selectedVendorId][req.resourceName] = {
          unitPrice: item.unitPrice,
          lastUsed: new Date().toISOString(),
        };
      }
    });
    
    savePricingHistory(history);
    onCreatePurchase(selectedVendorId, deliveryDate, notes);
  };

  const handleAddVendor = () => {
    if (!newVendor.name.trim()) return;
    
    const vendor: Vendor = {
      id: `v-${Date.now()}`,
      name: newVendor.name,
      contact: newVendor.contact || newVendor.name,
      email: '',
      phone: newVendor.phone || '',
      deliveryDays: 3,
      rating: 0,
      priceLevel: 'medium',
      specialties: Array.from(resourceTypes),
    };
    
    setVendors((prev) => [...prev, vendor]);
    const newVendorId = vendor.id;
    setSelectedVendorId(newVendorId);
    setShowAddVendor(false);
    setNewVendor({ name: '', contact: '', phone: '' });
  };

  const updateLineItem = (id: string, field: 'unitPrice' | 'givenAmount', value: number) => {
    setLineItems((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const calculateTotal = (id: string) => {
    const item = lineItems[id];
    if (!item) return 0;
    return item.unitPrice * item.givenAmount;
  };

  const grandTotal = useMemo(() => {
    return selectedRequests.reduce((sum, req) => sum + calculateTotal(req.id), 0);
  }, [selectedRequests, lineItems]);

  if (selectedRequests.length === 0) {
    return null;
  }

  return (
    <>
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
            {/* Left: Included requests table */}
            <div className="lg:w-2/3 border-r">
              <ScrollArea className="h-[350px] lg:h-[400px]">
                <div className="p-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Included Requests</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Resource</TableHead>
                        <TableHead className="text-center">Requested</TableHead>
                        <TableHead className="text-center">Given Amount</TableHead>
                        <TableHead className="text-center">Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedRequests.map((req) => {
                        const item = lineItems[req.id] || { unitPrice: 0, givenAmount: req.quantity };
                        const total = item.unitPrice * item.givenAmount;
                        
                        return (
                          <TableRow key={req.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm">{req.resourceName}</p>
                                <p className="text-xs text-muted-foreground">{req.projectName}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="text-sm text-muted-foreground">
                                {req.quantity} {req.unit}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-1">
                                <Input
                                  type="number"
                                  min={0}
                                  value={item.givenAmount}
                                  onChange={(e) => updateLineItem(req.id, 'givenAmount', Number(e.target.value))}
                                  className="h-8 w-20 text-center"
                                />
                                <span className="text-xs text-muted-foreground">{req.unit}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-1">
                                <span className="text-xs text-muted-foreground">$</span>
                                <Input
                                  type="number"
                                  min={0}
                                  step={0.01}
                                  value={item.unitPrice || ''}
                                  placeholder="0.00"
                                  onChange={(e) => updateLineItem(req.id, 'unitPrice', Number(e.target.value))}
                                  className="h-8 w-24 text-center"
                                />
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              ${total.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                onClick={() => onRemoveRequest(req.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  
                  {/* Grand Total */}
                  <div className="flex justify-end mt-4 pt-4 border-t">
                    <div className="text-right">
                      <span className="text-sm text-muted-foreground mr-4">Grand Total:</span>
                      <span className="text-xl font-bold">${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>

            {/* Right: Vendor selection & details */}
            <div className="lg:w-1/3 flex flex-col">
              <ScrollArea className="flex-1 h-[350px] lg:h-[400px]">
                <div className="p-6 space-y-6">
                  {/* Vendor Selection */}
                  <div className="space-y-2">
                    <Label>Select Vendor</Label>
                    <div className="flex gap-2">
                      <Select
                        value={selectedVendorId || ''}
                        onValueChange={handleVendorChange}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Choose a vendor..." />
                        </SelectTrigger>
                        <SelectContent className="bg-background">
                          {relevantVendors.length > 0 ? (
                            relevantVendors.map((vendor) => (
                              <SelectItem key={vendor.id} value={vendor.id}>
                                <div className="flex items-center gap-2">
                                  <span>{vendor.name}</span>
                                  {vendor.rating > 0 && (
                                    <span className="text-xs text-muted-foreground">
                                      ★ {vendor.rating}
                                    </span>
                                  )}
                                </div>
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>
                              No matching vendors
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowAddVendor(true)}
                        title="Add new vendor"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Delivery date & notes */}
                  <div className="space-y-4">
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
                        className="h-20 resize-none"
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

      {/* Add Vendor Dialog */}
      <Dialog open={showAddVendor} onOpenChange={setShowAddVendor}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Vendor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="vendor-name">Vendor Name *</Label>
              <Input
                id="vendor-name"
                placeholder="Enter vendor name"
                value={newVendor.name}
                onChange={(e) => setNewVendor((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendor-contact">Contact Person</Label>
              <Input
                id="vendor-contact"
                placeholder="Contact name"
                value={newVendor.contact}
                onChange={(e) => setNewVendor((prev) => ({ ...prev, contact: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendor-phone">Phone</Label>
              <Input
                id="vendor-phone"
                type="tel"
                placeholder="+1 555-0000"
                value={newVendor.phone}
                onChange={(e) => setNewVendor((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddVendor(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddVendor} disabled={!newVendor.name.trim()}>
              Add Vendor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
