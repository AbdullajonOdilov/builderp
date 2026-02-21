import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type VendorType = 'naqd' | 'bank';

export interface VendorFormData {
  vendorName: string;
  contactPerson: string;
  phone: string;
  vendorType: VendorType;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: VendorFormData) => void;
  initialData?: VendorFormData | null;
  title: string;
}

export function VendorFormDialog({ open, onClose, onSubmit, initialData, title }: Props) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState('');
  const [vendorType, setVendorType] = useState<VendorType>('naqd');

  useEffect(() => {
    if (open) {
      setName(initialData?.vendorName ?? '');
      setContact(initialData?.contactPerson ?? '');
      setPhone(initialData?.phone ?? '');
      setVendorType(initialData?.vendorType ?? 'naqd');
    }
  }, [open, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ vendorName: name.trim(), contactPerson: contact.trim(), phone: phone.trim(), vendorType });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vendor-name">Nomi *</Label>
            <Input id="vendor-name" value={name} onChange={e => setName(e.target.value)} placeholder="Kontragent nomi" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vendor-type">Turi *</Label>
            <Select value={vendorType} onValueChange={(v) => setVendorType(v as VendorType)}>
              <SelectTrigger>
                <SelectValue placeholder="Turini tanlang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="naqd">Naqd</SelectItem>
                <SelectItem value="bank">Bank</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="vendor-contact">Kontakt shaxs</Label>
            <Input id="vendor-contact" value={contact} onChange={e => setContact(e.target.value)} placeholder="Ism familiya" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vendor-phone">Telefon</Label>
            <Input id="vendor-phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+998 ..." />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Bekor qilish</Button>
            <Button type="submit">Saqlash</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}