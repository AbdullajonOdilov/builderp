import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, EyeOff, Copy, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';

interface HodimPayment {
  date: string;
  amount: number;
  comment: string;
}

interface Hodim {
  id: number;
  fullName: string;
  phone: string;
  password: string;
  salary: number;
  berilganSumma: number;
  objects: { name: string; color: string }[];
  role: string;
  roleColor: string;
  status: 'Faol' | 'Nofaol';
  comment: string;
  payments: HodimPayment[];
}

const MOCK_HODIMLAR: Hodim[] = [
  { id: 1, fullName: 'Bugalter', phone: '+998 (99) 333-33-22', password: '12345678', salary: 0, berilganSumma: 5_000_000, objects: [{ name: 'Yangi sergili', color: '#8B5CF6' }], role: 'Бугалтер', roleColor: '#F59E0B', status: 'Faol', comment: 'Izoh yo\'q', payments: [
    { date: '2026-01-10', amount: 2_000_000, comment: 'Oylik avans' },
    { date: '2026-02-01', amount: 3_000_000, comment: 'Oylik to\'lov' },
  ]},
  { id: 2, fullName: 'Sanjar', phone: '+998 (99) 444-44-44', password: '12345678', salary: 0, berilganSumma: 3_200_000, objects: [{ name: 'Yangi sergili', color: '#8B5CF6' }], role: 'Омборчи', roleColor: '#10B981', status: 'Faol', comment: 'Izoh yo\'q', payments: [
    { date: '2026-01-15', amount: 1_500_000, comment: 'Avans' },
    { date: '2026-02-15', amount: 1_700_000, comment: 'Qoldiq' },
  ]},
  { id: 3, fullName: 'Nuraliyev Jahongir', phone: '+998 (99) 222-22-22', password: '12345678', salary: 0, berilganSumma: 1_500_000, objects: [{ name: 'Yangi sergili', color: '#8B5CF6' }], role: 'Прораб', roleColor: '#3B82F6', status: 'Faol', comment: 'Izoh yo\'q', payments: [
    { date: '2026-02-05', amount: 1_500_000, comment: 'Oylik' },
  ]},
  { id: 4, fullName: 'Taminotchi', phone: '+998 (99) 555-55-55', password: '12345678', salary: 0, berilganSumma: 8_700_000, objects: [{ name: 'Assalom Do\'stlik', color: '#8B5CF6' }], role: 'Таминотчи', roleColor: '#EF4444', status: 'Faol', comment: 'Izoh yo\'q', payments: [
    { date: '2026-01-03', amount: 3_000_000, comment: 'Avans' },
    { date: '2026-01-20', amount: 2_700_000, comment: 'Ikkinchi to\'lov' },
    { date: '2026-02-10', amount: 3_000_000, comment: 'Yakuniy' },
  ]},
  { id: 5, fullName: 'Samandar Xudayberdiyev', phone: '+998 (99) 111-11-11', password: '12345678', salary: 0, berilganSumma: 2_000_000, objects: [{ name: 'Yangi sergili', color: '#8B5CF6' }], role: 'ПТО инжинер', roleColor: '#06B6D4', status: 'Faol', comment: 'Izoh yo\'q', payments: [
    { date: '2026-02-01', amount: 2_000_000, comment: 'Oylik to\'lov' },
  ]},
  { id: 6, fullName: 'Abdunabi', phone: '+998 (20) 012-00-00', password: '12345678', salary: 0, berilganSumma: 4_100_000, objects: [{ name: 'Plaza', color: '#8B5CF6' }], role: 'Админ', roleColor: '#A855F7', status: 'Faol', comment: 'Izoh yo\'q', payments: [
    { date: '2026-01-08', amount: 2_100_000, comment: 'Avans' },
    { date: '2026-02-08', amount: 2_000_000, comment: 'Qoldiq' },
  ]},
];

export function HodimlarReport() {
  const [search, setSearch] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState<Set<number>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [pulBerishOpen, setPulBerishOpen] = useState(false);
  const [amounts, setAmounts] = useState<Record<number, string>>({});
  const [comments, setComments] = useState<Record<number, string>>({});

  const filtered = MOCK_HODIMLAR.filter(h =>
    h.fullName.toLowerCase().includes(search.toLowerCase()) ||
    h.phone.includes(search) ||
    h.role.toLowerCase().includes(search.toLowerCase())
  );

  const togglePassword = (id: number) => {
    setVisiblePasswords(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(h => h.id)));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatCurrency = (val: number) => val.toLocaleString('uz-UZ');

  const selectedHodimlar = MOCK_HODIMLAR.filter(h => selectedIds.has(h.id));

  const handleOpenPulBerish = () => {
    setAmounts({});
    setComments({});
    setPulBerishOpen(true);
  };

  const handleSubmitPulBerish = () => {
    setPulBerishOpen(false);
    setSelectedIds(new Set());
    setAmounts({});
    setComments({});
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Ходимлар</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Қидириш..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 h-9 text-sm"
            />
          </div>
          <Button
            onClick={handleOpenPulBerish}
            className="h-9 gap-1.5"
            disabled={selectedIds.size === 0}
          >
            <Plus className="h-4 w-4" />
            Пул бериш{selectedIds.size > 0 && ` (${selectedIds.size})`}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <ScrollArea className="h-[calc(100vh-180px)]">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-10">
                  <Checkbox
                    checked={filtered.length > 0 && selectedIds.size === filtered.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Ф.И.О</TableHead>
                <TableHead>Телефон</TableHead>
                <TableHead>Парол</TableHead>
                <TableHead className="text-right">Маош</TableHead>
                <TableHead className="text-right">Берилган сумма</TableHead>
                <TableHead>Объектлар</TableHead>
                <TableHead>Роллар</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Изоҳ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((h, i) => (
                <TableRow key={h.id} className="text-sm" data-state={selectedIds.has(h.id) ? 'selected' : undefined}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(h.id)}
                      onCheckedChange={() => toggleSelect(h.id)}
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="font-medium text-primary">{h.fullName}</TableCell>
                  <TableCell className="text-muted-foreground">{h.phone}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-mono text-muted-foreground">
                        {visiblePasswords.has(h.id) ? h.password : '••••••••'}
                      </span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(h.password)}>
                        <Copy className="h-3 w-3 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => togglePassword(h.id)}>
                        {visiblePasswords.has(h.id) ? <EyeOff className="h-3 w-3 text-muted-foreground" /> : <Eye className="h-3 w-3 text-muted-foreground" />}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{formatCurrency(h.salary)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(h.berilganSumma)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0" style={{ backgroundColor: h.objects[0]?.color + '20', color: h.objects[0]?.color }}>
                        {h.objects[0]?.name}
                      </Badge>
                      {h.objects.length > 1 && (
                        <span className="text-[10px] text-muted-foreground">+{h.objects.length - 1}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm" style={{ color: h.roleColor }}>{h.role}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                      {h.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">{h.comment}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {/* Pul berish dialog */}
      <Dialog open={pulBerishOpen} onOpenChange={setPulBerishOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Пул бериш ({selectedHodimlar.length} ходим)</DialogTitle>
          </DialogHeader>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="text-xs w-8">№</TableHead>
                  <TableHead className="text-xs">Ф.И.О</TableHead>
                  <TableHead className="text-xs">Рол</TableHead>
                  <TableHead className="text-xs text-right">Маош</TableHead>
                  <TableHead className="text-xs text-right w-[140px]">Берилаётган миқдор</TableHead>
                  <TableHead className="text-xs w-[160px]">Изоҳ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedHodimlar.map((h, idx) => (
                  <TableRow key={h.id}>
                    <TableCell className="text-xs text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell className="text-sm font-medium">{h.fullName}</TableCell>
                    <TableCell><span className="text-sm" style={{ color: h.roleColor }}>{h.role}</span></TableCell>
                    <TableCell className="text-sm text-right text-muted-foreground">{formatCurrency(h.salary)}</TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        placeholder="Миқдор"
                        className="h-8 text-sm w-[120px] ml-auto"
                        value={amounts[h.id] ?? ''}
                        onChange={(e) => setAmounts(prev => ({ ...prev, [h.id]: e.target.value }))}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="Изоҳ..."
                        className="h-8 text-sm w-[140px]"
                        value={comments[h.id] ?? ''}
                        onChange={(e) => setComments(prev => ({ ...prev, [h.id]: e.target.value }))}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPulBerishOpen(false)}>Бекор қилиш</Button>
            <Button onClick={handleSubmitPulBerish}>Пул бериш</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}