import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MOCK_PROJECT_VENDOR_EXPENSES } from '@/types/finance';

interface Props {
  selectedProjects: string[];
  onSelectProjects: (value: string[]) => void;
  children?: React.ReactNode;
}

export function ProjectFilterRow({ selectedProjects, onSelectProjects, children }: Props) {
  const toggleProject = (id: string) => {
    onSelectProjects(
      selectedProjects.includes(id)
        ? selectedProjects.filter(x => x !== id)
        : [...selectedProjects, id]
    );
  };

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Obyekt</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[240px] justify-start text-left font-normal h-10 text-sm">
              <Filter className="h-3.5 w-3.5 text-muted-foreground mr-2" />
              {selectedProjects.length === 0
                ? <span className="text-muted-foreground">Barcha obyektlar</span>
                : `${selectedProjects.length} tanlangan`}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[260px] p-2 z-[200]" align="start">
            {MOCK_PROJECT_VENDOR_EXPENSES.map(p => (
              <label key={p.projectId} className="flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded cursor-pointer text-sm">
                <Checkbox
                  checked={selectedProjects.includes(p.projectId)}
                  onCheckedChange={() => toggleProject(p.projectId)}
                />
                <span className="w-2 h-2 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: p.projectColor }} />
                {p.projectName}
              </label>
            ))}
            {selectedProjects.length > 0 && (
              <Button variant="ghost" size="sm" className="w-full text-xs mt-1" onClick={() => onSelectProjects([])}>
                Tozalash
              </Button>
            )}
          </PopoverContent>
        </Popover>
      </div>
      {children}
    </div>
  );
}
