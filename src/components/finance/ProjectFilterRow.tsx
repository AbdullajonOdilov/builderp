import { Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MOCK_PROJECT_VENDOR_EXPENSES } from '@/types/finance';

interface Props {
  selectedProject: string;
  onSelectProject: (value: string) => void;
  children?: React.ReactNode;
}

export function ProjectFilterRow({ selectedProject, onSelectProject, children }: Props) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Project</label>
        <Select value={selectedProject} onValueChange={onSelectProject}>
          <SelectTrigger className="w-[240px]">
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue placeholder="All Projects" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {MOCK_PROJECT_VENDOR_EXPENSES.map(p => (
              <SelectItem key={p.projectId} value={p.projectId}>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: p.projectColor }} />
                  {p.projectName}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {children}
    </div>
  );
}
