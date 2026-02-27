import { useState } from 'react';
import { useFeatureFlags } from '@/contexts/FeatureFlagContext';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Flag, Loader2, LayoutGrid, Zap, Eye } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  pages: { label: 'Sahifalar', icon: LayoutGrid, color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  functionality: { label: 'Funksionallik', icon: Zap, color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  ui: { label: 'UI Elementlar', icon: Eye, color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  general: { label: 'Umumiy', icon: Flag, color: 'bg-muted text-muted-foreground border-border' },
};

const FeatureFlags = () => {
  const { allFlags, isLoading, toggleFlag, addFlag, deleteFlag } = useFeatureFlags();
  const [addOpen, setAddOpen] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('general');

  const handleToggle = async (key: string, enabled: boolean) => {
    await toggleFlag(key, enabled);
    toast.success(`${key} ${enabled ? 'yoqildi' : "o'chirildi"}`);
  };

  const handleAdd = async () => {
    if (!newKey || !newLabel) return;
    await addFlag({ key: newKey, label: newLabel, description: newDesc || null, category: newCategory, enabled: false });
    toast.success('Yangi flag qo\'shildi');
    setAddOpen(false);
    setNewKey(''); setNewLabel(''); setNewDesc(''); setNewCategory('general');
  };

  const handleDelete = async (key: string) => {
    await deleteFlag(key);
    toast.success(`${key} o'chirildi`);
  };

  const grouped = allFlags.reduce<Record<string, typeof allFlags>>((acc, f) => {
    (acc[f.category] ??= []).push(f);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container py-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Flag className="h-6 w-6" />
            Feature Flags
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Loyiha funksiyalarini boshqaring</p>
        </div>

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Yangi flag</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Yangi Feature Flag</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Kalit (key)</Label>
                <Input value={newKey} onChange={e => setNewKey(e.target.value)} placeholder="page_new_feature" />
              </div>
              <div>
                <Label>Nomi</Label>
                <Input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Yangi funksiya" />
              </div>
              <div>
                <Label>Tavsif</Label>
                <Textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Bu funksiya..." />
              </div>
              <div>
                <Label>Kategoriya</Label>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAdd} className="w-full" disabled={!newKey || !newLabel}>Qo'shish</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {Object.entries(grouped).map(([category, flags]) => {
          const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.general;
          const Icon = config.icon;
          return (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <Icon className="h-4 w-4" />
                <h2 className="font-semibold text-sm uppercase tracking-wider">{config.label}</h2>
                <Badge variant="secondary" className="text-xs">{flags.length}</Badge>
              </div>
              <div className="space-y-2">
                {flags.map(flag => (
                  <Card key={flag.id} className="flex items-center justify-between p-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{flag.label}</span>
                        <Badge variant="outline" className={`text-[10px] ${config.color}`}>{config.label}</Badge>
                      </div>
                      {flag.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{flag.description}</p>
                      )}
                      <code className="text-[10px] text-muted-foreground/60">{flag.key}</code>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Switch
                        checked={flag.enabled}
                        onCheckedChange={v => handleToggle(flag.key, v)}
                      />
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(flag.key)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeatureFlags;
