import { useState, useMemo } from 'react';
import { ResourceRequest, PRIORITY_CONFIG } from '@/types/request';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, X, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { PriorityBadge } from '../PriorityBadge';
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
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  managerName: string;
}

interface RequestCardProps {
  request: ResourceRequest;
  columnId: ManagerColumnId;
}

function RequestCard({ request, columnId }: RequestCardProps) {
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
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-muted-foreground">{request.quantity} {request.unit}</span>
          <PriorityBadge priority={request.priority} size="sm" />
        </div>
      </div>
    </Card>
  );
}

interface BuildingGroupProps {
  buildingName: string;
  requests: ResourceRequest[];
  columnId: ManagerColumnId;
}

function BuildingGroup({ buildingName, requests, columnId }: BuildingGroupProps) {
  const [isOpen, setIsOpen] = useState(true);

  // Get the earliest needed date from requests in this group
  const earliestDate = useMemo(() => {
    if (requests.length === 0) return null;
    const dates = requests.map(r => new Date(r.neededDate));
    return dates.reduce((min, date) => date < min ? date : min, dates[0]);
  }, [requests]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-3">
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-muted/50 hover:bg-muted transition-colors">
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="font-medium text-sm">{buildingName}</span>
          {earliestDate && (
            <span className="text-xs text-muted-foreground">
              {format(earliestDate, 'MMM d')}
            </span>
          )}
          <Badge variant="secondary" className="ml-auto text-xs">
            {requests.length}
          </Badge>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 pl-2">
        {requests.map(request => (
          <RequestCard key={request.id} request={request} columnId={columnId} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

export function ManagerKanbanBoard({ 
  requests, 
  onAddRequest, 
  showForm, 
  setShowForm,
  managerName 
}: ManagerKanbanBoardProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          r.resourceName.toLowerCase().includes(query) ||
          r.projectName?.toLowerCase().includes(query) ||
          r.resourceType.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [requests, searchQuery]);

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

  // Group requests by building
  const groupByBuilding = (reqs: ResourceRequest[]) => {
    const grouped = new Map<string, ResourceRequest[]>();
    reqs.forEach(req => {
      const building = req.projectName || 'General';
      if (!grouped.has(building)) {
        grouped.set(building, []);
      }
      grouped.get(building)!.push(req);
    });
    return Array.from(grouped.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  };

  // Stats
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const inProgressCount = requests.filter(r => 
    r.status === 'selected' || r.status === 'ordered' || r.status === 'in_delivery'
  ).length;
  const doneCount = requests.filter(r => r.status === 'delivered').length;

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
              <span className="text-xs text-muted-foreground ml-1">New</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-status-selected/10 border border-status-selected/20">
              <span className="font-bold text-status-selected">{inProgressCount}</span>
              <span className="text-xs text-muted-foreground ml-1">In Progress</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-status-delivered/10 border border-status-delivered/20">
              <span className="font-bold text-status-delivered">{doneCount}</span>
              <span className="text-xs text-muted-foreground ml-1">Done</span>
            </div>
          </div>
          
          <div className="relative flex-1 max-w-xs ml-auto">
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

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-6 h-full min-w-max">
          {MANAGER_COLUMNS.map(column => {
            const columnRequests = getColumnRequests(column.id);
            const groupedRequests = groupByBuilding(columnRequests);

            return (
              <div 
                key={column.id} 
                className="w-80 flex-shrink-0"
                onDragOver={(e) => e.preventDefault()}
              >
                {/* Column Header */}
                <div 
                  className="flex items-center justify-between mb-4 px-3 py-2 rounded-lg"
                  style={{ backgroundColor: `${column.color}15` }}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: column.color }}
                    />
                    <span className="font-semibold">{column.label}</span>
                  </div>
                  <Badge variant="secondary">{columnRequests.length}</Badge>
                </div>

                {/* Column Content */}
                <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-2">
                  {groupedRequests.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No requests
                    </div>
                  ) : (
                    groupedRequests.map(([building, reqs]) => (
                      <BuildingGroup
                        key={building}
                        buildingName={building}
                        requests={reqs}
                        columnId={column.id}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
