import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

function fmt(amount: number) {
  return new Intl.NumberFormat('uz-UZ').format(amount);
}

export type PaymentRequestStatus = 'pending' | 'approved' | 'archived';

export interface PaymentRequestItem {
  id: string;
  vendorName: string;
  amount: number;
  date: string;
  comment: string;
  status: PaymentRequestStatus;
  items?: { name: string; qty: number; unit: string; unitPrice: number; total: number }[];
}

const MOCK_PAYMENT_REQUESTS: PaymentRequestItem[] = [
  { id: 'pr1', vendorName: 'ABC Building Supplies', amount: 5_000_000, date: '2026-02-17', comment: 'Minvata uchun to\'lov', status: 'pending', items: [
    { name: 'Minvata', qty: 100, unit: 'Pochka', unitPrice: 50_000, total: 5_000_000 },
  ]},
  { id: 'pr2', vendorName: 'ABC Building Supplies', amount: 2_000_000, date: '2026-02-11', comment: 'Setka serepyanka uchun', status: 'pending', items: [
    { name: 'Setka serepyanka', qty: 200, unit: 'dona', unitPrice: 10_000, total: 2_000_000 },
  ]},
  { id: 'pr3', vendorName: 'FastTrack Materials Co.', amount: 216_000_000, date: '2026-02-11', comment: 'Sement uchun avans', status: 'pending', items: [
    { name: 'Sement Portland', qty: 72, unit: 'ton', unitPrice: 3_000_000, total: 216_000_000 },
  ]},
  { id: 'pr4', vendorName: 'BuildRight Contractors', amount: 120_000, date: '2026-02-11', comment: 'G\'isht qoldiq to\'lov', status: 'pending' },
  { id: 'pr5', vendorName: 'Metro Equipment Rentals', amount: 216_000_000, date: '2026-02-11', comment: 'Kran ijarasi', status: 'pending' },
  { id: 'pr6', vendorName: 'ABC Building Supplies', amount: 227_000_000, date: '2026-02-13', comment: 'Fanera uchun to\'liq to\'lov', status: 'approved', items: [
    { name: 'Fanera 18mm', qty: 200, unit: 'dona', unitPrice: 1_135_000, total: 227_000_000 },
  ]},
  { id: 'pr7', vendorName: 'Premier Construction Services', amount: 50_000_000, date: '2026-02-12', comment: 'Suvoq ishlari avans', status: 'approved' },
  { id: 'pr8', vendorName: 'FastTrack Materials Co.', amount: 3_000_000, date: '2026-02-12', comment: 'Sement uchun qo\'shimcha', status: 'approved' },
  { id: 'pr9', vendorName: 'BuildRight Contractors', amount: 10_000_000, date: '2026-02-11', comment: 'G\'isht uchun avans', status: 'approved', items: [
    { name: "G'isht standart", qty: 5000, unit: 'dona', unitPrice: 2_000, total: 10_000_000 },
  ]},
  { id: 'pr10', vendorName: 'SteelForge Industries', amount: 58_900_000, date: '2026-02-07', comment: 'Armatura uchun', status: 'approved' },
  { id: 'pr11', vendorName: 'ABC Building Supplies', amount: 23_000_000, date: '2026-02-11', comment: 'Oyna uchun to\'lov', status: 'archived' },
  { id: 'pr12', vendorName: 'FastTrack Materials Co.', amount: 10_000, date: '2026-02-11', comment: 'Test to\'lov', status: 'archived' },
  { id: 'pr13', vendorName: 'BuildRight Contractors', amount: 201_000_000, date: '2026-02-11', comment: 'Beton plita uchun', status: 'archived' },
  { id: 'pr14', vendorName: 'Metro Equipment Rentals', amount: 216_000_000, date: '2026-02-11', comment: 'Ekskavator ijarasi', status: 'archived' },
  { id: 'pr15', vendorName: 'SteelForge Industries', amount: 1_000_000, date: '2026-02-07', comment: 'Metall buyumlar', status: 'archived' },
  { id: 'pr16', vendorName: 'Premier Construction Services', amount: 600_000, date: '2026-02-05', comment: 'Ish haqi to\'lov', status: 'archived' },
  { id: 'pr17', vendorName: 'ABC Building Supplies', amount: 19_500_000, date: '2026-02-04', comment: 'Quvur uchun', status: 'archived' },
  { id: 'pr18', vendorName: 'FastTrack Materials Co.', amount: 3_000_000, date: '2026-01-22', comment: 'Transport xarajati', status: 'archived' },
];

const COLUMNS: { key: PaymentRequestStatus; label: string; color: string }[] = [
  { key: 'pending', label: 'Kutilmoqda', color: 'hsl(var(--status-pending))' },
  { key: 'approved', label: 'Tasdiqlandi', color: 'hsl(130, 60%, 40%)' },
  { key: 'archived', label: 'Arxivlandi', color: 'hsl(var(--muted-foreground))' },
];

export function PaymentRequestsBoard() {
  const [requests] = useState<PaymentRequestItem[]>(MOCK_PAYMENT_REQUESTS);
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequestItem | null>(null);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">So'ralgan pullar</h2>

      <div className="grid grid-cols-3 gap-4">
        {COLUMNS.map(col => {
          const items = requests.filter(r => r.status === col.key);
          return (
            <div key={col.key} className="border rounded-lg bg-muted/20 min-h-[60vh]">
              {/* Column header */}
              <div className="flex items-center gap-2 px-3 py-2.5 border-b">
                <h3 className="text-sm font-semibold">{col.label}</h3>
                <Badge variant="secondary" className="text-xs h-5 px-1.5">{items.length}</Badge>
              </div>

              {/* Cards */}
              <div className="p-2 space-y-2">
                {items.map(item => (
                  <Card
                    key={item.id}
                    className="cursor-pointer hover:shadow-md transition-shadow border-l-[3px]"
                    style={{ borderLeftColor: col.color }}
                    onClick={() => setSelectedRequest(item)}
                  >
                    <CardContent className="p-3 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold truncate">{item.vendorName}</p>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">{item.date}</span>
                      </div>
                      <p className="text-sm font-bold">{fmt(item.amount)} UZS</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{item.comment}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedRequest?.vendorName}</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Sana</p>
                  <p className="font-medium">{selectedRequest.date}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Miqdor</p>
                  <p className="font-bold">{fmt(selectedRequest.amount)} UZS</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Izoh</p>
                <p className="text-sm">{selectedRequest.comment}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Holati</p>
                <Badge variant={selectedRequest.status === 'pending' ? 'outline' : selectedRequest.status === 'approved' ? 'default' : 'secondary'}>
                  {COLUMNS.find(c => c.key === selectedRequest.status)?.label}
                </Badge>
              </div>

              {selectedRequest.items && selectedRequest.items.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Materiallar</p>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead className="text-xs">Nomi</TableHead>
                          <TableHead className="text-xs text-right">Miqdor</TableHead>
                          <TableHead className="text-xs">Birlik</TableHead>
                          <TableHead className="text-xs text-right">Narx</TableHead>
                          <TableHead className="text-xs text-right">Jami</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedRequest.items.map((item, i) => (
                          <TableRow key={i}>
                            <TableCell className="text-xs">{item.name}</TableCell>
                            <TableCell className="text-xs text-right">{item.qty}</TableCell>
                            <TableCell className="text-xs">{item.unit}</TableCell>
                            <TableCell className="text-xs text-right">{fmt(item.unitPrice)}</TableCell>
                            <TableCell className="text-xs text-right font-medium">{fmt(item.total)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
