import { useState } from 'react';
import { ResourceType, Priority, ResourceRequest } from '@/types/request';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Package, Wrench, Users, Send, AlertCircle, ArrowUp, Minus, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CreateRequestFormProps {
  onSubmit: (request: Omit<ResourceRequest, 'id' | 'createdAt' | 'status'>) => void;
  managerName?: string;
}

const resourceTypes: { value: ResourceType; label: string; icon: React.ReactNode }[] = [
  { value: 'materials', label: 'Materials', icon: <Package className="h-5 w-5" /> },
  { value: 'equipment', label: 'Equipment', icon: <Wrench className="h-5 w-5" /> },
  { value: 'services', label: 'Services', icon: <Users className="h-5 w-5" /> },
];

const priorities: { value: Priority; label: string; icon: React.ReactNode; className: string }[] = [
  { value: 'critical', label: 'Critical', icon: <AlertCircle className="h-4 w-4" />, className: 'priority-critical' },
  { value: 'high', label: 'High', icon: <ArrowUp className="h-4 w-4" />, className: 'priority-high' },
  { value: 'medium', label: 'Medium', icon: <Minus className="h-4 w-4" />, className: 'priority-medium' },
  { value: 'low', label: 'Low', icon: <ArrowDown className="h-4 w-4" />, className: 'priority-low' },
];

export function CreateRequestForm({ onSubmit, managerName = 'Manager' }: CreateRequestFormProps) {
  const [resourceType, setResourceType] = useState<ResourceType>('materials');
  const [resourceName, setResourceName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [neededDate, setNeededDate] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resourceName || !quantity || !unit || !neededDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    onSubmit({
      resourceType,
      resourceName,
      quantity: Number(quantity),
      unit,
      neededDate,
      priority,
      managerName,
      notes: notes || undefined,
    });

    // Reset form
    setResourceName('');
    setQuantity('');
    setUnit('');
    setNeededDate('');
    setPriority('medium');
    setNotes('');
    
    toast.success('Request submitted successfully!');
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Card className="p-6 animate-fade-in">
      <h2 className="text-xl font-semibold mb-6">New Request</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Resource Type Selection */}
        <div>
          <Label className="text-sm font-medium mb-3 block">What do you need?</Label>
          <div className="grid grid-cols-3 gap-3">
            {resourceTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setResourceType(type.value)}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                  resourceType === type.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground/30'
                )}
              >
                <span className={cn(
                  'p-2 rounded-full',
                  resourceType === type.value ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                )}>
                  {type.icon}
                </span>
                <span className="text-sm font-medium">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Resource Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label htmlFor="resourceName">Resource Name *</Label>
            <Input
              id="resourceName"
              value={resourceName}
              onChange={(e) => setResourceName(e.target.value)}
              placeholder="e.g., Concrete Mix, Excavator"
              className="mt-1.5"
            />
          </div>
          
          <div>
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g., 50"
              className="mt-1.5"
            />
          </div>
          
          <div>
            <Label htmlFor="unit">Unit *</Label>
            <Input
              id="unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="e.g., bags, pieces, hours"
              className="mt-1.5"
            />
          </div>
        </div>

        {/* Date */}
        <div>
          <Label htmlFor="neededDate">Needed By *</Label>
          <Input
            id="neededDate"
            type="date"
            min={today}
            value={neededDate}
            onChange={(e) => setNeededDate(e.target.value)}
            className="mt-1.5"
          />
        </div>

        {/* Priority Selection */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Priority</Label>
          <div className="flex flex-wrap gap-2">
            {priorities.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPriority(p.value)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all',
                  priority === p.value
                    ? p.className
                    : 'bg-secondary text-muted-foreground hover:bg-muted'
                )}
              >
                {p.icon}
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional details..."
            className="mt-1.5 resize-none"
            rows={2}
          />
        </div>

        {/* Submit */}
        <Button type="submit" size="lg" className="w-full">
          <Send className="h-4 w-4 mr-2" />
          Submit Request
        </Button>
      </form>
    </Card>
  );
}
