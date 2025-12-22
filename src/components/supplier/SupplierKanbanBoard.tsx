import { useState } from 'react';
import { ResourceRequest, Status, Availability, Company, KANBAN_COLUMNS, PRIORITY_CONFIG, COMPANIES } from '@/types/request';
import { KanbanColumn } from './KanbanColumn';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Search, AlertTriangle, Zap, EyeOff, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PriorityBadge } from '../PriorityBadge';
import { ResourceIcon } from '../ResourceIcon';
import { cn } from '@/lib/utils';

interface SupplierKanbanBoardProps {
  requests: ResourceRequest[];
  onUpdateStatus: (id: string, status: Status, deliveryNotes?: string, assignedCompany?: Company) => void;
  onSetAvailability: (id: string, availability: Availability) => void;
}

export function SupplierKanbanBoard({
  requests,
  onUpdateStatus,
  onSetAvailability,
}: SupplierKanbanBoardProps) {
  const [priorityMode, setPriorityMode] = useState(false);
  const [showUrgentOnly, setShowUrgentOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<ResourceRequest | null>(null);
  const [showDeclined, setShowDeclined] = useState(false);
  const [acceptDialogRequest, setAcceptDialogRequest] = useState<ResourceRequest | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');

  const declinedRequests = requests.filter((r) => r.status === 'declined');

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
          r.managerName.toLowerCase().includes(query)
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

  // Handlers
  const handleAcceptClick = (id: string) => {
    const request = requests.find((r) => r.id === id);
    if (request) {
      setAcceptDialogRequest(request);
      setSelectedCompanyId('');
    }
  };

  const handleConfirmAccept = () => {
    if (!acceptDialogRequest) return;
    
    const company = COMPANIES.find((c) => c.id === selectedCompanyId);
    if (!company) {
      toast.error('Please select a company');
      return;
    }
    
    onUpdateStatus(acceptDialogRequest.id, 'accepted', undefined, company);
    toast.success(`Request accepted! Assigned to ${company.name}`);
    setAcceptDialogRequest(null);
    setSelectedCompanyId('');
  };

  const handleDecline = (id: string) => {
    onUpdateStatus(id, 'declined');
    toast.info('Request declined');
  };

  const handleMoveToReview = (id: string) => {
    onUpdateStatus(id, 'in_review');
    toast.info('Moved to review');
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
      pending: ['in_review', 'accepted', 'declined'],
      in_review: ['pending', 'accepted', 'declined'],
      accepted: ['in_delivery'],
      in_delivery: ['accepted', 'delivered'],
      delivered: [],
      declined: ['pending'],
    };

    if (!validTransitions[request.status].includes(newStatus)) {
      toast.error('Invalid status transition');
      return;
    }

    onUpdateStatus(requestId, newStatus);
    toast.success(`Moved to ${newStatus.replace('_', ' ')}`);
  };

  const handleViewDetails = (id: string) => {
    const request = requests.find((r) => r.id === id);
    if (request) {
      setSelectedRequest(request);
    }
  };

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
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-4 min-w-max">
          {KANBAN_COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              label={column.label}
              color={column.color}
              requests={getColumnRequests(column.id)}
              onAccept={handleAcceptClick}
              onDecline={handleDecline}
              onMoveToReview={handleMoveToReview}
              onStartDelivery={handleStartDelivery}
              onComplete={handleComplete}
              onSetAvailability={onSetAvailability}
              onViewDetails={handleViewDetails}
              onDrop={handleDrop}
            />
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
                    <span className="text-muted-foreground">Needed by</span>
                    <p className="font-medium">
                      {new Date(selectedRequest.neededDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

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
                        className="flex-1 bg-status-accepted hover:bg-status-accepted/90"
                        onClick={() => {
                          handleAcceptClick(selectedRequest.id);
                          setSelectedRequest(null);
                        }}
                      >
                        Accept Request
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
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Accept with Company Selection Dialog */}
      <Dialog open={!!acceptDialogRequest} onOpenChange={() => setAcceptDialogRequest(null)}>
        <DialogContent className="max-w-md">
          {acceptDialogRequest && (
            <>
              <DialogHeader>
                <DialogTitle>Assign to Company</DialogTitle>
                <DialogDescription>
                  Select which company will fulfill this request for {acceptDialogRequest.resourceName}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                  <ResourceIcon type={acceptDialogRequest.resourceType} className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{acceptDialogRequest.resourceName}</p>
                    <p className="text-sm text-muted-foreground">
                      {acceptDialogRequest.quantity} {acceptDialogRequest.unit}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company-select" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Select Company / Vendor
                  </Label>
                  <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                    <SelectTrigger id="company-select">
                      <SelectValue placeholder="Choose a company..." />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPANIES.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setAcceptDialogRequest(null)}>
                  Cancel
                </Button>
                <Button 
                  className="bg-status-accepted hover:bg-status-accepted/90"
                  onClick={handleConfirmAccept}
                  disabled={!selectedCompanyId}
                >
                  Accept & Assign
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}