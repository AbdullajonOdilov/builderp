import { useCallback, useRef } from 'react';
import { FileText } from 'lucide-react';
import { BuildingDocument } from '@/types/building';
import { cn } from '@/lib/utils';

interface DocumentUploadProps {
  onUpload: (doc: BuildingDocument) => void;
  className?: string;
  accept?: string;
  label?: string;
}

export const DocumentUpload = ({ onUpload, className, accept, label = 'File' }: DocumentUploadProps) => {
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
        className="flex flex-col items-center justify-center w-20 h-24 rounded-xl border border-dashed border-border bg-muted/30 hover:bg-muted/60 hover:border-primary/40 transition-all cursor-pointer group"
        onClick={() => inputRef.current?.click()}
      >
        <FileText className="h-7 w-7 text-muted-foreground group-hover:text-foreground transition-colors mb-1.5" />
        <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
      </button>
    </div>
  );
};
