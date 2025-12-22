import { useState, useMemo } from 'react';
import { ResourceRequest, Status, Availability, Purchase, KANBAN_COLUMNS, PRIORITY_CONFIG, PURCHASE_COLORS, VENDORS } from '@/types/request';
import { SelectableKanbanCard } from './SelectableKanbanCard';
import { PurchasePanel } from './PurchasePanel';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Search, AlertTriangle, Zap, EyeOff, ShoppingCart, Package } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { PriorityBadge } from '../PriorityBadge';
import { ResourceIcon } from '../ResourceIcon';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SupplierKanbanBoardProps {
  requests: ResourceRequest[];
  purchases: Purchase[];
  onUpdateStatus: (id: string, status: Status, deliveryNotes?: string) => void;
  onSetAvailability: (id: string, availability: Availability) => void;
  onSelectForPurchase: (ids: string[]) => void;
  onDeselectFromPurchase: (ids: string[]) => void;
  onCreatePurchase: (requestIds: string[], vendorId: string, estimatedDelivery: string, notes?: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onUpdateFulfilledQuantity: (id: string, fulfilledQuantity: number) => void;
}

export function SupplierKanbanBoard({
  requests,
  purchases,
  onUpdateStatus,
  onSetAvailability,
  onSelectForPurchase,
  onDeselectFromPurchase,
  onCreatePurchase,
  onUpdateQuantity,
  onUpdateFulfilledQuantity,
}: SupplierKanbanBoardProps) {
  const [priorityMode, setPriorityMode] = useState(false);
  const [showUrgentOnly, setShowUrgentOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<ResourceRequest | null>(null);
  const [showDeclined, setShowDeclined] = useState(false);
  const [showPurchasePanel, setShowPurchasePanel] = useState(false);
  const [selectedRequestIds, setSelectedRequestIds] = useState<Set<string>>(new Set());

  const declinedRequests = requests.filter((r) => r.status === 'declined');

  // Get purchase color index for grouped requests
  const purchaseColorMap = useMemo(() => {
    const map = new Map<string, number>();
    purchases.forEach((p, idx) => {
      p.requestIds.forEach((rid) => map.set(rid, idx));
    });
    return map;
  }, [purchases]);

  // Filter and sort requests
  const filteredRequests = requests
    .filter((r) => r.status !== 'declined')
    .filter((r) => {
      if (showUrgentOnly) {
        return r.priority === 'critical' || r.priority === 'high';
      }
      return true;
    })
    .filter((r) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          r.resourceName.toLowerCase().includes(query) ||
          r.managerName.toLowerCase().includes(query) ||
          (r.projectName && r.projectName.toLowerCase().includes(query))
        );
      }
      return true;
    });

  // Sort by priority and date in priority mode
  const sortRequests = (reqs: ResourceRequest[]) => {
    if (!priorityMode) return reqs;
    
    return [...reqs].sort((a, b) => {
      const priorityOrder = PRIORITY_CONFIG[a.priority].order - PRIORITY_CONFIG[b.priority].order;
      if (priorityOrder !== 0) return priorityOrder;
      return new Date(a.neededDate).getTime() - new Date(b.neededDate).getTime();
    });
  };

  // Get requests for each column
  const getColumnRequests = (status: Status) => {
    return sortRequests(filteredRequests.filter((r) => r.status === status));
  };

  // Stats
  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const selectedCount = requests.filter((r) => r.status === 'selected').length;
  const criticalCount = requests.filter(
    (r) => r.priority === 'critical' && r.status === 'pending'
  ).length;
  const todayCount = requests.filter((r) => {
    const today = new Date();
    const needed = new Date(r.neededDate);
    return (
      r.status !== 'delivered' &&
      r.status !== 'declined' &&
      needed.toDateString() === today.toDateString()
    );
  }).length;

  // Selection handlers
  const handleSelect = (id: string, selected: boolean) => {
    const newSet = new Set(selectedRequestIds);
    if (selected) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedRequestIds(newSet);
  };

  const handleAddToPurchase = () => {
    if (selectedRequestIds.size === 0) return;
    onSelectForPurchase(Array.from(selectedRequestIds));
    setSelectedRequestIds(new Set());
    toast.success(`${selectedRequestIds.size} request(s) added to purchase`);
  };

  const handleRemoveFromPurchase = (id: string) => {
    onDeselectFromPurchase([id]);
  };

  const handleCreatePurchase = (vendorId: string, deliveryDate: string, notes: string) => {
    const selectedReqs = requests.filter((r) => r.status === 'selected');
    if (selectedReqs.length === 0) return;
    
    onCreatePurchase(
      selectedReqs.map((r) => r.id),
      vendorId,
      deliveryDate,
      notes
    );
    setShowPurchasePanel(false);
    toast.success('Purchase order created successfully!');
  };

  const handleDecline = (id: string) => {
    onUpdateStatus(id, 'declined');
    toast.info('Request declined');
  };

  const handleStartDelivery = (id: string) => {
    onUpdateStatus(id, 'in_delivery');
    toast.info('Delivery started');
  };

  const handleComplete = (id: string) => {
    onUpdateStatus(id, 'delivered');
    toast.success('Marked as completed!');
  };

  const handleDrop = (requestId: string, newStatus: Status) => {
    const request = requests.find((r) => r.id === requestId);
    if (!request) return;
    
    // Validate status transitions
    const validTransitions: Record<Status, Status[]> = {
      pending: ['selected', 'declined'],
      selected: ['pending', 'declined'],
      ordered: ['in_delivery'],
      in_delivery: ['ordered', 'delivered'],
      delivered: [],
      declined: ['pending'],
    };

    if (!validTransitions[request.status].includes(newStatus)) {
      toast.error('Invalid status transition');
      return;
    }

    if (newStatus === 'selected') {
      onSelectForPurchase([requestId]);
    } else if (request.status === 'selected' && newStatus === 'pending') {
      onDeselectFromPurchase([requestId]);
    } else {
      onUpdateStatus(requestId, newStatus);
    }
    toast.success(`Moved to ${KANBAN_COLUMNS.find(c => c.id === newStatus)?.label || newStatus}`);
  };

  const handleViewDetails = (id: string) => {
    const request = requests.find((r) => r.id === id);
    if (request) {
      setSelectedRequest(request);
    }
  };

  // Selected requests for purchase panel
  const selectedForPurchase = requests.filter((r) => r.status === 'selected');

  return (
    <div className="h-full flex flex-col">
      {/* Header with stats and controls */}
      <div className="px-6 py-4 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        {/* Stats row */}
        <div className="flex gap-3 mb-4 overflow-x-auto pb-2">
          <div className="flex-shrink-0 px-4 py-2 rounded-lg bg-status-pending/10 border border-status-pending/20">
            <span className="text-xl font-bold text-status-pending">{pendingCount}</span>
            <span className="text-sm text-muted-foreground ml-2">New</span>
          </div>
          {selectedCount > 0 && (
            <div className="flex-shrink-0 px-4 py-2 rounded-lg bg-status-selected/10 border border-status-selected/20">
              <Package className="h-4 w-4 inline text-status-selected mr-1" />
              <span className="text-xl font-bold text-status-selected">{selectedCount}</span>
              <span className="text-sm text-muted-foreground ml-2">Selected</span>
            </div>
          )}
          {criticalCount > 0 && (
            <div className="flex-shrink-0 px-4 py-2 rounded-lg bg-status-critical/10 border border-status-critical/20 animate-pulse-soft">
              <AlertTriangle className="h-4 w-4 inline text-status-critical mr-1" />
              <span className="text-xl font-bold text-status-critical">{criticalCount}</span>
              <span className="text-sm text-muted-foreground ml-2">Critical</span>
            </div>
          )}
          {todayCount > 0 && (
            <div className="flex-shrink-0 px-4 py-2 rounded-lg bg-status-high/10 border border-status-high/20">
              <span className="text-xl font-bold text-status-high">{todayCount}</span>
              <span className="text-sm text-muted-foreground ml-2">Due Today</span>
            </div>
          )}
        </div>

        {/* Controls row */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Priority Mode Toggle */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50">
            <Zap className={cn("h-4 w-4", priorityMode ? "text-status-critical" : "text-muted-foreground")} />
            <Label htmlFor="priority-mode" className="text-sm font-medium cursor-pointer">
              Priority Mode
            </Label>
            <Switch
              id="priority-mode"
              checked={priorityMode}
              onCheckedChange={setPriorityMode}
            />
          </div>

          {/* Show Urgent Only Toggle */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50">
            <AlertTriangle className={cn("h-4 w-4", showUrgentOnly ? "text-status-high" : "text-muted-foreground")} />
            <Label htmlFor="urgent-only" className="text-sm font-medium cursor-pointer">
              Urgent Only
            </Label>
            <Switch
              id="urgent-only"
              checked={showUrgentOnly}
              onCheckedChange={setShowUrgentOnly}
            />
          </div>

          {/* Show Declined */}
          {declinedRequests.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeclined(!showDeclined)}
              className="text-muted-foreground"
            >
              <EyeOff className="h-4 w-4 mr-2" />
              Declined ({declinedRequests.length})
            </Button>
          )}

          {/* Bulk selection actions */}
          {selectedRequestIds.size > 0 && (
            <Button
              size="sm"
              onClick={handleAddToPurchase}
              className="bg-status-selected hover:bg-status-selected/90"
            >
              <Package className="h-4 w-4 mr-2" />
              Add {selectedRequestIds.size} to Purchase
            </Button>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-4 min-w-max">
          {KANBAN_COLUMNS.map((column) => (
            <div 
              key={column.id}
              className="w-80 flex-shrink-0"
            >
              {/* Column header */}
              <div 
                className="flex items-center justify-between mb-4 px-3 py-2 rounded-lg"
                style={{ backgroundColor: `${column.color}15` }}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: column.color }}
                  />
                  <h3 className="font-semibold text-sm">{column.label}</h3>
                </div>
                <span 
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${column.color}20`, color: column.color }}
                >
                  {getColumnRequests(column.id as Status).length}
                </span>
              </div>

              {/* Column content */}
              <div
                className="min-h-[400px] p-2 rounded-xl bg-muted/30 border-2 border-dashed border-transparent transition-colors"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add('border-primary/50', 'bg-primary/5');
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove('border-primary/50', 'bg-primary/5');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('border-primary/50', 'bg-primary/5');
                  const requestId = e.dataTransfer.getData('requestId');
                  if (requestId) {
                    handleDrop(requestId, column.id as Status);
                  }
                }}
              >
                <ScrollArea className="h-[calc(100vh-350px)]">
                  <div className="space-y-3 pr-2">
                    {getColumnRequests(column.id as Status).map((request) => (
                      <SelectableKanbanCard
                        key={request.id}
                        request={request}
                        isSelected={selectedRequestIds.has(request.id)}
                        purchaseColorIndex={purchaseColorMap.get(request.id)}
                        onSelect={column.id === 'pending' ? handleSelect : undefined}
                        onSetAvailability={column.id === 'pending' ? onSetAvailability : undefined}
                        onViewDetails={handleViewDetails}
                        onUpdateQuantity={column.id === 'selected' ? onUpdateQuantity : undefined}
                        onUpdateFulfilled={column.id === 'in_delivery' ? onUpdateFulfilledQuantity : undefined}
                        onDecline={column.id === 'pending' ? handleDecline : undefined}
                      />
                    ))}
                    {getColumnRequests(column.id as Status).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No requests
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Declined requests drawer */}
      {showDeclined && declinedRequests.length > 0 && (
        <div className="border-t bg-muted/30 p-4 max-h-48 overflow-y-auto">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Declined Requests ({declinedRequests.length})
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {declinedRequests.map((req) => (
              <div
                key={req.id}
                className="flex-shrink-0 px-4 py-2 bg-card rounded-lg border text-sm"
              >
                <span className="font-medium">{req.resourceName}</span>
                <span className="text-muted-foreground ml-2">
                  {req.quantity} {req.unit}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 h-6 text-xs"
                  onClick={() => onUpdateStatus(req.id, 'pending')}
                >
                  Restore
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating Create Purchase button */}
      {selectedForPurchase.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            size="lg"
            className="h-14 px-6 shadow-2xl bg-status-ordered hover:bg-status-ordered/90 text-white"
            onClick={() => setShowPurchasePanel(true)}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Create Purchase ({selectedForPurchase.length})
          </Button>
        </div>
      )}

      {/* Purchase Panel */}
      {showPurchasePanel && (
        <PurchasePanel
          selectedRequests={selectedForPurchase}
          onRemoveRequest={handleRemoveFromPurchase}
          onCreatePurchase={handleCreatePurchase}
          onClose={() => setShowPurchasePanel(false)}
        />
      )}

      {/* Request Details Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-md">
          {selectedRequest && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 rounded-xl bg-secondary">
                    <ResourceIcon type={selectedRequest.resourceType} className="h-6 w-6" />
                  </div>
                  <div>
                    <DialogTitle className="text-left">{selectedRequest.resourceName}</DialogTitle>
                    <DialogDescription className="text-left">
                      {selectedRequest.quantity} {selectedRequest.unit}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Priority:</span>
                  <PriorityBadge priority={selectedRequest.priority} />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Requested by</span>
                    <p className="font-medium">{selectedRequest.managerName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Project</span>
                    <p className="font-medium">{selectedRequest.projectName || 'General'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Needed by</span>
                    <p className="font-medium">
                      {new Date(selectedRequest.neededDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status</span>
                    <p className="font-medium capitalize">{selectedRequest.status.replace('_', ' ')}</p>
                  </div>
                </div>

                {selectedRequest.purchaseId && (
                  <div className="p-3 bg-status-ordered/10 rounded-lg border border-status-ordered/20">
                    <p className="text-sm font-medium text-status-ordered">
                      Purchase #{selectedRequest.purchaseId.slice(-4)}
                    </p>
                    {selectedRequest.fulfilledQuantity !== undefined && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Delivered: {selectedRequest.fulfilledQuantity} / {selectedRequest.quantity} {selectedRequest.unit}
                      </p>
                    )}
                  </div>
                )}

                {selectedRequest.notes && (
                  <div>
                    <span className="text-sm text-muted-foreground">Notes</span>
                    <p className="text-sm mt-1 p-3 bg-secondary rounded-lg">
                      {selectedRequest.notes}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  {selectedRequest.status === 'pending' && (
                    <>
                      <Button
                        className="flex-1 bg-status-selected hover:bg-status-selected/90"
                        onClick={() => {
                          onSelectForPurchase([selectedRequest.id]);
                          setSelectedRequest(null);
                          toast.success('Added to purchase');
                        }}
                      >
                        Add to Purchase
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          handleDecline(selectedRequest.id);
                          setSelectedRequest(null);
                        }}
                      >
                        Decline
                      </Button>
                    </>
                  )}
                  {selectedRequest.status === 'in_delivery' && (
                    <Button
                      className="flex-1 bg-status-delivered hover:bg-status-delivered/90"
                      onClick={() => {
                        handleComplete(selectedRequest.id);
                        setSelectedRequest(null);
                      }}
                    >
                      Mark Complete
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}