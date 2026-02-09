import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building } from '@/types/building';
import { Task, SubResource, TASK_CATEGORIES, TaskCategory } from '@/types/task';
import { toast } from 'sonner';

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buildings: Building[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
}

const emptySubResource = (): Omit<SubResource, 'id'> & { id: string } => ({
  id: crypto.randomUUID(),
  categoryName: 'General',
  resourceCode: '',
  resourceName: '',
  resourceAmount: 0,
  unitPrice: 0,
  totalPrice: 0,
});

export function AddTaskDialog({ open, onOpenChange, buildings, onAddTask }: AddTaskDialogProps) {
  const [categoryName, setCategoryName] = useState<TaskCategory>('General');
  const [resourceCode, setResourceCode] = useState('');
  const [taskName, setTaskName] = useState('');
  const [taskAmount, setTaskAmount] = useState<number>(0);
  const [buildingId, setBuildingId] = useState('');
  const [subResources, setSubResources] = useState<SubResource[]>([]);

  const resetForm = () => {
    setCategoryName('General');
    setResourceCode('');
    setTaskName('');
    setTaskAmount(0);
    setBuildingId('');
    setSubResources([]);
  };

  const addSubResource = () => {
    setSubResources(prev => [...prev, emptySubResource()]);
  };

  const updateSubResource = (id: string, field: keyof SubResource, value: string | number) => {
    setSubResources(prev =>
      prev.map(sr => {
        if (sr.id !== id) return sr;
        const updated = { ...sr, [field]: value };
        if (field === 'resourceAmount' || field === 'unitPrice') {
          updated.totalPrice = Number(updated.resourceAmount) * Number(updated.unitPrice);
        }
        return updated;
      })
    );
  };

  const removeSubResource = (id: string) => {
    setSubResources(prev => prev.filter(sr => sr.id !== id));
  };

  const handleSubmit = () => {
    if (!taskName.trim()) {
      toast.error('Task name is required');
      return;
    }
    if (!buildingId) {
      toast.error('Please select a building');
      return;
    }

    onAddTask({
      categoryName,
      resourceCode,
      taskName: taskName.trim(),
      taskAmount,
      buildingId,
      subResources,
    });

    toast.success('Task added successfully');
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Row 1: Category & Resource Code */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={categoryName} onValueChange={(v) => setCategoryName(v as TaskCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Resource Code</Label>
              <Input value={resourceCode} onChange={e => setResourceCode(e.target.value)} placeholder="e.g. RC-001" />
            </div>
          </div>

          {/* Row 2: Task Name & Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Task Name</Label>
              <Input value={taskName} onChange={e => setTaskName(e.target.value)} placeholder="Enter task name" />
            </div>
            <div className="space-y-1.5">
              <Label>Amount</Label>
              <Input type="number" min={0} value={taskAmount || ''} onChange={e => setTaskAmount(Number(e.target.value))} placeholder="0" />
            </div>
          </div>

          {/* Row 3: Building */}
          <div className="space-y-1.5">
            <Label>Building</Label>
            <Select value={buildingId} onValueChange={setBuildingId}>
              <SelectTrigger>
                <SelectValue placeholder="Select building" />
              </SelectTrigger>
              <SelectContent>
                {buildings.map(b => (
                  <SelectItem key={b.id} value={b.id}>
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: b.color }} />
                      {b.objectName}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sub Resources */}
          <div className="border-t pt-3 mt-1">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-semibold">Sub Resources</Label>
              <Button type="button" variant="outline" size="sm" onClick={addSubResource}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add
              </Button>
            </div>

            {subResources.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No sub resources added yet</p>
            )}

            <div className="space-y-3">
              {subResources.map((sr, idx) => (
                <div key={sr.id} className="border rounded-lg p-3 space-y-2 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Sub Resource #{idx + 1}</span>
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeSubResource(sr.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Category</Label>
                      <Select value={sr.categoryName} onValueChange={v => updateSubResource(sr.id, 'categoryName', v)}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TASK_CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Resource Code</Label>
                      <Input className="h-8 text-xs" value={sr.resourceCode} onChange={e => updateSubResource(sr.id, 'resourceCode', e.target.value)} placeholder="Code" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Resource Name</Label>
                      <Input className="h-8 text-xs" value={sr.resourceName} onChange={e => updateSubResource(sr.id, 'resourceName', e.target.value)} placeholder="Name" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Amount</Label>
                      <Input className="h-8 text-xs" type="number" min={0} value={sr.resourceAmount || ''} onChange={e => updateSubResource(sr.id, 'resourceAmount', Number(e.target.value))} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Unit Price</Label>
                      <Input className="h-8 text-xs" type="number" min={0} value={sr.unitPrice || ''} onChange={e => updateSubResource(sr.id, 'unitPrice', Number(e.target.value))} />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <span className="text-xs font-medium">
                      Total: <span className="text-primary">{sr.totalPrice.toLocaleString()}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Add Task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
