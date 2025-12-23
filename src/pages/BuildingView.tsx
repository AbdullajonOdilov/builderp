import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { FolderCard } from '@/components/buildings/FolderCard';
import { DocumentCard } from '@/components/buildings/DocumentCard';
import { DocumentUpload } from '@/components/buildings/DocumentUpload';
import { BuildingBreadcrumbs } from '@/components/buildings/BuildingBreadcrumbs';
import { useBuildings } from '@/hooks/useBuildings';
import { BuildingDocument } from '@/types/building';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { toast } from 'sonner';

const BuildingView = () => {
  const { buildingId } = useParams();
  const navigate = useNavigate();
  const { getBuilding, addSection, deleteSection, addDocumentToBuilding, updateBuilding } = useBuildings();
  
  const [showNewSection, setShowNewSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [deleteSectionId, setDeleteSectionId] = useState<string | null>(null);

  const building = getBuilding(buildingId || '');

  if (!building) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Building not found</h2>
          <Button onClick={() => navigate('/buildings')}>Go back to Buildings</Button>
        </div>
      </div>
    );
  }

  const handleCreateSection = () => {
    if (!newSectionName.trim()) {
      toast.error('Please enter a section name');
      return;
    }
    addSection(building.id, newSectionName.trim());
    setNewSectionName('');
    setShowNewSection(false);
    toast.success('Section created');
  };

  const handleDeleteSection = () => {
    if (deleteSectionId) {
      deleteSection(building.id, deleteSectionId);
      setDeleteSectionId(null);
      toast.success('Section deleted');
    }
  };

  const handleDocumentUpload = (doc: BuildingDocument) => {
    addDocumentToBuilding(building.id, doc);
    toast.success('Document uploaded');
  };

  const handleDocumentDelete = (docId: string) => {
    updateBuilding(building.id, {
      documents: building.documents.filter(d => d.id !== docId)
    });
  };

  const leftMoney = building.totalPrice - building.usedMoney;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-6">
        {/* Breadcrumbs */}
        <BuildingBreadcrumbs items={[{ label: building.objectName }]} />

        {/* Header Info */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">{building.objectName}</h1>
              {building.contractNumber && (
                <p className="text-muted-foreground">Contract: {building.contractNumber}</p>
              )}
            </div>
            <div className="flex gap-6 text-sm">
              <div>
                <p className="text-muted-foreground">Total</p>
                <p className="font-semibold">${building.totalPrice.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Used</p>
                <p className="font-semibold">${building.usedMoney.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Left</p>
                <p className={`font-semibold ${leftMoney >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                  ${leftMoney.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Sections */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Sections</h2>
            <Button onClick={() => setShowNewSection(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Section
            </Button>
          </div>

          {building.sections.length === 0 ? (
            <Card 
              className="p-8 text-center border-2 border-dashed cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => setShowNewSection(true)}
            >
              <FolderPlus className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="font-medium">No sections yet</p>
              <p className="text-sm text-muted-foreground">Click to create your first section</p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {building.sections.map((section) => (
                <FolderCard
                  key={section.id}
                  name={section.name}
                  subtitle={`${section.documents.length} documents`}
                  onClick={() => navigate(`/buildings/${building.id}/sections/${section.id}`)}
                  onDelete={() => setDeleteSectionId(section.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Documents */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Documents</h2>
          <DocumentUpload onUpload={handleDocumentUpload} className="mb-4" />
          {building.documents.length > 0 && (
            <div className="grid gap-2 md:grid-cols-2">
              {building.documents.map(doc => (
                <DocumentCard 
                  key={doc.id} 
                  document={doc} 
                  onDelete={() => handleDocumentDelete(doc.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Section Dialog */}
      <Dialog open={showNewSection} onOpenChange={setShowNewSection}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Section</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Section name (e.g., Floor 1, Block A)"
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateSection()}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewSection(false)}>Cancel</Button>
            <Button onClick={handleCreateSection}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Section Dialog */}
      <AlertDialog open={!!deleteSectionId} onOpenChange={() => setDeleteSectionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Section?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the section and all its documents.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSection} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BuildingView;
