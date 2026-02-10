import { useState, useMemo } from 'react';
import { Filter } from 'lucide-react';
import { FinanceSidebar, FinanceReportType } from '@/components/finance/FinanceSidebar';
import { VendorExpensesReport } from '@/components/finance/VendorExpensesReport';
import { ProjectOverviewReport } from '@/components/finance/ProjectOverviewReport';
import { InventoryReport } from '@/components/finance/InventoryReport';
import { VendorComparisonReport } from '@/components/finance/VendorComparisonReport';
import { ForemenReport } from '@/components/finance/ForemenReport';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MOCK_PROJECT_VENDOR_EXPENSES } from '@/types/finance';

export default function Finance() {
  const [activeReport, setActiveReport] = useState<FinanceReportType>('vendor-expenses');
  const [selectedProject, setSelectedProject] = useState<string>('all');

  const filteredProjects = useMemo(() =>
    selectedProject === 'all'
      ? MOCK_PROJECT_VENDOR_EXPENSES
      : MOCK_PROJECT_VENDOR_EXPENSES.filter(p => p.projectId === selectedProject),
    [selectedProject]
  );

  const renderReport = () => {
    switch (activeReport) {
      case 'vendor-expenses': return <VendorExpensesReport data={filteredProjects} />;
      case 'project-overview': return <ProjectOverviewReport data={filteredProjects} />;
      case 'inventory': return <InventoryReport />;
      case 'vendor-comparison': return <VendorComparisonReport data={filteredProjects} />;
      case 'foremen': return <ForemenReport data={filteredProjects} />;
    }
  };

  return (
    <div className="flex">
      <FinanceSidebar activeReport={activeReport} onSelectReport={setActiveReport} />
      <main className="flex-1 overflow-auto h-[calc(100vh-56px)]">
        {/* Global filter bar */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-6 py-3 flex items-center gap-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-[260px]">
              <SelectValue placeholder="Filter by project" />
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

        <div className="p-6">
          {renderReport()}
        </div>
      </main>
    </div>
  );
}
