import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Foreman } from '@/types/foreman';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  foreman: Foreman | null;
  projects?: { id: string; name: string }[];
}

export function EditForemanDialog({ open, onOpenChange, foreman, projects = [] }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profession, setProfession] = useState('');
  const [status, setStatus] = useState('active');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (foreman) {
      setName(foreman.name);
      setPhone(foreman.phone);
      setProfession(foreman.profession);
      setStatus('active');
      setSelectedProjects(foreman.projects.map(p => p.projectId));
      setComment('');
    }
  }, [foreman]);

  const toggleProject = (id: string) => {
    setSelectedProjects(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Birgadirni tahrirlash</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Obyektlar</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start font-normal h-auto min-h-10 flex-wrap gap-1">
                  {selectedProjects.length === 0 && <span className="text-muted-foreground text-sm">Obyekt tanlang</span>}
                  {selectedProjects.map(id => {
                    const proj = projects.find(p => p.id === id);
                    return (
                      <Badge key={id} variant="secondary" className="text-xs gap-1">
                        {proj?.name || id}
                        <X className="h-3 w-3 cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleProject(id); }} />
                      </Badge>
                    );
                  })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-2 z-[200]" align="start">
                {projects.map(p => (
                  <label key={p.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded cursor-pointer text-sm">
                    <Checkbox checked={selectedProjects.includes(p.id)} onCheckedChange={() => toggleProject(p.id)} />
                    {p.name}
                  </label>
                ))}
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Ф.И.Ш <span className="text-destructive">*</span></Label>
              <Input value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Telefon raqami <span className="text-destructive">*</span></Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Kasbi <span className="text-destructive">*</span></Label>
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
