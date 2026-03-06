import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, EyeOff, Copy, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

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
}

const MOCK_HODIMLAR: Hodim[] = [
  { id: 1, fullName: 'Bugalter', phone: '+998 (99) 333-33-22', password: '12345678', salary: 0, berilganSumma: 5_000_000, objects: [{ name: 'Yangi sergili', color: '#8B5CF6' }], role: 'Бугалтер', roleColor: '#F59E0B', status: 'Faol', comment: 'Izoh yo\'q' },
  { id: 2, fullName: 'Sanjar', phone: '+998 (99) 444-44-44', password: '12345678', salary: 0, berilganSumma: 3_200_000, objects: [{ name: 'Yangi sergili', color: '#8B5CF6' }], role: 'Омборчи', roleColor: '#10B981', status: 'Faol', comment: 'Izoh yo\'q' },
  { id: 3, fullName: 'Nuraliyev Jahongir', phone: '+998 (99) 222-22-22', password: '12345678', salary: 0, berilganSumma: 1_500_000, objects: [{ name: 'Yangi sergili', color: '#8B5CF6' }], role: 'Прораб', roleColor: '#3B82F6', status: 'Faol', comment: 'Izoh yo\'q' },
  { id: 4, fullName: 'Taminotchi', phone: '+998 (99) 555-55-55', password: '12345678', salary: 0, berilganSumma: 8_700_000, objects: [{ name: 'Assalom Do\'stlik', color: '#8B5CF6' }], role: 'Таминотчи', roleColor: '#EF4444', status: 'Faol', comment: 'Izoh yo\'q' },
  { id: 5, fullName: 'Samandar Xudayberdiyev', phone: '+998 (99) 111-11-11', password: '12345678', salary: 0, berilganSumma: 2_000_000, objects: [{ name: 'Yangi sergili', color: '#8B5CF6' }], role: 'ПТО инжинер', roleColor: '#06B6D4', status: 'Faol', comment: 'Izoh yo\'q' },
  { id: 6, fullName: 'Abdunabi', phone: '+998 (20) 012-00-00', password: '12345678', salary: 0, berilganSumma: 4_100_000, objects: [{ name: 'Plaza', color: '#8B5CF6' }], role: 'Админ', roleColor: '#A855F7', status: 'Faol', comment: 'Izoh yo\'q' },
];

export function HodimlarReport() {
  const [search, setSearch] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState<Set<number>>(new Set());
  const [pulBerishOpen, setPulBerishOpen] = useState(false);

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatCurrency = (val: number) => val.toLocaleString('uz-UZ');

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
          <Button onClick={() => setPulBerishOpen(true)} className="h-9 gap-1.5">
            <Plus className="h-4 w-4" />
            Пул бериш
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <ScrollArea className="h-[calc(100vh-180px)]">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
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
                <TableRow key={h.id} className="text-sm">
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Пул бериш</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Ходим</Label>
              <Input placeholder="Ходимни танланг..." />
            </div>
            <div className="space-y-2">
              <Label>Сумма</Label>
              <Input type="number" placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label>Изоҳ</Label>
              <Input placeholder="Изоҳ..." />
            </div>
            <Button className="w-full">Тасдиқлаш</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
