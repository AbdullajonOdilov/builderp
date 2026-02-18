import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { VendorExpense } from '@/types/finance';

function formatCurrency(amount: number) {
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
  const [comments, setComments] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    // TODO: implement actual submission
    onClose();
    setAmounts({});
    setComments({});
  };

  const handleClose = () => {
    onClose();
    setAmounts({});
    setComments({});
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pul so'rash</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {selectedVendors.map(({ vendor }) => {
            const total = vendor.totalPaid + vendor.totalPending;
            const balance = vendor.totalPaid - vendor.totalPending;

            return (
              <div key={vendor.vendorId} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm">{vendor.vendorName}</h3>
                    <p className="text-xs text-muted-foreground">{vendor.contactPerson} · {vendor.phone}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-muted/50 rounded-md p-2.5">
                    <p className="text-[10px] text-muted-foreground">Jami</p>
                    <p className="text-sm font-bold">{formatCurrency(total)}</p>
                  </div>
                  <div className="bg-muted/50 rounded-md p-2.5">
                    <p className="text-[10px] text-muted-foreground">Berilgan</p>
                    <p className="text-sm font-bold text-green-600">{formatCurrency(vendor.totalPaid)}</p>
                  </div>
                  <div className="bg-muted/50 rounded-md p-2.5">
                    <p className="text-[10px] text-muted-foreground">Balans</p>
                    <p className={`text-sm font-bold ${balance >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                      {formatCurrency(balance)}
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-md p-2.5">
                    <p className="text-[10px] text-muted-foreground">Qarz</p>
                    <p className="text-sm font-bold text-destructive">
                      {vendor.totalPending > 0 ? formatCurrency(vendor.totalPending) : '0 UZS'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">So'ralayotgan miqdor</Label>
                    <Input
                      type="number"
                      placeholder="Miqdorni kiriting..."
                      value={amounts[vendor.vendorId] || ''}
                      onChange={(e) => setAmounts(prev => ({ ...prev, [vendor.vendorId]: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Izoh</Label>
                    <Textarea
                      placeholder="Izoh yozing..."
                      rows={1}
                      value={comments[vendor.vendorId] || ''}
                      onChange={(e) => setComments(prev => ({ ...prev, [vendor.vendorId]: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Bekor qilish</Button>
          <Button onClick={handleSubmit}>So'rov yuborish</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
