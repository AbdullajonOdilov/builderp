import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ProjectVendorExpense } from '@/types/finance';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

interface Props {
  data: ProjectVendorExpense[];
}

export function ProjectOverviewReport({ data }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Project Budget Overview</h2>
      <div className="grid gap-4">
        {data.map(project => {
          const spentPct = (project.totalSpent / project.totalBudget) * 100;
          const remaining = project.totalBudget - project.totalSpent;
          const pending = project.vendors.reduce((s, v) => s + v.totalPending, 0);

          return (
            <Card key={project.projectId}>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.projectColor }} />
                  <h3 className="font-semibold">{project.projectName}</h3>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                  <div><p className="text-xs text-muted-foreground">Budget</p><p className="font-semibold">{formatCurrency(project.totalBudget)}</p></div>
                  <div><p className="text-xs text-muted-foreground">Spent</p><p className="font-semibold text-primary">{formatCurrency(project.totalSpent)}</p></div>
                  <div><p className="text-xs text-muted-foreground">Pending</p><p className="font-semibold text-[hsl(var(--status-pending))]">{formatCurrency(pending)}</p></div>
                  <div><p className="text-xs text-muted-foreground">Remaining</p><p className="font-semibold text-[hsl(var(--status-delivered))]">{formatCurrency(remaining)}</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={spentPct} className="h-2 flex-1" />
                  <span className="text-xs text-muted-foreground w-12 text-right">{spentPct.toFixed(0)}%</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
