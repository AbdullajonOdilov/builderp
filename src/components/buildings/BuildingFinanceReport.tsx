import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface BuildingFinanceReportProps {
  totalPrice: number;
  usedMoney: number;
  pendingMoney: number;
}

const EXPENSE_CATEGORIES = [
  { name: 'Oyliklarga', type: 'naxt', amount: 397_000_000 },
  { name: 'Obyomchilarga', type: 'naxt', amount: 611_200_000 },
  { name: 'Hisob raqam + Soliq', type: 'schet', amount: 107_833_598 },
  { name: 'Naqtlashtirish', type: 'schet', amount: 98_497_043 },
  { name: 'Boshqa xarajatlar', type: 'naxt', amount: 205_093_900 },
  { name: 'Inventarlar', type: '', amount: 54_150_000 },
];

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(210 40% 60%)',
];

const formatNumber = (n: number) =>
  n.toLocaleString('ru-RU', { maximumFractionDigits: 0 });

const BuildingFinanceReport = ({ totalPrice: rawTotal, usedMoney: rawUsed, pendingMoney: rawPending }: BuildingFinanceReportProps) => {
  // Use mock data if building has no financial data
  const totalPrice = rawTotal || 4_600_000_000;
  const usedMoney = rawUsed || 1_473_774_540;
  const pendingMoney = rawPending || 346_225_460;

  const kirim = usedMoney + pendingMoney;
  const qoldiq = totalPrice - kirim;
  const kirimPercent = totalPrice > 0 ? ((kirim / totalPrice) * 100).toFixed(2) : '0';
  const qoldiqPercent = totalPrice > 0 ? ((qoldiq / totalPrice) * 100).toFixed(2) : '0';

  const expenses = EXPENSE_CATEGORIES;

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  const pieData = expenses.map(e => ({
    name: e.name,
    value: e.amount,
  }));

  return (
    <div className="space-y-6">
      {/* Summary Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-amber-50 dark:bg-amber-950/30">
              <TableHead className="w-16 text-center font-bold text-foreground">№</TableHead>
              <TableHead className="font-bold text-foreground">Nomlanishi</TableHead>
              <TableHead className="text-center font-bold text-foreground">Birlik</TableHead>
              <TableHead className="text-right font-bold text-foreground">Summa</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="text-center">1</TableCell>
              <TableCell className="font-medium">Jami Kelishuv</TableCell>
              <TableCell className="text-center">100%</TableCell>
              <TableCell className="text-right font-semibold">{formatNumber(totalPrice)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-center">2</TableCell>
              <TableCell className="font-medium">Kirim</TableCell>
              <TableCell className="text-center">{kirimPercent}%</TableCell>
              <TableCell className="text-right font-semibold">{formatNumber(kirim)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-center">3</TableCell>
              <TableCell className="font-medium">Qoldiq</TableCell>
              <TableCell className="text-center">{qoldiqPercent}%</TableCell>
              <TableCell className="text-right font-semibold">{formatNumber(qoldiq)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>

      {/* Expenses Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Expenses Table */}
        <Card className="overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="font-bold text-center text-lg">Umumiy harajatlar</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">№</TableHead>
                <TableHead>Nomlanishi</TableHead>
                <TableHead className="text-center">Turi</TableHead>
                <TableHead className="text-right">Summa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((e, i) => (
                <TableRow key={e.name}>
                  <TableCell className="text-center">{i + 1}</TableCell>
                  <TableCell className="font-medium">{e.name}</TableCell>
                  <TableCell className="text-center text-muted-foreground">{e.type || '—'}</TableCell>
                  <TableCell className="text-right">{formatNumber(e.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell />
                <TableCell className="font-bold">JAMI</TableCell>
                <TableCell />
                <TableCell className="text-right font-bold">{formatNumber(totalExpenses)}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </Card>

        {/* Pie Chart */}
        <Card className="p-4">
          <h3 className="font-bold text-center text-lg mb-4">Harajatlar taqsimoti</h3>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={110}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                labelLine={false}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatNumber(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default BuildingFinanceReport;
