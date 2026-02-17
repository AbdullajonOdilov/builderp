import { useState, useMemo } from 'react';
import { FinanceSidebar, FinanceReportType } from '@/components/finance/FinanceSidebar';
import { VendorExpensesReport } from '@/components/finance/VendorExpensesReport';
import { ProjectOverviewReport } from '@/components/finance/ProjectOverviewReport';
import { ForemenReport } from '@/components/finance/ForemenReport';
import { MOCK_PROJECT_VENDOR_EXPENSES, ProjectVendorExpense } from '@/types/finance';
import { VendorFormData } from '@/components/finance/VendorFormDialog';

export default function Finance() {
  const [activeReport, setActiveReport] = useState<FinanceReportType>('vendor-expenses');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [projects, setProjects] = useState<ProjectVendorExpense[]>(MOCK_PROJECT_VENDOR_EXPENSES);

  const filteredProjects = useMemo(() =>
    selectedProject === 'all'
      ? projects
      : projects.filter(p => p.projectId === selectedProject),
    [selectedProject, projects]
  );

  const handleAddVendor = (data: VendorFormData) => {
    const newVendor = {
      vendorId: `v-${Date.now()}`,
      vendorName: data.vendorName,
      contactPerson: data.contactPerson,
      phone: data.phone,
      totalPaid: 0,
      totalPending: 0,
      invoiceCount: 0,
      requests: [],
      payments: [],
    };
    // Add to first project (or all projects)
    setProjects(prev => prev.map((p, i) => i === 0 ? { ...p, vendors: [...p.vendors, newVendor] } : p));
  };

  const handleEditVendor = (vendorId: string, data: VendorFormData) => {
    setProjects(prev => prev.map(p => ({
      ...p,
      vendors: p.vendors.map(v => v.vendorId === vendorId
        ? { ...v, vendorName: data.vendorName, contactPerson: data.contactPerson, phone: data.phone }
        : v
      ),
    })));
  };

  const handleDeleteVendor = (vendorId: string) => {
    setProjects(prev => prev.map(p => ({
      ...p,
      vendors: p.vendors.filter(v => v.vendorId !== vendorId),
    })));
  };

  const renderReport = () => {
    switch (activeReport) {
      case 'vendor-expenses': return (
        <VendorExpensesReport
          data={filteredProjects}
          selectedProject={selectedProject}
          onSelectProject={setSelectedProject}
          onAddVendor={handleAddVendor}
          onEditVendor={handleEditVendor}
          onDeleteVendor={handleDeleteVendor}
        />
      );
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
