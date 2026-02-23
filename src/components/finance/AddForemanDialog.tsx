import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: { id: string; name: string }[];
}

export function AddForemanDialog({ open, onOpenChange, projects }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+998');
  const [profession, setProfession] = useState('');
  const [status, setStatus] = useState('active');
  const [project, setProject] = useState('');
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    // TODO: save foreman
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setPhone('+998');
    setProfession('');
    setStatus('active');
    setProject('');
    setComment('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Birgadir qo'shish</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Obyektlar</Label>
            <Select value={project} onValueChange={setProject}>
              <SelectTrigger><SelectValue placeholder="Obyekt tanlang" /></SelectTrigger>
              <SelectContent>
                {projects.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">
                Ф.И.Ш <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="To'liq ism"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Telefon raqami <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="+998"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">
                Kasbi <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="Kasbi"
                value={profession}
                onChange={e => setProfession(e.target.value)}
              />
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
            <Textarea
              placeholder="Qo'shimcha ma'lumot"
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Bekor qilish</Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || !phone.trim() || !profession.trim()}>Qo'shish</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
