import { useState } from 'react';
import { FinanceSidebar, FinanceReportType } from '@/components/finance/FinanceSidebar';
import { VendorExpensesReport } from '@/components/finance/VendorExpensesReport';
import { ProjectOverviewReport } from '@/components/finance/ProjectOverviewReport';
import { InventoryReport } from '@/components/finance/InventoryReport';
import { VendorComparisonReport } from '@/components/finance/VendorComparisonReport';

export default function Finance() {
  const [activeReport, setActiveReport] = useState<FinanceReportType>('vendor-expenses');

  const renderReport = () => {
    switch (activeReport) {
      case 'vendor-expenses': return <VendorExpensesReport />;
      case 'project-overview': return <ProjectOverviewReport />;
      case 'inventory': return <InventoryReport />;
      case 'vendor-comparison': return <VendorComparisonReport />;
    }
  };

  return (
    <div className="flex">
      <FinanceSidebar activeReport={activeReport} onSelectReport={setActiveReport} />
      <main className="flex-1 p-6 overflow-auto h-[calc(100vh-56px)]">
        {renderReport()}
      </main>
    </div>
  );
}
