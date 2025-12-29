import { useState } from 'react';
import { ResourceRequest } from '@/types/request';
import { CreateRequestForm } from './CreateRequestForm';
import { ManagerKanbanBoard } from './manager/ManagerKanbanBoard';

interface ManagerDashboardProps {
  requests: ResourceRequest[];
  onAddRequest: (request: Omit<ResourceRequest, 'id' | 'createdAt' | 'status'>) => void;
  onUpdateStatus?: (id: string, status: 'pending' | 'delivered' | 'declined') => void;
}

export function ManagerDashboard({ requests, onAddRequest, onUpdateStatus }: ManagerDashboardProps) {
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (request: Omit<ResourceRequest, 'id' | 'createdAt' | 'status'>) => {
    onAddRequest(request);
    setShowForm(false);
  };

  return (
    <div className="h-full flex flex-col">
      {showForm && (
        <div className="px-6 py-4 border-b bg-background">
          <CreateRequestForm onSubmit={handleSubmit} managerName="John Smith" />
        </div>
      )}

      <ManagerKanbanBoard 
        requests={requests}
        onAddRequest={onAddRequest}
        onUpdateStatus={onUpdateStatus}
        showForm={showForm}
        setShowForm={setShowForm}
        managerName="John Smith"
      />
    </div>
  );
}
