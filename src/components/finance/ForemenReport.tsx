import { useState, useMemo } from 'react';
import { Search, Users, Briefcase, DollarSign, Wallet, CalendarIcon, ArrowLeft, Plus, Phone, Eye, Pencil, Trash2 } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ProjectVendorExpense } from '@/types/finance';
import { ProjectFilterRow } from './ProjectFilterRow';
import { MOCK_FOREMEN, Foreman, ForemanWorkItem } from '@/types/foreman';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AddForemanDialog } from './AddForemanDialog';
import { EditForemanDialog } from './EditForemanDialog';
import { DeleteForemanDialog } from './DeleteForemanDialog';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

interface Props {
  data: ProjectVendorExpense[];
  selectedProject: string;
  onSelectProject: (value: string) => void;
}

export function ForemenReport({ data, selectedProject, onSelectProject }: Props) {
  const [search, setSearch] = useState('');
  const [selectedProfessions, setSelectedProfessions] = useState<string[]>([]);
  const [selectedForemen, setSelectedForemen] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [activeForeman, setActiveForeman] = useState<string | null>(null);
  const [paymentDetailItem, setPaymentDetailItem] = useState<ForemanWorkItem | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [datePickerStep, setDatePickerStep] = useState<'from' | 'to'>('from');
  const projectIds = new Set(data.map(p => p.projectId));

  const filteredForemen = useMemo(() => {
    let result = MOCK_FOREMEN.filter(f =>
      f.projects.some(p => projectIds.has(p.projectId))
    );

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(f =>
        f.name.toLowerCase().includes(q) ||
        f.phone.toLowerCase().includes(q) ||
        f.profession.toLowerCase().includes(q)
      );
    }

    if (selectedProfessions.length > 0) {
      result = result.filter(f => selectedProfessions.includes(f.profession));
    }

    if (selectedForemen.length > 0) {
      result = result.filter(f => selectedForemen.includes(f.id));
    }

    return result;
  }, [search, selectedProfessions, selectedForemen, projectIds]);

  const professions = [...new Set(MOCK_FOREMEN.map(f => f.profession))];

  const getProjectScoped = (foreman: Foreman) => {
    const scoped = foreman.projects.filter(p => projectIds.has(p.projectId));
    const totalWork = scoped.reduce((s, p) => s + p.totalWork, 0);
    const totalAdvance = scoped.reduce((s, p) => s + p.totalAdvance, 0);
    return { totalWork, totalAdvance, balance: totalWork - totalAdvance, taskCount: scoped.reduce((s, p) => s + p.taskCount, 0) };
  };

  const summaryTotals = filteredForemen.reduce(
    (acc, f) => {
      const s = getProjectScoped(f);
      acc.totalWork += s.totalWork;
      acc.totalAdvance += s.totalAdvance;
      acc.balance += s.balance;
      return acc;
    },
    { totalWork: 0, totalAdvance: 0, balance: 0 }
  );

  const setPresetRange = (days: number) => {
    setDateTo(new Date());
    setDateFrom(subDays(new Date(), days));
  };

  // Detail view for a selected foreman
  const detailForeman = MOCK_FOREMEN.find(f => f.id === activeForeman);
  if (activeForeman && detailForeman) {
    const scoped = getProjectScoped(detailForeman);
    return (
      <div className="space-y-6">
        {/* Header with back, name, edit/delete, stats */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setActiveForeman(null)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold">{detailForeman.name}</h2>
            <p className="text-xs text-muted-foreground">{detailForeman.profession} · {detailForeman.phone}</p>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditDialogOpen(true)}><Pencil className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteDialogOpen(true)}><Trash2 className="h-3.5 w-3.5" /></Button>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">Jami ish</p>
              <p className="text-sm font-bold">{formatCurrency(scoped.totalWork)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">Olingan avanslar</p>
              <p className="text-sm font-bold text-[hsl(var(--status-delivered))]">{formatCurrency(scoped.totalAdvance)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">Qolgan pul</p>
              <p className="text-sm font-bold text-[hsl(var(--status-pending))]">{formatCurrency(scoped.balance)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">Instrumentlar narxi</p>
              <p className="text-sm font-bold">{formatCurrency(detailForeman.toolItems.reduce((s, t) => s + t.totalAmount, 0))}</p>
            </div>
          </div>
        </div>

        {/* Table 1: Ishlar (Work items) */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Ishlar ro'yxati</h3>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[32px] text-center">#</TableHead>
                    <TableHead>Obyekt</TableHead>
                    <TableHead>Ish turi nomi</TableHead>
                    <TableHead className="text-right">Jami summa</TableHead>
                    <TableHead className="text-right">Olgan summa</TableHead>
                    <TableHead className="text-right">Qolgan summa</TableHead>
                    <TableHead>Izoh</TableHead>
                    <TableHead className="w-[40px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detailForeman.workItems.map((item, idx) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-center text-muted-foreground text-xs">{idx + 1}</TableCell>
                      <TableCell className="text-xs">{item.projectName}</TableCell>
                      <TableCell className="text-xs font-medium">{item.workType}</TableCell>
                      <TableCell className="text-right text-xs font-medium">{formatCurrency(item.totalAmount)}</TableCell>
                      <TableCell className="text-right text-xs text-[hsl(var(--status-delivered))]">{formatCurrency(item.receivedAmount)}</TableCell>
                      <TableCell className="text-right text-xs font-semibold text-[hsl(var(--status-pending))]">{formatCurrency(item.remainingAmount)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{item.comment}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPaymentDetailItem(item)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {detailForeman.workItems.length === 0 && (
                    <TableRow><TableCell colSpan={8} className="text-center py-6 text-muted-foreground text-xs">Ma'lumot yo'q</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Table 2: Instrumentlar (Tool usage) */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Instrumentlar</h3>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[32px] text-center">#</TableHead>
                    <TableHead>Ish turi nomi</TableHead>
                    <TableHead>Sana</TableHead>
                    <TableHead>Instrument nomi</TableHead>
                    <TableHead className="text-right">Miqdori</TableHead>
                    <TableHead className="text-right">Narxi</TableHead>
                    <TableHead className="text-right">Umumiy summa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detailForeman.toolItems.map((item, idx) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-center text-muted-foreground text-xs">{idx + 1}</TableCell>
                      <TableCell className="text-xs font-medium">{item.workType}</TableCell>
                      <TableCell className="text-xs">{item.date}</TableCell>
                      <TableCell className="text-xs">{item.toolName}</TableCell>
                      <TableCell className="text-right text-xs">{item.quantity}</TableCell>
                      <TableCell className="text-right text-xs">{formatCurrency(item.price)}</TableCell>
                      <TableCell className="text-right text-xs font-semibold">{formatCurrency(item.totalAmount)}</TableCell>
                    </TableRow>
                  ))}
                  {detailForeman.toolItems.length === 0 && (
                    <TableRow><TableCell colSpan={7} className="text-center py-6 text-muted-foreground text-xs">Ma'lumot yo'q</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Payment detail dialog */}
        <Dialog open={!!paymentDetailItem} onOpenChange={(open) => { if (!open) setPaymentDetailItem(null); }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-sm">{paymentDetailItem?.workType} — To'lovlar</DialogTitle>
            </DialogHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Sana</TableHead>
                  <TableHead className="text-right text-xs">Pul miqdori</TableHead>
                  <TableHead className="text-xs">Izoh</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentDetailItem?.payments.map((p, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs">{p.date}</TableCell>
                    <TableCell className="text-right text-xs font-medium">{formatCurrency(p.amount)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{p.comment}</TableCell>
                  </TableRow>
                ))}
                {paymentDetailItem?.payments.length === 0 && (
                  <TableRow><TableCell colSpan={3} className="text-center py-4 text-muted-foreground text-xs">To'lov yo'q</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </DialogContent>
        </Dialog>

        <EditForemanDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          foreman={detailForeman}
          projects={data.map(p => ({ id: p.projectId, name: p.projectId }))}
        />
        <DeleteForemanDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          foreman={detailForeman}
          onConfirm={() => {
            setDeleteDialogOpen(false);
            setActiveForeman(null);
          }}
        />
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-4">
      {/* Header: Title + Stats in one row */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <div>
            <h2 className="text-lg font-semibold leading-tight">Birgadirlar hisoboti</h2>
            <p className="text-xs text-muted-foreground">Bajarilgan ishlar va avanslar</p>
          </div>
        </div>
        <div className="flex items-center gap-4 ml-auto">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-[hsl(var(--status-accepted))]" />
            <div>
              <p className="text-[10px] text-muted-foreground">Jami ish</p>
              <p className="text-sm font-bold">{formatCurrency(summaryTotals.totalWork)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-[hsl(var(--status-delivered))]" />
            <div>
              <p className="text-[10px] text-muted-foreground">Olingan avanslar</p>
              <p className="text-sm font-bold text-[hsl(var(--status-delivered))]">{formatCurrency(summaryTotals.totalAdvance)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-[hsl(var(--status-pending))]" />
            <div>
              <p className="text-[10px] text-muted-foreground">Qolgan pul</p>
              <p className="text-sm font-bold text-[hsl(var(--status-pending))]">{formatCurrency(summaryTotals.balance)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <ProjectFilterRow selectedProject={selectedProject} onSelectProject={onSelectProject}>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Search</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Ism, telefon, kasb..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 w-[200px]"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Birgadir</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[180px] justify-start text-left font-normal h-10 text-sm">
                {selectedForemen.length === 0 ? <span className="text-muted-foreground">Barcha birgadirlar</span> : `${selectedForemen.length} tanlangan`}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-2 z-[200]" align="start">
              {MOCK_FOREMEN.map(f => (
                <label key={f.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded cursor-pointer text-sm">
                  <Checkbox checked={selectedForemen.includes(f.id)} onCheckedChange={() => setSelectedForemen(prev => prev.includes(f.id) ? prev.filter(x => x !== f.id) : [...prev, f.id])} />
                  {f.name}
                </label>
              ))}
              {selectedForemen.length > 0 && (
                <Button variant="ghost" size="sm" className="w-full text-xs mt-1" onClick={() => setSelectedForemen([])}>Tozalash</Button>
              )}
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Kasb</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[160px] justify-start text-left font-normal h-10 text-sm">
                {selectedProfessions.length === 0 ? <span className="text-muted-foreground">Barcha kasblar</span> : `${selectedProfessions.length} tanlangan`}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[180px] p-2 z-[200]" align="start">
              {professions.map(p => (
                <label key={p} className="flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded cursor-pointer text-sm">
                  <Checkbox checked={selectedProfessions.includes(p)} onCheckedChange={() => setSelectedProfessions(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])} />
                  {p}
                </label>
              ))}
              {selectedProfessions.length > 0 && (
                <Button variant="ghost" size="sm" className="w-full text-xs mt-1" onClick={() => setSelectedProfessions([])}>Tozalash</Button>
              )}
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Sana</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-[220px] justify-start text-left font-normal h-10", !dateFrom && !dateTo && "text-muted-foreground")}>
                <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                {dateFrom && dateTo
                  ? `${format(dateFrom, 'dd.MM.yy')} – ${format(dateTo, 'dd.MM.yy')}`
                  : dateFrom
                    ? `${format(dateFrom, 'dd.MM.yy')} – ...`
                    : <span className="text-xs">Sanani tanlang</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="flex gap-1 p-2 border-b">
                <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setPresetRange(7)}>7k</Button>
                <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setPresetRange(30)}>30k</Button>
                <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setPresetRange(90)}>90k</Button>
                {(dateFrom || dateTo) && (
                  <Button variant="ghost" size="sm" className="text-xs h-7 ml-auto" onClick={() => { setDateFrom(undefined); setDateTo(undefined); setDatePickerStep('from'); }}>Tozalash</Button>
                )}
              </div>
              <div className="p-2 text-center text-xs text-muted-foreground border-b">
                {datePickerStep === 'from' ? 'Boshlanish sanasini tanlang' : 'Tugash sanasini tanlang'}
              </div>
              <Calendar
                mode="single"
                selected={datePickerStep === 'from' ? dateFrom : dateTo}
                onSelect={(date) => {
                  if (datePickerStep === 'from') {
                    setDateFrom(date);
                    setDatePickerStep('to');
                  } else {
                    setDateTo(date);
                    setDatePickerStep('from');
                  }
                }}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">&nbsp;</label>
          <Button size="sm" className="h-10" onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Qo'shish
          </Button>
        </div>
      </ProjectFilterRow>

      <AddForemanDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        projects={data.map(p => ({ id: p.projectId, name: p.projectId }))}
      />

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px] text-center">#</TableHead>
                <TableHead>Birgadir</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Kasb</TableHead>
                <TableHead className="text-center">Vazifalar</TableHead>
                <TableHead className="text-right">Jami ish</TableHead>
                <TableHead className="text-right">Olingan avanslar</TableHead>
                <TableHead className="text-right">Qolgan pul</TableHead>
                <TableHead>Izoh</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredForemen.map((foreman, idx) => {
                const scoped = getProjectScoped(foreman);
                return (
                  <TableRow
                    key={foreman.id}
                    className="cursor-pointer"
                    onClick={() => setActiveForeman(foreman.id)}
                  >
                    <TableCell className="text-center text-muted-foreground text-xs">{idx + 1}</TableCell>
                    <TableCell className="font-medium">{foreman.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{foreman.phone}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">{foreman.profession}</Badge>
                    </TableCell>
                    <TableCell className="text-center">{scoped.taskCount}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(scoped.totalWork)}</TableCell>
                    <TableCell className="text-right text-[hsl(var(--status-delivered))]">{formatCurrency(scoped.totalAdvance)}</TableCell>
                    <TableCell className="text-right font-semibold text-[hsl(var(--status-pending))]">{formatCurrency(scoped.balance)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{foreman.comment || '—'}</TableCell>
                  </TableRow>
                );
              })}
              {filteredForemen.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Birgadir topilmadi</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
