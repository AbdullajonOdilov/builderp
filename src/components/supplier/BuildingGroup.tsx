import { useState } from 'react';
import { ResourceRequest, Availability } from '@/types/request';
import { SelectableKanbanCard } from './SelectableKanbanCard';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Building2, ChevronDown, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BuildingGroupProps {
  buildingName: string;
  requests: ResourceRequest[];
  selectedRequestIds: Set<string>;
  purchaseColorMap: Map<string, number>;
  onSelect: (id: string, selected: boolean) => void;
  onSelectAll: (ids: string[], selected: boolean) => void;
  onSetAvailability?: (id: string, availability: Availability) => void;
  onViewDetails: (id: string) => void;
  onUpdateQuantity?: (id: string, quantity: number) => void;
  onDecline?: (id: string) => void;
  columnId: string;
}

export function BuildingGroup({
  buildingName,
  requests,
  selectedRequestIds,
  purchaseColorMap,
  onSelect,
  onSelectAll,
  onSetAvailability,
  onViewDetails,
  onUpdateQuantity,
  onDecline,
  columnId,
}: BuildingGroupProps) {
  const [isOpen, setIsOpen] = useState(true);

  const isPending = columnId === 'pending';
  const allSelected = requests.every(r => selectedRequestIds.has(r.id));
  const someSelected = requests.some(r => selectedRequestIds.has(r.id)) && !allSelected;

  // Get earliest needed date
  const earliestDate = requests.reduce((earliest, r) => {
    const date = new Date(r.neededDate);
    return earliest && earliest < date ? earliest : date;
  }, null as Date | null);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleSelectAll = () => {
    const ids = requests.map(r => r.id);
    onSelectAll(ids, !allSelected);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="mb-3">
        {/* Building Group Header */}
        <CollapsibleTrigger asChild>
          <div
            className={cn(
              'flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors',
              'bg-secondary/50 hover:bg-secondary/70',
              isOpen && 'rounded-b-none'
            )}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {isPending && (
                <Checkbox
                  checked={allSelected}
                  className={cn(
                    "h-4 w-4 shrink-0",
                    someSelected && "data-[state=unchecked]:bg-primary/30"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectAll();
                  }}
                  onCheckedChange={() => {}}
                />
              )}
              <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="font-medium text-sm truncate">{buildingName}</span>
              <span className="text-xs text-muted-foreground shrink-0">
                ({requests.length})
              </span>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              {earliestDate && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDate(earliestDate)}
                </span>
              )}
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-muted-foreground transition-transform',
                  isOpen && 'rotate-180'
                )}
              />
            </div>
          </div>
        </CollapsibleTrigger>

        {/* Building Group Content */}
        <CollapsibleContent>
          <div className={cn(
            'space-y-2 p-2 rounded-b-lg',
            'bg-secondary/30 border-x border-b border-secondary/50'
          )}>
            {requests.map(request => (
              <SelectableKanbanCard
                key={request.id}
                request={request}
                isSelected={selectedRequestIds.has(request.id)}
                purchaseColorIndex={purchaseColorMap.get(request.id)}
                onSelect={isPending ? onSelect : undefined}
                onSetAvailability={isPending ? onSetAvailability : undefined}
                onViewDetails={onViewDetails}
                onUpdateQuantity={columnId === 'selected' ? onUpdateQuantity : undefined}
                onDecline={isPending ? onDecline : undefined}
              />
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
