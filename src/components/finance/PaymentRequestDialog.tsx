import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { VendorExpense } from '@/types/finance';

function fmt(amount: number) {
  return new Intl.NumberFormat('uz-UZ').format(amount) + ' UZS';
}

interface VendorSummary {
  vendor: VendorExpense;
  projects: string[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  selectedVendors: VendorSummary[];
}

export function PaymentRequestDialog({ open, onClose, selectedVendors }: Props) {
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    onClose();
    setAmounts({});
    setComment('');
  };

  const handleClose = () => {
    onClose();
    setAmounts({});
    setComment('');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pul so'rash</DialogTitle>
        </DialogHeader>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="text-xs">Kontragent</TableHead>
                <TableHead className="text-xs text-right">Jami</TableHead>
                <TableHead className="text-xs text-right">Berilgan</TableHead>
                <TableHead className="text-xs text-right">Balans</TableHead>
                <TableHead className="text-xs text-right">Qarz</TableHead>
                <TableHead className="text-xs text-right w-[160px]">So'ralayotgan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedVendors.map(({ vendor }) => {
                const total = vendor.totalPaid + vendor.totalPending;
                const balance = vendor.totalPaid - vendor.totalPending;
                return (
                  <TableRow key={vendor.vendorId}>
                    <TableCell className="font-medium text-sm">{vendor.vendorName}</TableCell>
                    <TableCell className="text-right text-sm">{fmt(total)}</TableCell>
                    <TableCell className="text-right text-sm text-green-600">{fmt(vendor.totalPaid)}</TableCell>
                    <TableCell className={`text-right text-sm font-medium ${balance >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                      {fmt(balance)}
                    </TableCell>
                    <TableCell className="text-right text-sm text-destructive">
                      {vendor.totalPending > 0 ? fmt(vendor.totalPending) : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        placeholder="Miqdor"
                        className="h-8 text-sm w-[140px] ml-auto"
                        value={amounts[vendor.vendorId] || ''}
                        onChange={(e) => setAmounts(prev => ({ ...prev, [vendor.vendorId]: e.target.value }))}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Izoh</Label>
          <Textarea
            placeholder="Izoh yozing..."
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Bekor qilish</Button>
          <Button onClick={handleSubmit}>So'rov yuborish</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
