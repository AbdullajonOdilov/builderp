import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MonthlyWorker {
  id: number;
  fullName: string;
  role: string;
  baseSalary: number;
  monthly: Record<string, number>; // key: "YYYY-MM", value: paid amount
}

const MONTHS = [
  { key: '2025-05', label: '5-Август' },
  { key: '2025-09', label: 'Сентябр' },
  { key: '2025-10', label: 'Октябр' },
  { key: '2025-11', label: 'Ноябр' },
  { key: '2025-12', label: 'Декабр' },
  { key: '2026-01', label: 'Январ' },
  { key: '2026-02', label: 'Феврал' },
  { key: '2026-03', label: 'Март' },
];

const MOCK_WORKERS: MonthlyWorker[] = [
  { id: 1, fullName: 'Marat aka', role: 'Электрик', baseSalary: 24_000_000, monthly: { '2025-05': 15_000_000, '2025-09': 24_000_000, '2025-10': 24_000_000, '2025-11': 24_000_000, '2025-12': 24_000_000, '2026-01': 24_000_000, '2026-02': 24_000_000 } },
  { id: 2, fullName: 'Hisobchi', role: '', baseSalary: 2_000_000, monthly: { '2025-10': 2_000_000 } },
  { id: 3, fullName: 'Umarov Jasurbek', role: 'Иш бошқарувчи', baseSalary: 10_000_000, monthly: { '2025-05': 10_000_000, '2025-09': 9_000_000, '2025-10': 10_000_000, '2025-11': 10_000_000, '2025-12': 10_000_000, '2026-01': 10_000_000, '2026-02': 10_000_000 } },
  { id: 4, fullName: 'Jalolov Bobur', role: '', baseSalary: 5_000_000, monthly: { '2025-05': 5_000_000, '2025-09': 5_000_000, '2025-10': 5_000_000, '2025-11': 5_000_000, '2025-12': 5_000_000, '2026-01': 5_000_000, '2026-02': 5_000_000 } },
  { id: 5, fullName: 'Mamatqulov Diyorbek', role: '', baseSalary: 5_000_000, monthly: { '2025-05': 5_000_000, '2025-09': 5_000_000, '2025-10': 5_000_000, '2025-11': 5_000_000, '2025-12': 5_000_000, '2026-01': 5_000_000 } },
  { id: 6, fullName: 'Turdiqulov Shohruh', role: '', baseSalary: 5_000_000, monthly: { '2025-05': 5_000_000, '2025-09': 5_000_000, '2025-10': 5_000_000, '2025-11': 5_000_000, '2025-12': 5_000_000, '2026-01': 5_000_000, '2026-02': 5_000_000 } },
  { id: 7, fullName: 'Mixliboyev To\'rabek', role: 'ишчи (разний)', baseSalary: 5_000_000, monthly: { '2026-01': 5_000_000, '2026-02': 5_000_000 } },
  { id: 8, fullName: 'Xonturayev O\'tkir', role: '', baseSalary: 4_000_000, monthly: { '2025-09': 4_000_000, '2025-10': 4_000_000 } },
  { id: 9, fullName: 'G\'aniyev Husniddin', role: '', baseSalary: 4_000_000, monthly: { '2025-09': 4_000_000, '2025-10': 4_000_000 } },
  { id: 10, fullName: 'Yo\'ldoshev Ozodbek', role: '', baseSalary: 4_000_000, monthly: { '2025-09': 4_000_000, '2025-10': 4_000_000 } },
  { id: 11, fullName: 'Abduraimov Azamat', role: '', baseSalary: 4_000_000, monthly: { '2025-09': 4_000_000 } },
  { id: 12, fullName: 'Normurodov Ozodjon', role: 'Геодезист', baseSalary: 6_000_000, monthly: { '2025-11': 6_000_000, '2025-12': 6_000_000, '2026-01': 6_000_000, '2026-02': 6_000_000 } },
];

const formatCurrency = (val: number) => val.toLocaleString('uz-UZ');

export function IshchilarMonthlySalary() {
  const totals: Record<string, number> = {};
  MONTHS.forEach(m => {
    totals[m.key] = MOCK_WORKERS.reduce((sum, w) => sum + (w.monthly[m.key] || 0), 0);
  });
  const totalBase = MOCK_WORKERS.reduce((sum, w) => sum + w.baseSalary, 0);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Ойлик маошлар</h2>
      <div className="rounded-lg border bg-card">
        <ScrollArea className="h-[calc(100vh-220px)]">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-10 text-xs">№</TableHead>
                  <TableHead className="text-xs min-w-[160px]">Ф.И.О</TableHead>
                  <TableHead className="text-xs min-w-[100px]">Лавозими</TableHead>
                  <TableHead className="text-xs text-right min-w-[110px]">Асл иш ҳақи</TableHead>
                  {MONTHS.map(m => (
                    <TableHead key={m.key} className="text-xs text-right min-w-[110px]">{m.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_WORKERS.map((w, i) => (
                  <TableRow key={w.id} className="text-sm">
                    <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="font-medium text-primary text-sm">{w.fullName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{w.role || '—'}</TableCell>
                    <TableCell className="text-right text-sm font-medium">{formatCurrency(w.baseSalary)}</TableCell>
                    {MONTHS.map(m => {
                      const val = w.monthly[m.key];
                      const isPaid = val && val >= w.baseSalary;
                      const isPartial = val && val < w.baseSalary;
                      const isUnpaid = !val;
                      return (
                        <TableCell
                          key={m.key}
                          className={`text-right text-sm font-medium ${
                            isPaid ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            isPartial ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                            'text-muted-foreground'
                          }`}
                        >
                          {val ? formatCurrency(val) : '—'}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
                {/* Jami row */}
                <TableRow className="bg-muted/50 font-bold text-sm">
                  <TableCell></TableCell>
                  <TableCell>Жами:</TableCell>
                  <TableCell></TableCell>
                  <TableCell className="text-right">{formatCurrency(totalBase)}</TableCell>
                  {MONTHS.map(m => (
                    <TableCell key={m.key} className="text-right">{formatCurrency(totals[m.key])}</TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
