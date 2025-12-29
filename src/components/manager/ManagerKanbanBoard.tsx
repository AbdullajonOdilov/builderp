import { useState, useMemo } from 'react';
import { ResourceRequest, PRIORITY_CONFIG } from '@/types/request';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, X, ChevronDown, ChevronRight, Check, Filter, Building2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ResourceIcon } from '../ResourceIcon';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { format } from 'date-fns';

// Manager-specific columns
const MANAGER_COLUMNS = [
  { id: 'pending', label: 'Requests', color: 'hsl(var(--status-pending))' },
  { id: 'selected', label: 'Pending', color: 'hsl(var(--status-selected))' },
  { id: 'delivered', label: 'Done', color: 'hsl(var(--status-delivered))' },
] as const;

type ManagerColumnId = 'pending' | 'selected' | 'delivered';

interface ManagerKanbanBoardProps {
  requests: ResourceRequest[];
  onAddRequest: (request: Omit<ResourceRequest, 'id' | 'createdAt' | 'status'>) => void;
  onUpdateStatus?: (id: string, status: 'pending' | 'delivered' | 'declined') => void;
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  managerName: string;
}

interface RequestCardProps {
  request: ResourceRequest;
  columnId: ManagerColumnId;
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
}

function RequestCard({ request, columnId, onAccept, onDecline }: RequestCardProps) {
  const showActions = columnId === 'selected';

  return (
    <Card
      className="p-2.5 mb-2 cursor-pointer hover:shadow-md transition-shadow bg-card"
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
          <span className="text-xs text-muted-foreground">{request.quantity} {request.unit}</span>
          {showActions && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-green-600 hover:text-green-700 hover:bg-green-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onAccept?.(request.id);
                }}
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onDecline?.(request.id);
                }}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

interface BuildingRowProps {
  buildingName: string;
  allRequests: ResourceRequest[];
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
  getColumnRequests: (columnId: ManagerColumnId, requests: ResourceRequest[]) => ResourceRequest[];
}

function BuildingRow({ buildingName, allRequests, onAccept, onDecline, getColumnRequests }: BuildingRowProps) {
  const [isOpen, setIsOpen] = useState(true);

  const totalCount = allRequests.length;
  const pendingRequests = getColumnRequests('pending', allRequests);
  const selectedRequests = getColumnRequests('selected', allRequests);
  const deliveredRequests = getColumnRequests('delivered', allRequests);
  const rejectedRequests = allRequests.filter(r => r.status === 'declined');

  // Determine overall status
  const getOverallStatus = () => {
    if (rejectedRequests.length > 0) return 'Rejected';
    if (totalCount > 0 && deliveredRequests.length === totalCount) return 'Accepted';
    if (selectedRequests.length > 0) return 'Send';
    return 'Pending';
  };

  const overallStatus = getOverallStatus();

  const statusConfig = {
    Pending: { bg: 'bg-status-pending/20', text: 'text-status-pending', border: 'border-status-pending/30' },
    Send: { bg: 'bg-status-selected/20', text: 'text-status-selected', border: 'border-status-selected/30' },
    Accepted: { bg: 'bg-status-delivered/20', text: 'text-status-delivered', border: 'border-status-delivered/30' },
    Rejected: { bg: 'bg-destructive/20', text: 'text-destructive', border: 'border-destructive/30' },
  };

  const config = statusConfig[overallStatus];

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
          {/* Requests Column */}
          <div className="min-h-[60px] px-3 border-r-2 border-status-pending/50">
            {pendingRequests.map(request => (
              <RequestCard 
                key={request.id} 
                request={request} 
                columnId="pending"
                onAccept={onAccept}
                onDecline={onDecline}
              />
            ))}
          </div>
          {/* Pending Column */}
          <div className="min-h-[60px] px-3 border-r-2 border-status-selected/50">
            {selectedRequests.map(request => (
              <RequestCard 
                key={request.id} 
                request={request} 
                columnId="selected"
                onAccept={onAccept}
                onDecline={onDecline}
              />
            ))}
          </div>
          {/* Done Column */}
          <div className="min-h-[60px] px-3">
            {deliveredRequests.map(request => (
              <RequestCard 
                key={request.id} 
                request={request} 
                columnId="delivered"
                onAccept={onAccept}
                onDecline={onDecline}
              />
            ))}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function ManagerKanbanBoard({ 
  requests, 
  onAddRequest, 
  onUpdateStatus,
  showForm, 
  setShowForm,
  managerName 
}: ManagerKanbanBoardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [buildingFilters, setBuildingFilters] = useState<string[]>([]);

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'send', label: 'Send' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
  ];

  // Get unique buildings for filter
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

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = (
          r.resourceName.toLowerCase().includes(query) ||
          r.projectName?.toLowerCase().includes(query) ||
          r.resourceType.toLowerCase().includes(query)
        );
        if (!matchesSearch) return false;
      }
      
      // Building filter (multi-select)
      if (buildingFilters.length > 0) {
        const building = r.projectName || 'General';
        if (!buildingFilters.includes(building)) return false;
      }
      
      // Status filter (multi-select)
      if (statusFilters.length > 0) {
        const matchesStatus = statusFilters.some(filter => {
          if (filter === 'pending') return r.status === 'pending';
          if (filter === 'send') return ['selected', 'ordered', 'in_delivery'].includes(r.status);
          if (filter === 'accepted') return r.status === 'delivered';
          if (filter === 'rejected') return r.status === 'declined';
          return false;
        });
        if (!matchesStatus) return false;
      }
      
      return true;
    });
  }, [requests, searchQuery, statusFilters, buildingFilters]);

  // Get requests for each column - map statuses to manager columns
  const getColumnRequests = (columnId: ManagerColumnId): ResourceRequest[] => {
    return filteredRequests.filter(r => {
      if (columnId === 'pending') {
        return r.status === 'pending';
      }
      if (columnId === 'selected') {
        // "Pending" column shows requests in progress (selected, ordered, in_delivery)
        return r.status === 'selected' || r.status === 'ordered' || r.status === 'in_delivery';
      }
      if (columnId === 'delivered') {
        return r.status === 'delivered';
      }
      return false;
    });
  };

  // Group all requests by building (across all statuses)
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

  // Get requests for a specific column from a building's requests
  const getColumnRequestsForBuilding = (columnId: ManagerColumnId, reqs: ResourceRequest[]): ResourceRequest[] => {
    return reqs.filter(r => {
      if (columnId === 'pending') {
        return r.status === 'pending';
      }
      if (columnId === 'selected') {
        return r.status === 'selected' || r.status === 'ordered' || r.status === 'in_delivery';
      }
      if (columnId === 'delivered') {
        return r.status === 'delivered';
      }
      return false;
    });
  };

  // Stats
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const sendCount = requests.filter(r => 
    r.status === 'selected' || r.status === 'ordered' || r.status === 'in_delivery'
  ).length;
  const acceptedCount = requests.filter(r => r.status === 'delivered').length;
  const rejectedCount = requests.filter(r => r.status === 'declined').length;

  // Handle accept (move to Done)
  const handleAccept = (id: string) => {
    onUpdateStatus?.(id, 'delivered');
  };

  // Handle decline
  const handleDecline = (id: string) => {
    onUpdateStatus?.(id, 'declined');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">My Requests</h1>
            <p className="text-muted-foreground">Track your resource requests</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className={cn(
              showForm && 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {showForm ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </>
            )}
          </Button>
        </div>

        {/* Stats and Search */}
        <div className="flex items-center gap-4">
          <div className="flex gap-3">
            <div className="px-3 py-1.5 rounded-lg bg-status-pending/10 border border-status-pending/20">
              <span className="font-bold text-status-pending">{pendingCount}</span>
              <span className="text-xs text-muted-foreground ml-1">Pending</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-status-selected/10 border border-status-selected/20">
              <span className="font-bold text-status-selected">{sendCount}</span>
              <span className="text-xs text-muted-foreground ml-1">Send</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-status-delivered/10 border border-status-delivered/20">
              <span className="font-bold text-status-delivered">{acceptedCount}</span>
              <span className="text-xs text-muted-foreground ml-1">Accepted</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-destructive/10 border border-destructive/20">
              <span className="font-bold text-destructive">{rejectedCount}</span>
              <span className="text-xs text-muted-foreground ml-1">Rejected</span>
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
          {MANAGER_COLUMNS.map(column => (
            <div 
              key={column.id}
              className="flex items-center justify-between px-3 py-2 rounded-lg"
              style={{ backgroundColor: `${column.color}15` }}
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
        <div className="space-y-2">
          {allBuildings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No requests
            </div>
          ) : (
            allBuildings.map(([building, reqs]) => (
              <BuildingRow
                key={building}
                buildingName={building}
                allRequests={reqs}
                onAccept={handleAccept}
                onDecline={handleDecline}
                getColumnRequests={getColumnRequestsForBuilding}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
