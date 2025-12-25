import { useState } from 'react';
import { ResourceRequest, Availability } from '@/types/request';
import { SelectableKanbanCard } from './SelectableKanbanCard';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Building2, ChevronDown, Calendar, GripVertical } from 'lucide-react';
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
  onDragStart?: (count: number, type: 'building' | 'selected' | 'single', buildingName: string) => void;
  onDragEnd?: () => void;
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
  onDragStart,
  onDragEnd,
}: BuildingGroupProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const isPending = columnId === 'pending';
  const isSelected = columnId === 'selected';
  const allSelected = requests.every(r => selectedRequestIds.has(r.id));
  const someSelected = requests.some(r => selectedRequestIds.has(r.id)) && !allSelected;

  // Get selected requests within this building
  const selectedInBuilding = requests.filter(r => selectedRequestIds.has(r.id));
  const hasSelectedInBuilding = selectedInBuilding.length > 0;

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

  // Handle building header drag - moves ALL requests in building
  const handleBuildingDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    
    const allIds = requests.map(r => r.id);
    e.dataTransfer.setData('requestIds', JSON.stringify(allIds));
    e.dataTransfer.setData('dragType', 'building');
    e.dataTransfer.setData('buildingName', buildingName);
    e.dataTransfer.setData('requestCount', String(allIds.length));
    e.dataTransfer.effectAllowed = 'move';
    
    // Notify parent for overlay
    onDragStart?.(allIds.length, 'building', buildingName);
  };

  const handleBuildingDragEnd = () => {
    setIsDragging(false);
    onDragEnd?.();
  };

  // Handle individual card drag - moves selected OR just the one card
  const handleCardDragStart = (e: React.DragEvent, requestId: string) => {
    e.stopPropagation();
    
    // If dragging a selected card and there are other selections in this building, move all selected in building
    if (selectedRequestIds.has(requestId) && selectedInBuilding.length > 1) {
      const selectedIds = selectedInBuilding.map(r => r.id);
      e.dataTransfer.setData('requestIds', JSON.stringify(selectedIds));
      e.dataTransfer.setData('dragType', 'selected');
      e.dataTransfer.setData('requestCount', String(selectedIds.length));
      e.dataTransfer.effectAllowed = 'move';
      
      // Notify parent for overlay
      onDragStart?.(selectedIds.length, 'selected', buildingName);
    } else {
      // Otherwise just move the single card
      e.dataTransfer.setData('requestIds', JSON.stringify([requestId]));
      e.dataTransfer.setData('dragType', 'single');
      e.dataTransfer.setData('requestCount', '1');
      e.dataTransfer.effectAllowed = 'move';
      
      // Notify parent for overlay
      onDragStart?.(1, 'single', buildingName);
    }
    e.dataTransfer.setData('buildingName', buildingName);
  };

  const handleCardDragEnd = () => {
    onDragEnd?.();
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className={cn('mb-3', isDragging && 'opacity-50')}>
        {/* Building Group Header - Draggable */}
        <div
          className={cn(
            'flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors',
            'bg-secondary/50 hover:bg-secondary/70',
            isOpen && 'rounded-b-none',
            (isPending || isSelected) && 'cursor-grab active:cursor-grabbing'
          )}
          draggable={isPending || isSelected}
          onDragStart={handleBuildingDragStart}
          onDragEnd={handleBuildingDragEnd}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Drag handle indicator */}
            {(isPending || isSelected) && (
              <GripVertical className="h-4 w-4 text-muted-foreground/50 shrink-0" />
            )}
            
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
            
            <CollapsibleTrigger asChild>
              <div className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="font-medium text-sm truncate">{buildingName}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  ({requests.length})
                </span>
              </div>
            </CollapsibleTrigger>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            {earliestDate && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {formatDate(earliestDate)}
              </span>
            )}
            <CollapsibleTrigger asChild>
              <button onClick={(e) => e.stopPropagation()} className="p-0.5 hover:bg-secondary/50 rounded">
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-muted-foreground transition-transform',
                    isOpen && 'rotate-180'
                  )}
                />
              </button>
            </CollapsibleTrigger>
          </div>
        </div>

        {/* Building Group Content */}
        <CollapsibleContent>
          <div className={cn(
            'space-y-2 p-2 rounded-b-lg',
            'bg-secondary/30 border-x border-b border-secondary/50'
          )}>
            {requests.map(request => (
              <div
                key={request.id}
                draggable={isPending || isSelected}
                onDragStart={(e) => handleCardDragStart(e, request.id)}
                onDragEnd={handleCardDragEnd}
                className={cn(
                  (isPending || isSelected) && 'cursor-grab active:cursor-grabbing',
                  selectedRequestIds.has(request.id) && hasSelectedInBuilding && selectedInBuilding.length > 1 && 'ring-2 ring-primary/50 rounded-xl'
                )}
              >
                <SelectableKanbanCard
                  request={request}
                  isSelected={selectedRequestIds.has(request.id)}
                  purchaseColorIndex={purchaseColorMap.get(request.id)}
                  onSelect={isPending ? onSelect : undefined}
                  onSetAvailability={isPending ? onSetAvailability : undefined}
                  onViewDetails={onViewDetails}
                  onUpdateQuantity={columnId === 'selected' ? onUpdateQuantity : undefined}
                  onDecline={isPending ? onDecline : undefined}
                />
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
