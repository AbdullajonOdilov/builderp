import { LayoutDashboard, ListChecks, CheckCircle2, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';

export type IshlarReportType = 'overview' | 'active' | 'completed';

interface IshlarSidebarProps {
  activeReport: IshlarReportType;
  onSelectReport: (report: IshlarReportType) => void;
}

const SECTIONS = [
  { id: 'overview' as const, label: 'Umumiy', icon: LayoutDashboard, description: 'Barcha ishlar ko\'rinishi' },
  { id: 'active' as const, label: 'Faol ishlar', icon: ListChecks, description: 'Bajarilayotgan ishlar' },
  { id: 'completed' as const, label: 'Bajarilgan', icon: CheckCircle2, description: 'Tugatilgan ishlar' },
];

export function IshlarSidebar({ activeReport, onSelectReport }: IshlarSidebarProps) {
  return (
    <aside className="w-64 shrink-0 border-r bg-sidebar h-[calc(100vh-56px)] sticky top-14">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary">
            <ClipboardList className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">Ishlar doskasi</h2>
            <p className="text-xs text-muted-foreground">Boshqaruv paneli</p>
          </div>
        </div>
      </div>

      <nav className="p-2 space-y-0.5">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">Bo'limlar</p>
        {SECTIONS.map(section => (
          <button
            key={section.id}
            onClick={() => onSelectReport(section.id)}
            className={cn(
              'w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-colors text-sm',
              activeReport === section.id
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <section.icon className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <div className="leading-tight">{section.label}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{section.description}</div>
            </div>
          </button>
        ))}
      </nav>
    </aside>
  );
}
