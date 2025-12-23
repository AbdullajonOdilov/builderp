import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DocumentCard } from '@/components/buildings/DocumentCard';
import { DocumentUpload } from '@/components/buildings/DocumentUpload';
import { BuildingBreadcrumbs } from '@/components/buildings/BuildingBreadcrumbs';
import { useBuildings } from '@/hooks/useBuildings';
import { BuildingDocument } from '@/types/building';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';

const SectionView = () => {
  const { buildingId, sectionId } = useParams();
  const navigate = useNavigate();
  const { getBuilding, getSection, addDocumentToSection, updateSection } = useBuildings();
  
  const building = getBuilding(buildingId || '');
  const section = getSection(buildingId || '', sectionId || '');

  if (!building || !section) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Section not found</h2>
          <Button onClick={() => navigate('/buildings')}>Go back to Buildings</Button>
        </div>
      </div>
    );
  }

  const handleDocumentUpload = (doc: BuildingDocument) => {
    addDocumentToSection(building.id, section.id, doc);
    toast.success('Document uploaded');
  };

  const handleDocumentDelete = (docId: string) => {
    updateSection(building.id, section.id, {
      documents: section.documents.filter(d => d.id !== docId)
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-6">
        {/* Breadcrumbs */}
        <BuildingBreadcrumbs 
          items={[
            { label: building.objectName, href: `/buildings/${building.id}` },
            { label: section.name }
          ]} 
        />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">{section.name}</h1>
          <p className="text-muted-foreground">
            {section.documents.length} {section.documents.length === 1 ? 'document' : 'documents'}
          </p>
        </div>

        {/* Documents */}
        <div>
          <DocumentUpload onUpload={handleDocumentUpload} className="mb-6" />
          
          {section.documents.length === 0 ? (
            <Card className="p-8 text-center border-2 border-dashed">
              <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="font-medium">No documents yet</p>
              <p className="text-sm text-muted-foreground">Drag and drop files above to upload</p>
            </Card>
          ) : (
            <div className="grid gap-2 md:grid-cols-2">
              {section.documents.map(doc => (
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
    </div>
  );
};

export default SectionView;
