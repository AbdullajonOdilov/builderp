import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpDown, Info } from 'lucide-react';

type Currency = 'UZS' | 'USD' | 'BANK';

interface ProjectBalance {
  projectId: string;
  projectName: string;
  balances: Record<Currency, number>;
}

const MOCK_PROJECT_BALANCES: ProjectBalance[] = [
  { projectId: 'p1', projectName: 'Sunrise Tower - Block A', balances: { UZS: 120_000_000, USD: 4_000, BANK: 80_000 } },
  { projectId: 'p2', projectName: 'Green Valley Residences', balances: { UZS: 85_000_000, USD: 2_500, BANK: 45_000 } },
  { projectId: 'p3', projectName: 'Metro Business Park', balances: { UZS: 200_000_000, USD: 8_000, BANK: 120_000 } },
  { projectId: 'p4', projectName: 'Harbor Bridge Renovation', balances: { UZS: 50_000_000, USD: 1_200, BANK: 30_000 } },
];

function fmt(amount: number) {
  return new Intl.NumberFormat('uz-UZ').format(amount);
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CurrencyConversionDialog({ open, onClose }: Props) {
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [exchangeRate, setExchangeRate] = useState('12500');
  const [fromCurrency, setFromCurrency] = useState<Currency>('BANK');
  const [toCurrency, setToCurrency] = useState<Currency>('UZS');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');

  const rate = parseFloat(exchangeRate) || 0;
  const from = parseFloat(fromAmount.replace(/\s/g, '')) || 0;
  const to = parseFloat(toAmount.replace(/\s/g, '')) || 0;

  const additionalCost = fromCurrency !== toCurrency && rate > 0
    ? Math.abs(to - from * rate)
    : 0;

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleFromAmountChange = (val: string) => {
    setFromAmount(val);
    if (rate > 0 && fromCurrency !== toCurrency) {
      const num = parseFloat(val.replace(/\s/g, '')) || 0;
      setToAmount(String(num * rate));
    }
  };

  const handleSubmit = () => {
    onClose();
    setSelectedProject('');
    setFromAmount('');
    setToAmount('');
  };

  const project = MOCK_PROJECT_BALANCES.find(p => p.projectId === selectedProject);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Валюта конвертацияси</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Obyekt */}
          <div>
            <label className="text-sm font-medium">Объект <span className="text-destructive">*</span></label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Объектни танланг" />
              </SelectTrigger>
              <SelectContent>
                {MOCK_PROJECT_BALANCES.map(p => (
                  <SelectItem key={p.projectId} value={p.projectId}>{p.projectName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Balanslar */}
          {project && (
            <div className="flex gap-3 text-xs">
              <div className="flex-1 rounded-md border p-2 text-center">
                <p className="text-muted-foreground">UZS</p>
                <p className="font-semibold">{fmt(project.balances.UZS)}</p>
              </div>
              <div className="flex-1 rounded-md border p-2 text-center">
                <p className="text-muted-foreground">USD</p>
                <p className="font-semibold">{fmt(project.balances.USD)}</p>
              </div>
              <div className="flex-1 rounded-md border p-2 text-center">
                <p className="text-muted-foreground">BANK</p>
                <p className="font-semibold">{fmt(project.balances.BANK)}</p>
              </div>
            </div>
          )}

          {/* Kurs */}
          <div>
            <label className="text-sm font-medium">Жорий курс: 1 USD =</label>
            <div className="flex items-center gap-2 mt-1">
              <Input value={exchangeRate} onChange={e => setExchangeRate(e.target.value)} className="flex-1" />
              <span className="text-sm text-muted-foreground">сўм</span>
            </div>
          </div>

          {/* Dan valyuta */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Дан валюта <span className="text-destructive">*</span></label>
              <Select value={fromCurrency} onValueChange={(v) => setFromCurrency(v as Currency)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UZS">UZS</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="BANK">BANK</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">{fromCurrency} миқдори</label>
              <Input
                className="mt-1"
                value={fromAmount}
                onChange={e => handleFromAmountChange(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          {/* Swap button */}
          <div className="flex justify-center">
            <Button variant="ghost" size="icon" className="rounded-full border text-orange-500 hover:text-orange-600" onClick={handleSwap}>
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>

          {/* Ga valyuta */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Га валюта <span className="text-destructive">*</span></label>
              <Select value={toCurrency} onValueChange={(v) => setToCurrency(v as Currency)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UZS">UZS</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="BANK">BANK</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">{toCurrency} миқдори</label>
              <Input
                className="mt-1"
                value={toAmount}
                onChange={e => setToAmount(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          {/* Qo'shimcha xarajat */}
          {additionalCost > 0 && (
            <div className="flex items-start gap-2 rounded-lg bg-orange-50 border border-orange-200 p-3">
              <Info className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-orange-700">Қўшимча харажат</p>
                <p className="text-sm text-orange-600">{fmt(additionalCost)} {toCurrency}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Бекор қилиш</Button>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={handleSubmit}>
            Конвертация қилиш
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
