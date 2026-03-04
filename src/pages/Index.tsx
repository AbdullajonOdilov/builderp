import { useState } from 'react';
import { UserRole, ResourceRequest } from '@/types/request';
import { useRequests } from '@/hooks/useRequests';
import { RoleSelector } from '@/components/RoleSelector';
import { ManagerDashboard } from '@/components/ManagerDashboard';
import { SupplierDashboard } from '@/components/SupplierDashboard';
import { LittleSupplierDashboard } from '@/components/LittleSupplierDashboard';
import { useNotifications } from '@/contexts/NotificationContext';

const Index = () => {
  const [role, setRole] = useState<UserRole | null>(null);
  const { addNotification } = useNotifications();
  const { 
    requests, 
    purchases,
    addRequest, 
    updateStatus, 
    setAvailability,
    selectForPurchase,
    deselectFromPurchase,
    createPurchase,
    updateQuantity,
    updateFulfilledQuantity,
  } = useRequests();

  const handleAddRequest = (request: Omit<ResourceRequest, 'id' | 'createdAt' | 'status'>) => {
    const newReq = addRequest(request);
    addNotification({
      title: `Янги сўров: ${request.resourceName}`,
      description: `${request.quantity} ${request.unit} — ${request.projectName}`,
      type: 'request',
      route: '/requests',
    });
    return newReq;
  };

  if (!role) {
    return <RoleSelector onSelectRole={setRole} />;
  }

  const renderDashboard = () => {
    switch (role) {
      case 'manager':
        return <ManagerDashboard requests={requests} onAddRequest={handleAddRequest} onUpdateStatus={updateStatus} />;
      case 'little_supplier':
        return <LittleSupplierDashboard requests={requests} onUpdateStatus={updateStatus} />;
      case 'supplier':
        return (
          <SupplierDashboard 
            requests={requests}
            purchases={purchases}
            onUpdateStatus={updateStatus}
            onSetAvailability={setAvailability}
            onSelectForPurchase={selectForPurchase}
            onDeselectFromPurchase={deselectFromPurchase}
            onCreatePurchase={createPurchase}
            onUpdateQuantity={updateQuantity}
            onUpdateFulfilledQuantity={updateFulfilledQuantity}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderDashboard()}
    </div>
  );
};

export default Index;