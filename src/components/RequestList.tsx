import { useState } from 'react';
import { ResourceRequest, Status, Priority, ResourceType } from '@/types/request';
import { RequestCard } from './RequestCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, SortDesc } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RequestListProps {
  requests: ResourceRequest[];
  role: 'manager' | 'supplier';
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
  onDeliver?: (id: string) => void;
}

const statusFilters: { value: Status | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'declined', label: 'Declined' },
];

export function RequestList({ requests, role, onAccept, onDecline, onDeliver }: RequestListProps) {
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortByPriority, setSortByPriority] = useState(true);

  const priorityOrder = { critical: 1, high: 2, medium: 3, low: 4 };

  const filteredRequests = requests
    .filter((req) => {
      if (statusFilter !== 'all' && req.status !== statusFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          req.resourceName.toLowerCase().includes(query) ||
          req.managerName.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortByPriority) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(a.neededDate).getTime() - new Date(b.neededDate).getTime();
    });

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const criticalCount = requests.filter((r) => r.priority === 'critical' && r.status === 'pending').length;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Stats for supplier */}
      {role === 'supplier' && (
        <div className="flex gap-4 mb-6">
          <div className="flex-1 p-4 rounded-lg bg-status-pending/10 border border-status-pending/20">
            <p className="text-2xl font-bold text-status-pending">{pendingCount}</p>
            <p className="text-sm text-muted-foreground">Pending Requests</p>
          </div>
          {criticalCount > 0 && (
            <div className="flex-1 p-4 rounded-lg bg-status-critical/10 border border-status-critical/20 animate-pulse-soft">
              <p className="text-2xl font-bold text-status-critical">{criticalCount}</p>
              <p className="text-sm text-muted-foreground">Critical Priority</p>
            </div>
          )}
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortByPriority(!sortByPriority)}
          className="shrink-0"
        >
          <SortDesc className="h-4 w-4 mr-2" />
          {sortByPriority ? 'By Priority' : 'By Date'}
        </Button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {statusFilters.map((filter) => (
          <Button
            key={filter.value}
            variant="ghost"
            size="sm"
            onClick={() => setStatusFilter(filter.value)}
            className={cn(
              'shrink-0',
              statusFilter === filter.value && 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            {filter.label}
            {filter.value !== 'all' && (
              <span className="ml-1.5 text-xs opacity-70">
                ({requests.filter((r) => r.status === filter.value).length})
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Request Cards */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No requests found</p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              role={role}
              onAccept={onAccept}
              onDecline={onDecline}
              onDeliver={onDeliver}
            />
          ))
        )}
      </div>
    </div>
  );
}
