import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { VendorRequest } from '@/types/finance';

function fmt(amount: number) {
  return new Intl.NumberFormat('uz-UZ').format(amount);
}

interface Props {
  open: boolean;
  onClose: () => void;
  vendorName: string;
  selectedRequests: VendorRequest[];
}

export function RequestPaymentDialog({ open, onClose, vendorName, selectedRequests }: Props) {
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
          <DialogTitle>Pul so'rash — {vendorName}</DialogTitle>
        </DialogHeader>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="text-xs w-8">№</TableHead>
                <TableHead className="text-xs">Sana</TableHead>
                <TableHead className="text-xs">Manba</TableHead>
                <TableHead className="text-xs text-right">Jami</TableHead>
                <TableHead className="text-xs text-right">To'langan</TableHead>
                <TableHead className="text-xs text-right">Qoldiq</TableHead>
                <TableHead className="text-xs text-right w-[140px]">So'ralayotgan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedRequests.map((req, idx) => (
                <TableRow key={req.requestId}>
                  <TableCell className="text-xs text-muted-foreground">{idx + 1}</TableCell>
                  <TableCell className="text-sm">{req.date}</TableCell>
                  <TableCell className="text-sm">{req.source}</TableCell>
                  <TableCell className="text-sm text-right">{fmt(req.totalAmount)}</TableCell>
                  <TableCell className="text-sm text-right">{fmt(req.paidAmount)}</TableCell>
                  <TableCell className="text-sm text-right text-destructive">{fmt(req.remainingAmount)}</TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      placeholder="Miqdor"
                      className="h-8 text-sm w-[120px] ml-auto"
                      value={amounts[req.requestId] ?? String(req.remainingAmount)}
                      onChange={(e) => setAmounts(prev => ({ ...prev, [req.requestId]: e.target.value }))}
                    />
                  </TableCell>
                </TableRow>
              ))}
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
