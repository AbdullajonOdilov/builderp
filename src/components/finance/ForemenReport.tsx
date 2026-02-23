import { useState, useMemo } from 'react';
import { Search, Users, Briefcase, DollarSign, Wallet, CalendarIcon, ArrowLeft, Plus, Phone } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ProjectVendorExpense } from '@/types/finance';
import { ProjectFilterRow } from './ProjectFilterRow';
import { MOCK_FOREMEN, Foreman } from '@/types/foreman';

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
  const [selectedProfession, setSelectedProfession] = useState('all');
  const [selectedForeman, setSelectedForeman] = useState('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [activeForeman, setActiveForeman] = useState<string | null>(null);

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

    if (selectedProfession !== 'all') {
      result = result.filter(f => f.profession === selectedProfession);
    }

    if (selectedForeman !== 'all') {
      result = result.filter(f => f.id === selectedForeman);
    }

    return result;
  }, [search, selectedProfession, selectedForeman, projectIds]);

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
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setActiveForeman(null)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold">{detailForeman.name}</h2>
            <p className="text-sm text-muted-foreground">{detailForeman.profession} · {detailForeman.phone}</p>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Jami ish</p>
              <p className="text-sm font-bold">{formatCurrency(scoped.totalWork)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Avanslar</p>
              <p className="text-sm font-bold text-[hsl(var(--status-pending))]">{formatCurrency(scoped.totalAdvance)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Balans</p>
              <p className="text-sm font-bold text-[hsl(var(--status-delivered))]">{formatCurrency(scoped.balance)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Vazifalar</p>
              <p className="text-sm font-bold">{scoped.taskCount}</p>
            </div>
          </div>
        </div>

        {/* Projects table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px] text-center">#</TableHead>
                  <TableHead>Loyiha</TableHead>
                  <TableHead className="text-center">Vazifalar</TableHead>
                  <TableHead className="text-right">Jami ish</TableHead>
                  <TableHead className="text-right">Avanslar</TableHead>
                  <TableHead className="text-right">Balans</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detailForeman.projects
                  .filter(p => projectIds.has(p.projectId))
                  .map((project, idx) => (
                    <TableRow key={project.projectId}>
                      <TableCell className="text-center text-muted-foreground text-xs">{idx + 1}</TableCell>
                      <TableCell className="font-medium">{project.projectName}</TableCell>
                      <TableCell className="text-center">{project.taskCount}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(project.totalWork)}</TableCell>
                      <TableCell className="text-right text-[hsl(var(--status-pending))]">{formatCurrency(project.totalAdvance)}</TableCell>
                      <TableCell className="text-right font-semibold text-[hsl(var(--status-delivered))]">{formatCurrency(project.totalWork - project.totalAdvance)}</TableCell>
                    </TableRow>
                  ))}
                <TableRow className="bg-muted/30 font-semibold hover:bg-muted/40">
                  <TableCell colSpan={3} className="text-right text-sm">Jami</TableCell>
                  <TableCell className="text-right">{formatCurrency(scoped.totalWork)}</TableCell>
                  <TableCell className="text-right text-[hsl(var(--status-pending))]">{formatCurrency(scoped.totalAdvance)}</TableCell>
                  <TableCell className="text-right text-[hsl(var(--status-delivered))]">{formatCurrency(scoped.balance)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
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
            <DollarSign className="h-4 w-4 text-[hsl(var(--status-pending))]" />
            <div>
              <p className="text-[10px] text-muted-foreground">Avanslar</p>
              <p className="text-sm font-bold text-[hsl(var(--status-pending))]">{formatCurrency(summaryTotals.totalAdvance)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-[hsl(var(--status-delivered))]" />
            <div>
              <p className="text-[10px] text-muted-foreground">Balans</p>
              <p className="text-sm font-bold text-[hsl(var(--status-delivered))]">{formatCurrency(summaryTotals.balance)}</p>
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
          <Select value={selectedForeman} onValueChange={setSelectedForeman}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Barcha birgadirlar" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barcha birgadirlar</SelectItem>
              {MOCK_FOREMEN.map(f => (
                <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Kasb</label>
          <Select value={selectedProfession} onValueChange={setSelectedProfession}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Barcha kasblar" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barcha kasblar</SelectItem>
              {professions.map(p => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Sana</label>
          <div className="flex items-center gap-1.5">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-[120px] justify-start text-left font-normal h-10", !dateFrom && "text-muted-foreground")}>
                  <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                  {dateFrom ? format(dateFrom, 'dd.MM.yy') : <span className="text-xs">Dan</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="flex gap-1 p-2 border-b">
                  <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setPresetRange(7)}>7k</Button>
                  <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setPresetRange(30)}>30k</Button>
                  <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setPresetRange(90)}>90k</Button>
                </div>
                <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
            <span className="text-muted-foreground text-xs">–</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-[120px] justify-start text-left font-normal h-10", !dateTo && "text-muted-foreground")}>
                  <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                  {dateTo ? format(dateTo, 'dd.MM.yy') : <span className="text-xs">Gacha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
            {(dateFrom || dateTo) && (
              <Button variant="ghost" size="sm" className="text-xs h-7 px-2" onClick={() => { setDateFrom(undefined); setDateTo(undefined); }}>Tozalash</Button>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">&nbsp;</label>
          <Button size="sm" className="h-10">
            <Plus className="h-4 w-4 mr-1" /> Qo'shish
          </Button>
        </div>
      </ProjectFilterRow>

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
                <TableHead className="text-right">Avanslar</TableHead>
                <TableHead className="text-right">Balans</TableHead>
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
                    <TableCell className="text-right text-[hsl(var(--status-pending))]">{formatCurrency(scoped.totalAdvance)}</TableCell>
                    <TableCell className="text-right font-semibold text-[hsl(var(--status-delivered))]">{formatCurrency(scoped.balance)}</TableCell>
                  </TableRow>
                );
              })}
              {filteredForemen.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Birgadir topilmadi</TableCell>
                </TableRow>
              )}
              {filteredForemen.length > 0 && (
                <TableRow className="bg-muted/30 font-semibold hover:bg-muted/40">
                  <TableCell colSpan={5} className="text-right text-sm">Jami</TableCell>
                  <TableCell className="text-right">{formatCurrency(summaryTotals.totalWork)}</TableCell>
                  <TableCell className="text-right text-[hsl(var(--status-pending))]">{formatCurrency(summaryTotals.totalAdvance)}</TableCell>
                  <TableCell className="text-right text-[hsl(var(--status-delivered))]">{formatCurrency(summaryTotals.balance)}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
