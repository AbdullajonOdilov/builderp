import { useState } from 'react';
import { UserRole } from '@/types/request';
import { useRequests } from '@/hooks/useRequests';
import { RoleSelector } from '@/components/RoleSelector';
import { ManagerDashboard } from '@/components/ManagerDashboard';
import { SupplierDashboard } from '@/components/SupplierDashboard';
import { LittleSupplierDashboard } from '@/components/LittleSupplierDashboard';

const Index = () => {
  const [role, setRole] = useState<UserRole | null>(null);
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

  if (!role) {
    return <RoleSelector onSelectRole={setRole} />;
  }

  const renderDashboard = () => {
    switch (role) {
      case 'manager':
        return <ManagerDashboard requests={requests} onAddRequest={addRequest} onUpdateStatus={updateStatus} />;
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