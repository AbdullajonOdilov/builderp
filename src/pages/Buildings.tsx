import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FolderCard } from '@/components/buildings/FolderCard';
import { useBuildings } from '@/hooks/useBuildings';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const Buildings = () => {
  const navigate = useNavigate();
  const { buildings, deleteBuilding } = useBuildings();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = () => {
    if (deleteId) {
      deleteBuilding(deleteId);
      setDeleteId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Buildings</h1>
              <p className="text-sm text-muted-foreground">
                {buildings.length} {buildings.length === 1 ? 'project' : 'projects'}
              </p>
            </div>
          </div>
          <Button onClick={() => navigate('/buildings/new')} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            New Building
          </Button>
        </div>

        {/* Buildings Grid */}
        {buildings.length === 0 ? (
          <div className="text-center py-16">
            <div className="p-4 bg-muted rounded-full w-fit mx-auto mb-4">
              <Building2 className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No buildings yet</h2>
            <p className="text-muted-foreground mb-6">Create your first building to get started</p>
            <Button onClick={() => navigate('/buildings/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Building
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {buildings.map((building) => {
              const completionPercentage = building.totalPrice > 0 
                ? (building.usedMoney / building.totalPrice) * 100 
                : 0;
              return (
                <FolderCard
                  key={building.id}
                  name={building.objectName}
                  subtitle={`${building.sections.length} sections • ${formatCurrency(building.totalPrice - building.usedMoney)} left`}
                  completionPercentage={completionPercentage}
                  onClick={() => navigate(`/buildings/${building.id}`)}
                  onDelete={() => setDeleteId(building.id)}
                  onEdit={() => navigate(`/buildings/${building.id}/edit`)}
                />
              );
            })}
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Building?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the building and all its sections. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Buildings;
