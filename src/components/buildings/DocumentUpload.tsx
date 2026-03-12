import { useCallback, useRef } from 'react';
import { Upload } from 'lucide-react';
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
    <div className={cn("inline-flex", className)}>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
      <button
        type="button"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="h-3.5 w-3.5" />
        <span>Fayl yuklash</span>
      </button>
    </div>
  );
};
