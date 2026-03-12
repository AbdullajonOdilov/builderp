import { useCallback, useRef } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BuildingDocument } from '@/types/building';
import { cn } from '@/lib/utils';

interface DocumentUploadProps {
  onUpload: (doc: BuildingDocument) => void;
  className?: string;
  accept?: string;
}

export const DocumentUpload = ({ onUpload, className, accept }: DocumentUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

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

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
      <Button
        variant="outline"
        size="sm"
        className={cn("gap-1.5", className)}
        onClick={() => inputRef.current?.click()}
      >
        <Plus className="h-4 w-4" />
        Yuklash
      </Button>
    </>
  );
};
