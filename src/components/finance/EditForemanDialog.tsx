import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Foreman } from '@/types/foreman';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  foreman: Foreman | null;
}

export function EditForemanDialog({ open, onOpenChange, foreman }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profession, setProfession] = useState('');
  const [status, setStatus] = useState('active');
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (foreman) {
      setName(foreman.name);
      setPhone(foreman.phone);
      setProfession(foreman.profession);
      setStatus('active');
      setComment('');
    }
  }, [foreman]);

  const handleSubmit = () => {
    // TODO: update foreman
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Birgadirni tahrirlash</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">
                Ф.И.Ш <span className="text-destructive">*</span>
              </Label>
              <Input value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Telefon raqami <span className="text-destructive">*</span>
              </Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">
                Kasbi <span className="text-destructive">*</span>
              </Label>
              <Input value={profession} onChange={e => setProfession(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Faol</SelectItem>
                  <SelectItem value="inactive">Nofaol</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Izoh</Label>
            <Textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} placeholder="Qo'shimcha ma'lumot" />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Bekor qilish</Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || !phone.trim() || !profession.trim()}>Saqlash</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
