import { useCallback, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { BuildingDocument } from '@/types/building';
import { cn } from '@/lib/utils';

interface DocumentUploadProps {
  onUpload: (doc: BuildingDocument) => void;
  className?: string;
}

export const DocumentUpload = ({ onUpload, className }: DocumentUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback((files: FileList) => {
    Array.from(files).forEach(file => {
      const doc: BuildingDocument = {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date(),
      };
      onUpload(doc);
    });
  }, [onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  return (
    <Card
      className={cn(
        "border-2 border-dashed p-6 text-center transition-colors cursor-pointer",
        isDragging 
          ? "border-primary bg-primary/5" 
          : "border-muted-foreground/25 hover:border-primary/50",
        className
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => document.getElementById('file-upload')?.click()}
    >
      <input
        id="file-upload"
        type="file"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
      <p className="text-sm font-medium">Drop files here or click to upload</p>
      <p className="text-xs text-muted-foreground mt-1">PDF, Images, Documents</p>
    </Card>
  );
};
