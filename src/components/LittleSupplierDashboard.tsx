import { useState, useMemo } from 'react';
import { ResourceRequest, VENDORS, Vendor, PRIORITY_CONFIG } from '@/types/request';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Building2, X, Check, Plus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ResourceIcon } from './ResourceIcon';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const LITTLE_SUPPLIER_COLUMNS = [
  { id: 'pending', label: 'Requests', color: 'hsl(var(--status-pending))' },
  { id: 'selected', label: 'Assigned', color: 'hsl(var(--status-selected))' },
  { id: 'delivered', label: 'Done', color: 'hsl(var(--status-delivered))' },
] as const;

type ColumnId = 'pending' | 'selected' | 'delivered';

interface LittleSupplierDashboardProps {
  requests: ResourceRequest[];
  onUpdateStatus: (id: string, status: 'pending' | 'selected' | 'delivered' | 'declined') => void;
}

interface RequestCardProps {
  request: ResourceRequest;
  columnId: ColumnId;
  vendorName?: string;
  totalPrice?: number;
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
}

function RequestCard({ request, columnId, vendorName, totalPrice, onAccept, onDecline }: RequestCardProps) {
  const isDone = columnId === 'delivered';
  const isAssigned = columnId === 'selected';
  const showQuantities = isDone || isAssigned;

  return (
    <Card
      className="p-2.5 mb-2 cursor-grab hover:shadow-md transition-shadow bg-card"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('requestId', request.id);
        e.dataTransfer.setData('sourceColumn', columnId);
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <ResourceIcon type={request.resourceType} className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="font-medium text-sm truncate">{request.resourceName}</span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {showQuantities ? (
            <span className="text-xs text-muted-foreground">
              {request.fulfilledQuantity ?? request.quantity}/{request.quantity}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">{request.quantity} {request.unit}</span>
          )}
        </div>
      </div>
      {(isAssigned || isDone) && (
        <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
          {vendorName && <span className="truncate">Vendor: {vendorName}</span>}
          {totalPrice !== undefined && totalPrice > 0 && (
            <span className="font-medium text-primary">
              ${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          )}
        </div>
      )}
      {/* Status change buttons for main request */}
      {isAssigned && (
        <div className="mt-2 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-7 text-xs bg-status-delivered/10 border-status-delivered/30 text-status-delivered hover:bg-status-delivered/20"
            onClick={(e) => {
              e.stopPropagation();
              onAccept?.(request.id);
            }}
          >
            <Check className="h-3 w-3 mr-1" />
            Done
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-7 text-xs bg-destructive/10 border-destructive/30 text-destructive hover:bg-destructive/20"
            onClick={(e) => {
              e.stopPropagation();
              onDecline?.(request.id);
            }}
          >
            <X className="h-3 w-3 mr-1" />
            Reject
          </Button>
        </div>
      )}
    </Card>
  );
}

interface BuildingRowProps {
  buildingName: string;
  allRequests: ResourceRequest[];
  getColumnRequests: (columnId: ColumnId, requests: ResourceRequest[]) => ResourceRequest[];
  vendorAssignments: Record<string, string>;
  priceAssignments: Record<string, number>;
  vendors: Vendor[];
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
}

function BuildingRow({ buildingName, allRequests, getColumnRequests, vendorAssignments, priceAssignments, vendors, onAccept, onDecline }: BuildingRowProps) {
  const [isOpen, setIsOpen] = useState(true);

  const totalCount = allRequests.length;
  const pendingRequests = getColumnRequests('pending', allRequests);
  const selectedRequests = getColumnRequests('selected', allRequests);
  const deliveredRequests = getColumnRequests('delivered', allRequests);
  const rejectedRequests = allRequests.filter(r => r.status === 'declined');

  const getOverallStatus = () => {
    if (rejectedRequests.length > 0) return 'Rejected';
    if (totalCount > 0 && deliveredRequests.length === totalCount) return 'Done';
    if (selectedRequests.length > 0) return 'Assigned';
    return 'Pending';
  };

  const overallStatus = getOverallStatus();

  const statusConfig = {
    Pending: { bg: 'bg-status-pending/20', text: 'text-status-pending', border: 'border-status-pending/30' },
    Assigned: { bg: 'bg-status-selected/20', text: 'text-status-selected', border: 'border-status-selected/30' },
    Done: { bg: 'bg-status-delivered/20', text: 'text-status-delivered', border: 'border-status-delivered/30' },
    Rejected: { bg: 'bg-destructive/20', text: 'text-destructive', border: 'border-destructive/30' },
  };

  const config = statusConfig[overallStatus];

  const getVendorName = (requestId: string) => {
    const vendorId = vendorAssignments[requestId];
    if (!vendorId) return undefined;
    return vendors.find(v => v.id === vendorId)?.name;
  };

  const getTotalPrice = (requestId: string) => {
    return priceAssignments[requestId];
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-4">
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="font-medium">{buildingName}</span>
          <Badge variant="secondary" className="text-xs">
            {totalCount} requests
          </Badge>
          <Badge className={cn('text-xs ml-auto', config.bg, config.text, config.border, 'border')}>
            {overallStatus}
          </Badge>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">
        <div className="grid grid-cols-3">
          <div className="min-h-[60px] px-3 border-r-2 border-status-pending/50">
            {pendingRequests.map(request => (
              <RequestCard 
                key={request.id} 
                request={request} 
                columnId="pending"
              />
            ))}
          </div>
          <div className="min-h-[60px] px-3 border-r-2 border-status-selected/50">
            {selectedRequests.map(request => (
              <RequestCard 
                key={request.id} 
                request={request} 
                columnId="selected"
                vendorName={getVendorName(request.id)}
                totalPrice={getTotalPrice(request.id)}
                onAccept={onAccept}
                onDecline={onDecline}
              />
            ))}
          </div>
          <div className="min-h-[60px] px-3">
            {deliveredRequests.map(request => (
              <RequestCard 
                key={request.id} 
                request={request} 
                columnId="delivered"
                vendorName={getVendorName(request.id)}
                totalPrice={getTotalPrice(request.id)}
              />
            ))}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function LittleSupplierDashboard({ requests, onUpdateStatus }: LittleSupplierDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [buildingFilters, setBuildingFilters] = useState<string[]>([]);
  const [vendorAssignments, setVendorAssignments] = useState<Record<string, string>>({});
  const [priceAssignments, setPriceAssignments] = useState<Record<string, number>>({});
  const [vendors, setVendors] = useState<Vendor[]>(VENDORS);
  
  // Vendor selection dialog state
  const [showVendorDialog, setShowVendorDialog] = useState(false);
  const [pendingRequest, setPendingRequest] = useState<{ id: string; sourceColumn: string } | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<string>('');
  const [givenQuantity, setGivenQuantity] = useState<number>(0);
  const [unitPrice, setUnitPrice] = useState<number>(0);
  
  // Add vendor dialog state
  const [showAddVendorDialog, setShowAddVendorDialog] = useState(false);
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorContact, setNewVendorContact] = useState('');
  const [newVendorPhone, setNewVendorPhone] = useState('');

  // Get the current request being assigned
  const currentRequest = useMemo(() => {
    if (!pendingRequest) return null;
    return requests.find(r => r.id === pendingRequest.id);
  }, [pendingRequest, requests]);

  // Calculate total price
  const totalPrice = useMemo(() => {
    return givenQuantity * unitPrice;
  }, [givenQuantity, unitPrice]);

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'done', label: 'Done' },
  ];

  const uniqueBuildings = useMemo(() => {
    const buildings = new Set<string>();
    requests.forEach(r => buildings.add(r.projectName || 'General'));
    return Array.from(buildings).sort();
  }, [requests]);

  const toggleStatusFilter = (value: string) => {
    setStatusFilters(prev => 
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const toggleBuildingFilter = (value: string) => {
    setBuildingFilters(prev => 
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = (
          r.resourceName.toLowerCase().includes(query) ||
          r.projectName?.toLowerCase().includes(query) ||
          r.resourceType.toLowerCase().includes(query)
        );
        if (!matchesSearch) return false;
      }
      
      if (buildingFilters.length > 0) {
        const building = r.projectName || 'General';
        if (!buildingFilters.includes(building)) return false;
      }
      
      if (statusFilters.length > 0) {
        const matchesStatus = statusFilters.some(filter => {
          if (filter === 'pending') return r.status === 'pending';
          if (filter === 'assigned') return r.status === 'selected';
          if (filter === 'done') return r.status === 'delivered';
          return false;
        });
        if (!matchesStatus) return false;
      }
      
      return true;
    });
  }, [requests, searchQuery, statusFilters, buildingFilters]);

  const getColumnRequests = (columnId: ColumnId, reqs: ResourceRequest[] = filteredRequests): ResourceRequest[] => {
    return reqs.filter(r => {
      if (columnId === 'pending') return r.status === 'pending';
      if (columnId === 'selected') return r.status === 'selected';
      if (columnId === 'delivered') return r.status === 'delivered';
      return false;
    });
  };

  const allBuildings = useMemo(() => {
    const grouped = new Map<string, ResourceRequest[]>();
    filteredRequests.forEach(req => {
      const building = req.projectName || 'General';
      if (!grouped.has(building)) {
        grouped.set(building, []);
      }
      grouped.get(building)!.push(req);
    });
    return Array.from(grouped.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredRequests]);

  const getColumnRequestsForBuilding = (columnId: ColumnId, reqs: ResourceRequest[]): ResourceRequest[] => {
    return reqs.filter(r => {
      if (columnId === 'pending') return r.status === 'pending';
      if (columnId === 'selected') return r.status === 'selected';
      if (columnId === 'delivered') return r.status === 'delivered';
      return false;
    });
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const assignedCount = requests.filter(r => r.status === 'selected').length;
  const doneCount = requests.filter(r => r.status === 'delivered').length;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetColumn: ColumnId) => {
    e.preventDefault();
    const requestId = e.dataTransfer.getData('requestId');
    const sourceColumn = e.dataTransfer.getData('sourceColumn');
    
    if (!requestId || sourceColumn === targetColumn) return;
    
    // If moving from pending to selected, show vendor dialog
    if (sourceColumn === 'pending' && targetColumn === 'selected') {
      const request = requests.find(r => r.id === requestId);
      setPendingRequest({ id: requestId, sourceColumn });
      setSelectedVendor('');
      setGivenQuantity(request?.quantity || 0);
      setUnitPrice(100); // Default price
      setShowVendorDialog(true);
      return;
    }
    
    // For other moves, just update status
    if (targetColumn === 'pending') {
      onUpdateStatus(requestId, 'pending');
    } else if (targetColumn === 'delivered') {
      onUpdateStatus(requestId, 'delivered');
    }
  };

  const handleVendorConfirm = () => {
    if (!pendingRequest || !selectedVendor) return;
    
    setVendorAssignments(prev => ({
      ...prev,
      [pendingRequest.id]: selectedVendor,
    }));
    setPriceAssignments(prev => ({
      ...prev,
      [pendingRequest.id]: totalPrice,
    }));
    onUpdateStatus(pendingRequest.id, 'selected');
    setShowVendorDialog(false);
    setPendingRequest(null);
    setSelectedVendor('');
    setGivenQuantity(0);
    setUnitPrice(0);
  };

  const handleVendorCancel = () => {
    setShowVendorDialog(false);
    setPendingRequest(null);
    setSelectedVendor('');
    setGivenQuantity(0);
    setUnitPrice(0);
  };

  const handleAddVendor = () => {
    if (!newVendorName.trim()) return;
    
    const newVendor: Vendor = {
      id: `v${Date.now()}`,
      name: newVendorName.trim(),
      contact: newVendorContact.trim(),
      email: '',
      phone: newVendorPhone.trim(),
      deliveryDays: 3,
      rating: 0,
      priceLevel: 'medium',
      specialties: ['materials'],
    };
    
    setVendors(prev => [...prev, newVendor]);
    setSelectedVendor(newVendor.id);
    setNewVendorName('');
    setNewVendorContact('');
    setNewVendorPhone('');
    setShowAddVendorDialog(false);
  };

  // Handle accept (move to Done)
  const handleAccept = (id: string) => {
    onUpdateStatus(id, 'delivered');
  };

  // Handle decline
  const handleDecline = (id: string) => {
    onUpdateStatus(id, 'declined');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="flex gap-3">
            <div className="px-3 py-1.5 rounded-lg bg-status-pending/10 border border-status-pending/20">
              <span className="font-bold text-status-pending">{pendingCount}</span>
              <span className="text-xs text-muted-foreground ml-1">Pending</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-status-selected/10 border border-status-selected/20">
              <span className="font-bold text-status-selected">{assignedCount}</span>
              <span className="text-xs text-muted-foreground ml-1">Assigned</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-status-delivered/10 border border-status-delivered/20">
              <span className="font-bold text-status-delivered">{doneCount}</span>
              <span className="text-xs text-muted-foreground ml-1">Done</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-auto">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <Filter className="h-4 w-4 mr-2" />
                  Status
                  {statusFilters.length > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                      {statusFilters.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2" align="start">
                <div className="space-y-2">
                  {statusOptions.map(option => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer"
                    >
                      <Checkbox
                        checked={statusFilters.includes(option.value)}
                        onCheckedChange={() => toggleStatusFilter(option.value)}
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <Building2 className="h-4 w-4 mr-2" />
                  Building
                  {buildingFilters.length > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                      {buildingFilters.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2" align="start">
                <div className="space-y-2 max-h-60 overflow-auto">
                  {uniqueBuildings.map(building => (
                    <label
                      key={building}
                      className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer"
                    >
                      <Checkbox
                        checked={buildingFilters.includes(building)}
                        onCheckedChange={() => toggleBuildingFilter(building)}
                      />
                      <span className="text-sm truncate">{building}</span>
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search requests..." 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                className="pl-10 h-9" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-auto p-6">
        {/* Column Headers */}
        <div className="grid grid-cols-3 gap-6 mb-4 sticky top-0 bg-background z-10 pb-2">
          {LITTLE_SUPPLIER_COLUMNS.map(column => (
            <div 
              key={column.id}
              className="flex items-center justify-between px-3 py-2 rounded-lg"
              style={{ backgroundColor: `${column.color}15` }}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: column.color }}
                />
                <span className="font-semibold">{column.label}</span>
              </div>
              <Badge variant="secondary">
                {getColumnRequests(column.id).length}
              </Badge>
            </div>
          ))}
        </div>

        {/* Building Rows */}
        <div 
          className="min-h-[200px]"
          onDragOver={handleDragOver}
        >
          {allBuildings.map(([buildingName, buildingRequests]) => (
            <div 
              key={buildingName}
              onDragOver={handleDragOver}
              onDrop={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const columnWidth = rect.width / 3;
                let targetColumn: ColumnId = 'pending';
                if (x > columnWidth * 2) targetColumn = 'delivered';
                else if (x > columnWidth) targetColumn = 'selected';
                handleDrop(e, targetColumn);
              }}
            >
              <BuildingRow
                buildingName={buildingName}
                allRequests={buildingRequests}
                getColumnRequests={getColumnRequestsForBuilding}
                vendorAssignments={vendorAssignments}
                priceAssignments={priceAssignments}
                vendors={vendors}
                onAccept={handleAccept}
                onDecline={handleDecline}
              />
            </div>
          ))}
          
          {allBuildings.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No requests found
            </div>
          )}
        </div>
      </div>

      {/* Vendor Selection Dialog */}
      <Dialog open={showVendorDialog} onOpenChange={setShowVendorDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Assign to Vendor</DialogTitle>
          </DialogHeader>
          
          {currentRequest && (
            <div className="space-y-4 py-2">
              {/* Resource Info */}
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <ResourceIcon type={currentRequest.resourceType} className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{currentRequest.resourceName}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Needed: {currentRequest.quantity} {currentRequest.unit}
                </div>
              </div>

              {/* Vendor Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Vendor</label>
                <div className="flex gap-2">
                  <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Choose a vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors.map(vendor => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          <div className="flex items-center gap-2">
                            <span>{vendor.name}</span>
                            <span className="text-xs text-muted-foreground">({vendor.deliveryDays}d)</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setShowAddVendorDialog(true)}
                    title="Add new vendor"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Quantity and Price */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Given Quantity</label>
                  <Input
                    type="number"
                    value={givenQuantity}
                    onChange={(e) => setGivenQuantity(Number(e.target.value))}
                    min={0}
                    max={currentRequest.quantity}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Unit Price</label>
                  <Input
                    type="number"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    min={0}
                    step={0.01}
                  />
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                <span className="text-sm font-medium">Total Price</span>
                <span className="text-lg font-bold text-primary">
                  ${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleVendorCancel}>
              Cancel
            </Button>
            <Button onClick={handleVendorConfirm} disabled={!selectedVendor}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Vendor Dialog */}
      <Dialog open={showAddVendorDialog} onOpenChange={setShowAddVendorDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Vendor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Vendor Name <span className="text-destructive">*</span></label>
              <Input
                value={newVendorName}
                onChange={(e) => setNewVendorName(e.target.value)}
                placeholder="Enter vendor name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Contact Person</label>
              <Input
                value={newVendorContact}
                onChange={(e) => setNewVendorContact(e.target.value)}
                placeholder="Enter contact person name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input
                value={newVendorPhone}
                onChange={(e) => setNewVendorPhone(e.target.value)}
                placeholder="Enter phone number"
                type="tel"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddVendorDialog(false);
              setNewVendorName('');
              setNewVendorContact('');
              setNewVendorPhone('');
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddVendor} disabled={!newVendorName.trim()}>
              Add Vendor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}