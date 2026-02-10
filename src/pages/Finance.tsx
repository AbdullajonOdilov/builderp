import { useState, useMemo } from 'react';
import { FinanceSidebar, FinanceReportType } from '@/components/finance/FinanceSidebar';
import { VendorExpensesReport } from '@/components/finance/VendorExpensesReport';
import { ProjectOverviewReport } from '@/components/finance/ProjectOverviewReport';
import { ForemenReport } from '@/components/finance/ForemenReport';
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
      case 'vendor-expenses': return <VendorExpensesReport data={filteredProjects} selectedProject={selectedProject} onSelectProject={setSelectedProject} />;
      case 'project-overview': return <ProjectOverviewReport data={filteredProjects} />;
      case 'foremen': return <ForemenReport data={filteredProjects} selectedProject={selectedProject} onSelectProject={setSelectedProject} />;
    }
  };

  return (
    <div className="flex">
      <FinanceSidebar activeReport={activeReport} onSelectReport={setActiveReport} />
      <main className="flex-1 overflow-auto h-[calc(100vh-56px)]">
        <div className="p-6">
          {renderReport()}
        </div>
      </main>
    </div>
  );
}
