import { useState, useMemo } from 'react';
import { Search, Users, Briefcase, DollarSign, Wallet, CalendarIcon } from 'lucide-react';
import { format, subDays, isWithinInterval } from 'date-fns';
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

import { MOCK_FOREMEN, Foreman } from '@/types/foreman';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

interface Props {
  data: ProjectVendorExpense[];
}

export function ForemenReport({ data }: Props) {
  const [search, setSearch] = useState('');
  const [selectedProfession, setSelectedProfession] = useState('all');
  const [selectedForeman, setSelectedForeman] = useState('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);

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

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          Foremen Report
        </h2>
        <p className="text-sm text-muted-foreground">Work completed and advances paid to foremen</p>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Search</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Name, phone, profession..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 w-[200px]"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Foreman</label>
          <Select value={selectedForeman} onValueChange={setSelectedForeman}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="All foremen" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Foremen</SelectItem>
              {MOCK_FOREMEN.map(f => (
                <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Profession</label>
          <Select value={selectedProfession} onValueChange={setSelectedProfession}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="All professions" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Professions</SelectItem>
              {professions.map(p => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Date Range</label>
          <div className="flex items-center gap-1.5">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-[130px] justify-start text-left font-normal h-10", !dateFrom && "text-muted-foreground")}>
                  <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                  {dateFrom ? format(dateFrom, 'MMM dd, yy') : <span className="text-xs">From</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="flex gap-1 p-2 border-b">
                  <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setPresetRange(7)}>7d</Button>
                  <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setPresetRange(30)}>30d</Button>
                  <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setPresetRange(90)}>90d</Button>
                </div>
                <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
            <span className="text-muted-foreground text-xs">–</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-[130px] justify-start text-left font-normal h-10", !dateTo && "text-muted-foreground")}>
                  <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                  {dateTo ? format(dateTo, 'MMM dd, yy') : <span className="text-xs">To</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
            {(dateFrom || dateTo) && (
              <Button variant="ghost" size="sm" className="text-xs h-7 px-2" onClick={() => { setDateFrom(undefined); setDateTo(undefined); }}>Clear</Button>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Foremen</p>
              <p className="text-2xl font-bold">{filteredForemen.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[hsl(var(--status-accepted)/0.1)]">
              <Briefcase className="h-5 w-5 text-[hsl(var(--status-accepted))]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Work</p>
              <p className="text-2xl font-bold">{formatCurrency(summaryTotals.totalWork)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[hsl(var(--status-pending)/0.3)]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[hsl(var(--status-pending)/0.1)]">
              <DollarSign className="h-5 w-5 text-[hsl(var(--status-pending))]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Advances</p>
              <p className="text-2xl font-bold text-[hsl(var(--status-pending))]">{formatCurrency(summaryTotals.totalAdvance)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[hsl(var(--status-delivered)/0.1)]">
              <Wallet className="h-5 w-5 text-[hsl(var(--status-delivered))]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Balance</p>
              <p className="text-2xl font-bold text-[hsl(var(--status-delivered))]">{formatCurrency(summaryTotals.balance)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px] text-center">#</TableHead>
                <TableHead>Foreman</TableHead>
                <TableHead>Profession</TableHead>
                <TableHead className="text-center">Tasks</TableHead>
                <TableHead className="text-right">Total Work</TableHead>
                <TableHead className="text-right">Advances</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredForemen.map((foreman, idx) => {
                const scoped = getProjectScoped(foreman);
                return (
                  <TableRow key={foreman.id}>
                    <TableCell className="text-center text-muted-foreground text-xs">{idx + 1}</TableCell>
                    <TableCell>
                      <div className="font-medium">{foreman.name}</div>
                      <div className="text-xs text-muted-foreground">{foreman.phone}</div>
                    </TableCell>
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
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No foremen found</TableCell>
                </TableRow>
              )}
              {filteredForemen.length > 0 && (
                <TableRow className="bg-muted/30 font-semibold hover:bg-muted/40">
                  <TableCell colSpan={4} className="text-right text-sm">Totals</TableCell>
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
