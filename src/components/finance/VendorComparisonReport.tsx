import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ProjectVendorExpense } from '@/types/finance';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

interface AggregatedVendor {
  vendorId: string;
  vendorName: string;
  contactPerson: string;
  phone: string;
  totalPaid: number;
  totalPending: number;
  totalInvoices: number;
  projectCount: number;
}

interface Props {
  data: ProjectVendorExpense[];
  selectedProject: string;
  onSelectProject: (value: string) => void;
}

export function VendorComparisonReport({ data, selectedProject, onSelectProject }: Props) {
  const vendorMap = new Map<string, AggregatedVendor>();
  data.forEach(project => {
    project.vendors.forEach(v => {
      const existing = vendorMap.get(v.vendorId);
      if (existing) {
        existing.totalPaid += v.totalPaid;
        existing.totalPending += v.totalPending;
        existing.totalInvoices += v.invoiceCount;
        existing.projectCount++;
      } else {
        vendorMap.set(v.vendorId, { ...v, totalInvoices: v.invoiceCount, projectCount: 1 });
      }
    });
  });

  const vendors = Array.from(vendorMap.values()).sort((a, b) => (b.totalPaid + b.totalPending) - (a.totalPaid + a.totalPending));

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Vendor Comparison</h2>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead className="text-center">Projects</TableHead>
                <TableHead className="text-right">Total Paid</TableHead>
                <TableHead className="text-right">Pending</TableHead>
                <TableHead className="text-right">Grand Total</TableHead>
                <TableHead className="text-center">Invoices</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.map(v => (
                <TableRow key={v.vendorId}>
                  <TableCell>
                    <div className="font-medium">{v.vendorName}</div>
                    <div className="text-xs text-muted-foreground">{v.contactPerson} · {v.phone}</div>
                  </TableCell>
                  <TableCell className="text-center"><Badge variant="secondary" className="text-[10px]">{v.projectCount}</Badge></TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(v.totalPaid)}</TableCell>
                  <TableCell className="text-right">{v.totalPending > 0 ? <span className="text-[hsl(var(--status-pending))]">{formatCurrency(v.totalPending)}</span> : '—'}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(v.totalPaid + v.totalPending)}</TableCell>
                  <TableCell className="text-center">{v.totalInvoices}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
