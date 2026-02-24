import { useState, useMemo, useCallback } from 'react';
import { Search, CalendarIcon, RotateCcw, Banknote, ChevronDown, ChevronUp } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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

function formatNum(n: number) {
  return n.toLocaleString('ru-RU');
}

export function IshlarKanbanBoard() {
  const [items, setItems] = useState<IshlarItem[]>(MOCK_ISHLAR);
  const [search, setSearch] = useState('');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedForemen, setSelectedForemen] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedItem, setSelectedItem] = useState<IshlarItem | null>(null);

  const filtered = useMemo(() => {
    let result = items;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(i => i.name.toLowerCase().includes(q));
    }
    if (selectedProjects.length > 0) result = result.filter(i => selectedProjects.includes(i.projectName));
    if (selectedCategories.length > 0) result = result.filter(i => selectedCategories.includes(i.category));
    if (selectedForemen.length > 0) result = result.filter(i => selectedForemen.includes(i.foreman));
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
    setSearch(''); setSelectedProjects([]); setSelectedCategories([]); setSelectedForemen([]); setDateFrom(''); setDateTo('');
  };

  const hasFilters = search || selectedProjects.length > 0 || selectedCategories.length > 0 || selectedForemen.length > 0 || dateFrom || dateTo;

  const handleCardClick = (item: IshlarItem) => {
    setSelectedItem(prev => prev?.id === item.id ? null : item);
  };

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

      {/* Detail Dialog */}
      <DetailDialog item={selectedItem} onClose={() => setSelectedItem(null)} />

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-x-auto px-6 pb-4">
          <div className="flex gap-4 h-full min-w-max">
            {COLUMNS.map(col => (
              <KanbanColumn
                key={col.id}
                column={col}
                items={columns[col.id]}
                totalAll={items.filter(i => i.status === col.id).length}
                selectedId={selectedItem?.id}
                onCardClick={handleCardClick}
              />
            ))}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}

/* ===== Detail Dialog ===== */
function DetailDialog({ item, onClose }: { item: IshlarItem | null; onClose: () => void }) {
  const [resourcesOpen, setResourcesOpen] = useState(true);
  const [paymentsOpen, setPaymentsOpen] = useState(false);

  if (!item) return null;

  const progressColor = item.budgetPercent > 100 ? 'hsl(var(--status-rejected))' : item.budgetPercent > 50 ? 'hsl(var(--status-pending))' : 'hsl(var(--status-delivered))';

  return (
    <Dialog open={!!item} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto p-0">
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-3 border-b">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="text-[10px] bg-primary/10 text-primary border-0">{item.category}</Badge>
            <DialogTitle className="text-sm font-bold">{item.name}</DialogTitle>
            <Badge variant="outline" className="text-[10px]">({item.unit})</Badge>
            <Button variant="default" size="sm" className="h-7 text-xs ml-2 bg-[hsl(var(--status-delivered))] hover:bg-[hsl(var(--status-delivered))]/90">
              <Banknote className="h-3 w-3 mr-1" /> Пул бериш
            </Button>
          </div>
        </DialogHeader>

        <div className="px-5 py-4 space-y-4">
          {/* Details grid */}
          <div className="grid grid-cols-3 gap-x-6 gap-y-3">
            <Field label="Объект номи" value={item.projectName} />
            <Field label="Объект бўлими" value={item.sectionName} />
            <Field label="Иш категорияси" value={item.category} />
            <Field label="Бирлик нархи" value={formatNum(item.unitPrice)} />
            <div className="col-span-2">
              <Field label="Умумий сумма" value={`${formatNum(item.totalPrice)} UZS`} bold />
            </div>
          </div>

          {/* Foreman + dates + quantity */}
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-[10px] text-muted-foreground mb-1">Биргадир</p>
              <Badge variant="outline" className="text-xs px-2 py-0.5 border-0 font-medium"
                style={{ backgroundColor: item.foremanColor + '20', color: item.foremanColor }}>{item.foreman}</Badge>
            </div>
            <Field label="Бошланиш сана" value={item.startDate} />
            <Field label="Тугаш сана" value={item.endDate} />
            <div>
              <p className="text-[10px] text-muted-foreground mb-0.5">Иш миқдори</p>
              <Input defaultValue={formatNum(item.totalQuantity)} className="h-7 text-xs w-24" />
            </div>
          </div>

          {/* Progress */}
          <div className="border rounded-lg p-3 space-y-2">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Бажарилиш</p>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{
                width: `${Math.min(item.progress, 100)}%`,
                backgroundColor: item.progress >= 100 ? 'hsl(var(--status-delivered))' : 'hsl(var(--primary))'
              }} />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>Бажарилган фоиз: <strong style={{ color: progressColor }}>{item.budgetPercent}%</strong></span>
              <span>Бажарилган миқдор: <strong>{formatNum(item.completedQuantity)} {item.unit}</strong></span>
              <span>Режа бўйича миқдор: <strong>{formatNum(item.plannedQuantity)} {item.unit}</strong></span>
            </div>
          </div>

          {/* Comment */}
          {item.comment && (
            <div>
              <p className="text-[10px] text-muted-foreground mb-1">Изоҳ</p>
              <p className="text-xs border rounded-md px-3 py-2 bg-muted/30">{item.comment}</p>
            </div>
          )}

          {/* Resources collapsible */}
          <Collapsible open={resourcesOpen} onOpenChange={setResourcesOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 px-2 w-full justify-start border-b rounded-none">
                {resourcesOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                ⚙ Ресурслар ({item.resources.length})
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="border rounded-md overflow-hidden mt-1">
                <Table>
                  <TableHeader>
                    <TableRow className="h-7">
                      <TableHead className="text-[10px] px-2">Номи</TableHead>
                      <TableHead className="text-[10px] px-2">Код</TableHead>
                      <TableHead className="text-[10px] px-2">Бирлик</TableHead>
                      <TableHead className="text-[10px] px-2 text-right">Омборда</TableHead>
                      <TableHead className="text-[10px] px-2 text-right">Режада</TableHead>
                      <TableHead className="text-[10px] px-2 text-right">Ишлатилган</TableHead>
                      <TableHead className="text-[10px] px-2 text-right">Қолган</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {item.resources.map(r => (
                      <TableRow key={r.id} className="h-7">
                        <TableCell className="text-xs px-2 py-1">{r.name}</TableCell>
                        <TableCell className="text-xs px-2 py-1 text-muted-foreground">{r.code}</TableCell>
                        <TableCell className="text-xs px-2 py-1">{r.unit}</TableCell>
                        <TableCell className="text-xs px-2 py-1 text-right">{formatNum(r.inStock)}</TableCell>
                        <TableCell className="text-xs px-2 py-1 text-right">{formatNum(r.planned)}</TableCell>
                        <TableCell className="text-xs px-2 py-1 text-right">{formatNum(r.used)}</TableCell>
                        <TableCell className="text-xs px-2 py-1 text-right font-medium">{formatNum(r.remaining)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Payments collapsible */}
          <Collapsible open={paymentsOpen} onOpenChange={setPaymentsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 px-2 w-full justify-start border-b rounded-none">
                {paymentsOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                💰 Олинган аванслар: <span className="text-[hsl(var(--status-delivered))] font-semibold ml-1">{formatNum(item.advanceReceived)} сўм</span>
                <span className="ml-3">Қолган сумма: <span className="text-[hsl(var(--status-pending))] font-semibold">{formatNum(item.remainingPayment)} сўм</span></span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="border rounded-md overflow-hidden mt-1">
                <Table>
                  <TableHeader>
                    <TableRow className="h-7">
                      <TableHead className="text-[10px] px-2">Берилган сана</TableHead>
                      <TableHead className="text-[10px] px-2 text-right">Пул миқдори (UZS)</TableHead>
                      <TableHead className="text-[10px] px-2">Изоҳ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {item.payments.length === 0 ? (
                      <TableRow><TableCell colSpan={3} className="text-center text-xs py-2 text-muted-foreground">Тўлов йўқ</TableCell></TableRow>
                    ) : item.payments.map((p, i) => (
                      <TableRow key={i} className="h-7">
                        <TableCell className="text-xs px-2 py-1">{p.date}</TableCell>
                        <TableCell className="text-xs px-2 py-1 text-right font-medium">{formatNum(p.amount)}</TableCell>
                        <TableCell className="text-xs px-2 py-1 text-muted-foreground">{p.comment || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ===== Field helper ===== */
function Field({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground mb-0.5">{label}</p>
      <p className={cn('text-xs', bold ? 'font-bold' : 'font-medium')}>{value}</p>
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
function KanbanColumn({ column, items, totalAll, selectedId, onCardClick }: {
  column: { id: IshlarStatus; label: string; color: string };
  items: IshlarItem[];
  totalAll: number;
  selectedId?: string;
  onCardClick: (item: IshlarItem) => void;
}) {
  return (
    <div className="w-96 flex flex-col shrink-0">
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
              className={cn('space-y-2 min-h-[200px] rounded-lg p-2 transition-colors', snapshot.isDraggingOver && 'bg-accent/50')}
            >
              {items.map((item, idx) => (
                <Draggable key={item.id} draggableId={item.id} index={idx}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      onClick={() => onCardClick(item)}
                      className={cn(
                        'rounded-lg border bg-card p-3 shadow-sm transition-all cursor-pointer',
                        snapshot.isDragging && 'shadow-lg ring-2 ring-primary/20',
                        selectedId === item.id && 'ring-2 ring-primary border-primary'
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
      <div className="flex items-start gap-2">
        <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: item.priorityColor }} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-tight truncate">{item.name}</p>
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">{item.totalQuantity.toLocaleString()} {item.unit}</span>
      </div>
      <div className="flex items-center gap-2 text-[10px]">
        <span style={{ color: progressColor }} className="font-semibold">{item.budgetPercent}%</span>
        <span className="text-muted-foreground">— {item.budgetAmount} mln</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
          <CalendarIcon className="h-3 w-3" />
          {item.startDate} – {item.endDate}
        </span>
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-0 font-medium"
          style={{ backgroundColor: item.foremanColor + '20', color: item.foremanColor }}>{item.foreman}</Badge>
      </div>
    </div>
  );
}
