import { Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MOCK_PROJECT_VENDOR_EXPENSES } from '@/types/finance';
interface Props {
  selectedProject: string;
  onSelectProject: (value: string) => void;
  children?: React.ReactNode;
}
export function ProjectFilterRow({
  selectedProject,
  onSelectProject,
  children
}: Props) {
  return <div className="flex flex-wrap items-end gap-3">
      
      {children}
    </div>;
}