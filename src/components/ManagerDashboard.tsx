import { useState } from 'react';
import { ResourceRequest } from '@/types/request';
import { CreateRequestForm } from './CreateRequestForm';
import { RequestList } from './RequestList';
import { Button } from '@/components/ui/button';
import { Plus, List, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ManagerDashboardProps {
  requests: ResourceRequest[];
  onAddRequest: (request: Omit<ResourceRequest, 'id' | 'createdAt' | 'status'>) => void;
}

export function ManagerDashboard({ requests, onAddRequest }: ManagerDashboardProps) {
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (request: Omit<ResourceRequest, 'id' | 'createdAt' | 'status'>) => {
    onAddRequest(request);
    setShowForm(false);
  };

  return (
    <div className="container py-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Requests</h1>
          <p className="text-muted-foreground">Track your resource requests</p>
        </div>
        
        <Button
          onClick={() => setShowForm(!showForm)}
          className={cn(
            showForm && 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          {showForm ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </>
          )}
        </Button>
      </div>

      {showForm && (
        <div className="mb-6">
          <CreateRequestForm onSubmit={handleSubmit} managerName="John Smith" />
        </div>
      )}

      <RequestList requests={requests} role="manager" />
    </div>
  );
}
