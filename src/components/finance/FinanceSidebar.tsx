import { DollarSign, Building2, Users, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FinanceReportType = 'vendor-expenses' | 'project-overview' | 'foremen';

interface FinanceSidebarProps {
  activeReport: FinanceReportType;
  onSelectReport: (report: FinanceReportType) => void;
}

const REPORTS = [
  { id: 'vendor-expenses' as const, label: 'Vendor Expenses', icon: Users, description: 'Per-project vendor breakdown' },
  { id: 'foremen' as const, label: 'Foremen', icon: FileText, description: 'Work & advances by foreman' },
  { id: 'project-overview' as const, label: 'Project Overview', icon: Building2, description: 'Budget vs spending' },
];

export function FinanceSidebar({ activeReport, onSelectReport }: FinanceSidebarProps) {
  return (
    <aside className="w-64 shrink-0 border-r bg-sidebar h-[calc(100vh-56px)] sticky top-14">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary">
            <DollarSign className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">Finance</h2>
            <p className="text-xs text-muted-foreground">Reports & Analytics</p>
          </div>
        </div>
      </div>

      <nav className="p-2 space-y-0.5">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">Reports</p>
        {REPORTS.map(report => (
          <button
            key={report.id}
            onClick={() => onSelectReport(report.id)}
            className={cn(
              'w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-colors text-sm',
              activeReport === report.id
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <report.icon className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <div className="leading-tight">{report.label}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{report.description}</div>
            </div>
          </button>
        ))}
      </nav>
    </aside>
  );
}
