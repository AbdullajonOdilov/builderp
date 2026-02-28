import React, { useState, useMemo, useCallback } from 'react';
import { Search, CalendarIcon, RotateCcw, Banknote, ChevronDown, ChevronUp, PackagePlus, XCircle } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  IshlarItem, IshlarStatus, IshlarResource, MOCK_ISHLAR, ISHLAR_PROJECTS, ISHLAR_CATEGORIES, ISHLAR_FOREMEN,
} from '@/types/ishlar';

const COLUMNS: { id: IshlarStatus; label: string; color: string }[] = [
  { id: 'created', label: 'ЯРАТИЛДИ', color: 'hsl(var(--status-pending))' },
  { id: 'in_progress', label: 'ЖАРАЁНДА', color: 'hsl(var(--status-accepted))' },
  { id: 'completed', label: 'ЯКУНЛАНДИ', color: 'hsl(var(--status-delivered))' },
  { id: 'archived', label: 'АРХИВ', color: 'hsl(var(--muted-foreground))' },
];

const VENDORS = ['Assalom Sohil', 'BarkamolStroy', 'Qurilish Markazi', 'TepaStroy'];

function formatNum(n: number | undefined | null) {
  return (n ?? 0).toLocaleString('ru-RU');
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
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [resourceRequestOpen, setResourceRequestOpen] = useState(false);

  const toggleChecked = useCallback((id: string) => {
    setCheckedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

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

  // Gather resources from checked items
  const checkedItems = useMemo(() => items.filter(i => checkedIds.has(i.id)), [items, checkedIds]);

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col">
      {/* Title */}
      <div className="px-6 pt-4 pb-2 flex items-center justify-between">
        <h1 className="text-lg font-bold">Ишлар доскаси</h1>
        {checkedIds.size > 0 && (
          <Button size="sm" className="h-9 gap-2" onClick={() => setResourceRequestOpen(true)}>
            <PackagePlus className="h-4 w-4" />
            Ресурс сўраш ({checkedIds.size})
          </Button>
        )}
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

      {/* Resource Request Dialog */}
      <ResourceRequestDialog
        open={resourceRequestOpen}
        onClose={() => setResourceRequestOpen(false)}
        checkedItems={checkedItems}
      />

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
                checkedIds={checkedIds}
                onToggleChecked={toggleChecked}
              />
            ))}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}

/* ===== Resource Request Dialog ===== */
function ResourceRequestDialog({ open, onClose, checkedItems }: {
  open: boolean; onClose: () => void; checkedItems: IshlarItem[];
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [comment, setComment] = useState('');
  const [vendor, setVendor] = useState(VENDORS[0]);
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().slice(0, 10));

  // Aggregate resources from all checked items
  const aggregatedResources = useMemo(() => {
    const map = new Map<string, IshlarResource & { planned: number; used: number }>();
    checkedItems.forEach(item => {
      item.resources.forEach(r => {
        const existing = map.get(r.name);
        if (existing) {
          existing.planned += r.planned;
          existing.used += r.used;
          existing.inStock += r.inStock;
          existing.remaining += r.remaining;
        } else {
          map.set(r.name, { ...r });
        }
      });
    });
    return Array.from(map.values());
  }, [checkedItems]);

  const [amounts, setAmounts] = useState<Record<string, number>>({});

  useMemo(() => {
    const init: Record<string, number> = {};
    aggregatedResources.forEach(r => { init[r.id] = r.remaining; });
    setAmounts(init);
  }, [aggregatedResources]);

  const setAmount = (id: string, val: number) => {
    setAmounts(prev => ({ ...prev, [id]: val }));
  };

  const zeroAll = () => {
    const zeroed: Record<string, number> = {};
    aggregatedResources.forEach(r => { zeroed[r.id] = 0; });
    setAmounts(zeroed);
  };

  const requestedResources = aggregatedResources.filter(r => (amounts[r.id] ?? r.remaining) > 0);

  // Reset step when dialog closes
  const handleClose = () => {
    setStep(1);
    setComment('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle className="text-base font-bold">Материал сўраш</DialogTitle>
            <div className="flex items-center gap-2 ml-auto mr-6">
              <div className={cn("flex items-center gap-1.5 text-xs font-medium", step === 1 ? "text-primary" : "text-muted-foreground")}>
                <span className={cn("flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold", step === 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>1</span>
                Танлаш
              </div>
              <span className="text-muted-foreground">→</span>
              <div className={cn("flex items-center gap-1.5 text-xs font-medium", step === 2 ? "text-primary" : "text-muted-foreground")}>
                <span className={cn("flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold", step === 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>2</span>
                Юбориш
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {step === 1 ? 'Ҳар бир материал учун сўралган миқдорни киритинг.' : 'Сўровни текшириб, изоҳ қўшиб юборинг.'}
          </p>
        </DialogHeader>

        {step === 1 && (
          <>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="space-y-1">
                <label className="text-xs font-medium">Манба</label>
                <Select value={vendor} onValueChange={setVendor}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VENDORS.map(v => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Кутилаётган етказиб бериш санаси</label>
                <Input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} className="h-9" />
              </div>
            </div>

            <div className="border rounded-md overflow-hidden mt-4">
              <Table>
                <TableHeader>
                  <TableRow className="h-8">
                    <TableHead className="text-[10px] px-3">Материал</TableHead>
                    <TableHead className="text-[10px] px-2">Бирлик</TableHead>
                    <TableHead className="text-[10px] px-2 text-right">Режада жами</TableHead>
                    <TableHead className="text-[10px] px-2 text-right">Ишлатилган</TableHead>
                    <TableHead className="text-[10px] px-2 text-right">Режада қолди</TableHead>
                    <TableHead className="text-[10px] px-2 text-right">Омборда мавжуд</TableHead>
                    <TableHead className="text-[10px] px-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-destructive">Сўралаётган миқдор *</span>
                        <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-destructive" title="Ҳаммасини нуллаш" onClick={zeroAll}>
                          <XCircle className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {aggregatedResources.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-xs py-4 text-muted-foreground">
                        Танланган ишларда ресурс топилмади
                      </TableCell>
                    </TableRow>
                  ) : aggregatedResources.map(r => (
                    <TableRow key={r.id} className={amounts[r.id] === 0 ? 'text-destructive' : ''}>
                      <TableCell className="px-3 py-2">
                        <p className="text-xs font-medium">{r.name}</p>
                        <p className={`text-[10px] ${amounts[r.id] === 0 ? 'text-destructive/70' : 'text-muted-foreground'}`}>{r.code}</p>
                      </TableCell>
                      <TableCell className="text-xs px-2">{r.unit}</TableCell>
                      <TableCell className="text-xs px-2 text-right">{formatNum(r.planned)}</TableCell>
                      <TableCell className="text-xs px-2 text-right">{formatNum(r.used)}</TableCell>
                      <TableCell className="text-xs px-2 text-right">{formatNum(r.planned - r.used)}</TableCell>
                      <TableCell className="text-xs px-2 text-right">{formatNum(r.inStock)}</TableCell>
                      <TableCell className="px-2 py-1">
                        <div className="flex items-center gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                            title="Нуллаш"
                            onClick={() => setAmount(r.id, amounts[r.id] === 0 ? r.remaining : 0)}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </Button>
                          <Input
                            type="text"
                            value={formatNum(amounts[r.id] ?? r.remaining)}
                            onChange={e => {
                              const num = parseInt(e.target.value.replace(/\s/g, ''), 10);
                              setAmount(r.id, isNaN(num) ? 0 : num);
                            }}
                            className={`h-8 text-xs text-right w-24 ${amounts[r.id] === 0 ? 'text-destructive' : ''}`}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={handleClose}>Бекор қилиш</Button>
              <Button onClick={() => setStep(2)} disabled={requestedResources.length === 0}>Keyingisi</Button>
            </DialogFooter>
          </>
        )}

        {step === 2 && (
          <>
            <div className="grid grid-cols-2 gap-4 mt-2 p-3 rounded-md bg-muted/50">
              <div className="space-y-0.5">
                <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Манба</label>
                <p className="text-sm font-medium">{vendor}</p>
              </div>
              <div className="space-y-0.5">
                <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Етказиб бериш санаси</label>
                <p className="text-sm font-medium">{deliveryDate}</p>
              </div>
            </div>

            <div className="border rounded-md overflow-hidden mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[10px] px-2">Ресурс номи</TableHead>
                    <TableHead className="text-[10px] px-2">Бирлик</TableHead>
                    <TableHead className="text-[10px] px-2 text-right">Режа</TableHead>
                    <TableHead className="text-[10px] px-2 text-right">Омборда</TableHead>
                    <TableHead className="text-[10px] px-2 text-right">Ишлатилган</TableHead>
                    <TableHead className="text-[10px] px-2 text-right">Қолдиқ</TableHead>
                    <TableHead className="text-[10px] px-2 text-right">Сўралаётган</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requestedResources.map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="px-2 py-1.5">
                        <p className="text-xs font-medium">{r.name}</p>
                        <p className="text-[10px] text-muted-foreground">{r.code}</p>
                      </TableCell>
                      <TableCell className="px-2 py-1.5 text-xs">{r.unit}</TableCell>
                      <TableCell className="px-2 py-1.5 text-xs text-right">{formatNum(r.planned)}</TableCell>
                      <TableCell className="px-2 py-1.5 text-xs text-right">{formatNum(r.inStock)}</TableCell>
                      <TableCell className="px-2 py-1.5 text-xs text-right">{formatNum(r.used)}</TableCell>
                      <TableCell className="px-2 py-1.5 text-xs text-right">{formatNum(r.remaining)}</TableCell>
                      <TableCell className="px-2 py-1.5 text-xs text-right font-semibold">{formatNum(amounts[r.id])}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 space-y-1">
              <label className="text-sm font-medium">Изоҳ</label>
              <Textarea
                placeholder="Сўров учун қўшимча маълумот киритинг..."
                className="min-h-[80px] resize-none text-sm"
                value={comment}
                onChange={e => setComment(e.target.value)}
              />
            </div>

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setStep(1)}>Орқага</Button>
              <Button onClick={handleClose}>Юбориш</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ===== Detail Dialog ===== */
function DetailDialog({ item, onClose }: { item: IshlarItem | null; onClose: () => void }) {
  const [coreInfoOpen, setCoreInfoOpen] = useState(true);
  const [resourcesOpen, setResourcesOpen] = useState(true);
  const [paymentsOpen, setPaymentsOpen] = useState(false);
  const [quantity, setQuantity] = useState(item?.totalQuantity ?? 0);
  const [unitPrice, setUnitPrice] = useState(item?.unitPrice ?? 0);

  // Recalc when item changes
  React.useEffect(() => { if (item) { setQuantity(item.totalQuantity); setUnitPrice(item.unitPrice); } }, [item]);

  if (!item) return null;

  const progressColor = item.budgetPercent > 100 ? 'hsl(var(--status-rejected))' : item.budgetPercent > 50 ? 'hsl(var(--status-pending))' : 'hsl(var(--status-delivered))';

  return (
    <Dialog open={!!item} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto p-0">
        {/* Header */}
        <DialogHeader className="px-4 pt-3 pb-2 border-b">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="text-[10px] bg-primary/10 text-primary border-0">{item.category}</Badge>
            <DialogTitle className="text-sm font-bold">{item.name}</DialogTitle>
            <Badge variant="outline" className="text-[10px]">({item.unit})</Badge>
          </div>
        </DialogHeader>

        <div className="px-4 py-2 space-y-1">
          {/* Core info collapsible */}
          <Collapsible open={coreInfoOpen} onOpenChange={setCoreInfoOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 px-2 w-full justify-start border-b rounded-none">
                {coreInfoOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                📋 Асосий маълумотлар
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="pt-3 space-y-4">
                {/* Row 1 */}
                <div className="grid grid-cols-4 gap-x-6 gap-y-3">
                  <Field label="Объект номи" value={item.projectName} />
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-0.5">Иш миқдори</p>
                    <Input value={formatNum(quantity)} onChange={e => setQuantity(Number(e.target.value.replace(/\s/g, '')) || 0)} className="h-7 text-xs" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-0.5">Бирлик нархи</p>
                    <Input value={formatNum(unitPrice)} onChange={e => setUnitPrice(Number(e.target.value.replace(/\s/g, '')) || 0)} className="h-7 text-xs" />
                  </div>
                  <Field label="Умумий сумма" value={`${formatNum(unitPrice * quantity)} UZS`} bold />
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-4 gap-4">
                  <Field label="Объект бўлими" value={item.sectionName} />
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-1">Биргадир</p>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5 justify-start w-full font-medium">
                          <span className="w-4 h-4 rounded-full shrink-0 inline-block" style={{ backgroundColor: item.foremanColor }} />
                          {item.foreman}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[240px] p-2 z-[200]" align="start">
                        <p className="text-xs font-semibold px-2 py-1.5 border-b mb-1">Биргадирни танланг</p>
                        {ISHLAR_FOREMEN.map(f => (
                          <div key={f.id} className={cn(
                            'flex items-center gap-2 px-2 py-2 rounded cursor-pointer text-xs hover:bg-accent',
                            item.foreman === f.name && 'bg-accent'
                          )}>
                            <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-primary-foreground shrink-0" style={{ backgroundColor: f.color }}>
                              {f.name[0]}
                            </span>
                            <span className="font-medium">{f.name}</span>
                            {item.foreman === f.name && <span className="ml-auto text-primary">✓</span>}
                          </div>
                        ))}
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-0.5">Бошланиш сана</p>
                    <Input type="date" defaultValue="2026-01-19" className="h-7 text-xs" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-0.5">Тугаш сана</p>
                    <Input type="date" defaultValue="2026-03-14" className="h-7 text-xs" />
                  </div>
                </div>

                {/* Comment + Progress in one row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-0.5">Изоҳ</p>
                    <Textarea defaultValue={item.comment} placeholder="Изоҳ ёзинг..." className="text-xs min-h-[40px] max-h-[80px] overflow-y-auto resize-none" />
                  </div>
                  <div className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Бажарилиш</p>
                      <span className="text-xs font-semibold" style={{ color: progressColor }}>{item.budgetPercent}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{
                        width: `${Math.min(item.progress, 100)}%`,
                        backgroundColor: item.progress >= 100 ? 'hsl(var(--status-delivered))' : 'hsl(var(--primary))'
                      }} />
                    </div>
                    <div className="flex flex-col gap-0.5 text-xs">
                      <span>Бажарилган миқдор: <strong>{formatNum(item.completedQuantity)} {item.unit}</strong></span>
                      <span>Режа бўйича миқдор: <strong>{formatNum(item.plannedQuantity)} {item.unit}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

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
function KanbanColumn({ column, items, totalAll, selectedId, onCardClick, checkedIds, onToggleChecked }: {
  column: { id: IshlarStatus; label: string; color: string };
  items: IshlarItem[];
  totalAll: number;
  selectedId?: string;
  onCardClick: (item: IshlarItem) => void;
  checkedIds: Set<string>;
  onToggleChecked: (id: string) => void;
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
                      className={cn(
                        'rounded-lg border bg-card p-3 shadow-sm transition-all',
                        snapshot.isDragging && 'shadow-lg ring-2 ring-primary/20',
                        selectedId === item.id && 'ring-2 ring-primary border-primary',
                        checkedIds.has(item.id) && 'border-primary/50 bg-primary/5'
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <Checkbox
                          checked={checkedIds.has(item.id)}
                          onCheckedChange={() => onToggleChecked(item.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-0.5 shrink-0"
                        />
                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onCardClick(item)}>
                          <KanbanCard item={item} />
                        </div>
                      </div>
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
