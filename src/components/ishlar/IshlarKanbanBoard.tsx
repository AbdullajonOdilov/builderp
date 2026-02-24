import { useState, useMemo, useCallback } from 'react';
import { Search, Filter, CalendarIcon, RotateCcw, LayoutGrid, List } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  IshlarItem, IshlarStatus, MOCK_ISHLAR, ISHLAR_PROJECTS, ISHLAR_CATEGORIES, ISHLAR_FOREMEN,
} from '@/types/ishlar';

const COLUMNS: { id: IshlarStatus; label: string; color: string }[] = [
  { id: 'created', label: 'ЯРАТИЛДИ', color: 'hsl(var(--status-pending))' },
  { id: 'in_progress', label: 'ЖАРАЁНДА', color: 'hsl(var(--status-accepted))' },
  { id: 'completed', label: 'ЯКУНЛАНДИ', color: 'hsl(var(--status-delivered))' },
  { id: 'archived', label: 'АРХИВ', color: 'hsl(var(--muted-foreground))' },
];

export function IshlarKanbanBoard() {
  const [items, setItems] = useState<IshlarItem[]>(MOCK_ISHLAR);
  const [search, setSearch] = useState('');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedForemen, setSelectedForemen] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filtered = useMemo(() => {
    let result = items;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(i => i.name.toLowerCase().includes(q));
    }
    if (selectedProjects.length > 0) {
      result = result.filter(i => selectedProjects.includes(i.projectName));
    }
    if (selectedCategories.length > 0) {
      result = result.filter(i => selectedCategories.includes(i.category));
    }
    if (selectedForemen.length > 0) {
      result = result.filter(i => selectedForemen.includes(i.foreman));
    }
    return result;
  }, [items, search, selectedProjects, selectedCategories, selectedForemen]);

  const columns = useMemo(() => {
    const map: Record<IshlarStatus, IshlarItem[]> = { created: [], in_progress: [], completed: [], archived: [] };
    filtered.forEach(i => map[i.status].push(i));
    return map;
  }, [filtered]);

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;
    const newStatus = result.destination.droppableId as IshlarStatus;
    const itemId = result.draggableId;
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, status: newStatus } : i));
  }, []);

  const clearFilters = () => {
    setSearch('');
    setSelectedProjects([]);
    setSelectedCategories([]);
    setSelectedForemen([]);
    setDateFrom('');
    setDateTo('');
  };

  const hasFilters = search || selectedProjects.length > 0 || selectedCategories.length > 0 || selectedForemen.length > 0 || dateFrom || dateTo;

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col">
      {/* Title */}
      <div className="px-6 pt-4 pb-2">
        <h1 className="text-lg font-bold">Ишлар доскаси</h1>
      </div>

      {/* Filters Row */}
      <div className="px-6 pb-3 flex items-end gap-3 flex-wrap">
        <div className="space-y-1">
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Қидириш</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Қидириш..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-[220px] h-10" />
          </div>
        </div>

        <MultiFilter label="Объектлар" selected={selectedProjects} onSelect={setSelectedProjects} options={ISHLAR_PROJECTS} width="w-[180px]" />
        <MultiFilter label="Категориялар" selected={selectedCategories} onSelect={setSelectedCategories} options={[...ISHLAR_CATEGORIES]} width="w-[160px]" />
        <MultiFilter label="Биргадирлар" selected={selectedForemen} onSelect={setSelectedForemen} options={ISHLAR_FOREMEN.map(f => f.name)} width="w-[160px]" />

        <div className="space-y-1">
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Дан</label>
          <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-[150px] h-10" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Гача</label>
          <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-[150px] h-10" />
        </div>

        {hasFilters && (
          <div className="space-y-1">
            <label className="text-[10px] font-medium text-muted-foreground">&nbsp;</label>
            <Button variant="outline" size="sm" className="h-10" onClick={clearFilters}>
              <RotateCcw className="h-3.5 w-3.5 mr-1" /> Янгилаш
            </Button>
          </div>
        )}
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-x-auto px-6 pb-4">
          <div className="flex gap-4 h-full min-w-max">
            {COLUMNS.map(col => (
              <KanbanColumn key={col.id} column={col} items={columns[col.id]} totalAll={items.filter(i => i.status === col.id).length} />
            ))}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}

/* ===== Multi-select filter ===== */
function MultiFilter({ label, selected, onSelect, options, width }: {
  label: string; selected: string[]; onSelect: (v: string[]) => void; options: string[]; width: string;
}) {
  const toggle = (v: string) => onSelect(selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v]);
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn(width, 'justify-start text-left font-normal h-10 text-sm')}>
            {selected.length === 0 ? <span className="text-muted-foreground">Барчаси</span> : `${selected.length} тан.`}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-2 z-[200]" align="start">
          {options.map(o => (
            <label key={o} className="flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded cursor-pointer text-sm">
              <Checkbox checked={selected.includes(o)} onCheckedChange={() => toggle(o)} />
              {o}
            </label>
          ))}
          {selected.length > 0 && (
            <Button variant="ghost" size="sm" className="w-full text-xs mt-1" onClick={() => onSelect([])}>Тозалаш</Button>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

/* ===== Kanban Column ===== */
function KanbanColumn({ column, items, totalAll }: {
  column: { id: IshlarStatus; label: string; color: string }; items: IshlarItem[]; totalAll: number;
}) {
  return (
    <div className="w-96 flex flex-col shrink-0">
      {/* Column header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold tracking-wider" style={{ color: column.color }}>{column.label}</span>
        <span className="text-xs font-bold" style={{ color: column.color }}>({totalAll})</span>
        <span className="text-xs text-muted-foreground">{items.length} / {totalAll}</span>
      </div>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <ScrollArea className="flex-1">
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={cn(
                'space-y-2 min-h-[200px] rounded-lg p-2 transition-colors',
                snapshot.isDraggingOver && 'bg-accent/50'
              )}
            >
              {items.map((item, idx) => (
                <Draggable key={item.id} draggableId={item.id} index={idx}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={cn(
                        'rounded-lg border bg-card p-3 shadow-sm transition-shadow',
                        snapshot.isDragging && 'shadow-lg ring-2 ring-primary/20'
                      )}
                    >
                      <KanbanCard item={item} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          </ScrollArea>
        )}
      </Droppable>
    </div>
  );
}

/* ===== Card ===== */
function KanbanCard({ item }: { item: IshlarItem }) {
  const progressColor = item.budgetPercent > 100 ? 'hsl(var(--status-rejected))' : item.budgetPercent > 50 ? 'hsl(var(--status-pending))' : 'hsl(var(--status-delivered))';

  return (
    <div className="space-y-2">
      {/* Top row: indicator + name + quantity */}
      <div className="flex items-start gap-2">
        <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: item.priorityColor }} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-tight truncate">{item.name}</p>
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">{item.totalQuantity.toLocaleString()} {item.unit}</span>
      </div>

      {/* Progress bar (for non-created items) */}
      {item.status !== 'created' && (
        <div className="space-y-0.5">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground">{item.quantity.toLocaleString()}/{item.totalQuantity.toLocaleString()} {item.unit}</span>
            <span className="font-medium">{item.progress}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${Math.min(item.progress, 100)}%`, backgroundColor: item.progress >= 100 ? 'hsl(var(--status-delivered))' : 'hsl(var(--primary))' }}
            />
          </div>
        </div>
      )}

      {/* Budget row */}
      <div className="flex items-center gap-2 text-[10px]">
        <span style={{ color: progressColor }} className="font-semibold">{item.budgetPercent}%</span>
        <span className="text-muted-foreground">— {item.budgetAmount} mln</span>
      </div>

      {/* Bottom row: date + foreman badge */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
          <CalendarIcon className="h-3 w-3" />
          {item.startDate} – {item.endDate}
        </span>
        <Badge
          variant="outline"
          className="text-[10px] px-1.5 py-0 h-5 border-0 font-medium"
          style={{ backgroundColor: item.foremanColor + '20', color: item.foremanColor }}
        >
          {item.foreman}
        </Badge>
      </div>
    </div>
  );
}
