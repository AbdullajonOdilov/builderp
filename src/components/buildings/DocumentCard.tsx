import { FileText, Image, File, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BuildingDocument } from '@/types/building';

interface DocumentCardProps {
  document: BuildingDocument;
  onDelete?: () => void;
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return Image;
  if (type.includes('pdf') || type.includes('doc')) return FileText;
  return File;
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const DocumentCard = ({ document, onDelete }: DocumentCardProps) => {
  const Icon = getFileIcon(document.type);
  
  return (
    <Card className="group relative p-4 hover:bg-accent/30 transition-colors">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{document.name}</p>
          <p className="text-xs text-muted-foreground">{formatFileSize(document.size)}</p>
        </div>
        {onDelete && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Card>
  );
};
