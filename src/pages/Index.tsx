import { useState } from 'react';
import { UserRole } from '@/types/request';
import { useRequests } from '@/hooks/useRequests';
import { Header } from '@/components/Header';
import { RoleSelector } from '@/components/RoleSelector';
import { ManagerDashboard } from '@/components/ManagerDashboard';
import { SupplierDashboard } from '@/components/SupplierDashboard';

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

  return (
    <div className="min-h-screen bg-background">
      <Header role={role} onRoleChange={setRole} />
      
      {role === 'manager' ? (
        <ManagerDashboard requests={requests} onAddRequest={addRequest} />
      ) : (
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
      )}
    </div>
  );
};

export default Index;