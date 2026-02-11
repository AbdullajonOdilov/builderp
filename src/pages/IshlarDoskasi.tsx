import { useState } from 'react';
import { IshlarSidebar, IshlarReportType } from '@/components/ishlar/IshlarSidebar';

const IshlarDoskasi = () => {
  const [activeReport, setActiveReport] = useState<IshlarReportType>('overview');

  const renderContent = () => {
    switch (activeReport) {
      case 'overview':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Umumiy ko'rinish</h2>
            <p className="text-muted-foreground">Ishlar doskasi umumiy ko'rinishi</p>
          </div>
        );
      case 'active':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Faol ishlar</h2>
            <p className="text-muted-foreground">Hozirda bajarilayotgan ishlar</p>
          </div>
        );
      case 'completed':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Bajarilgan ishlar</h2>
            <p className="text-muted-foreground">Tugatilgan ishlar ro'yxati</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex">
      <IshlarSidebar activeReport={activeReport} onSelectReport={setActiveReport} />
      <main className="flex-1 p-6">
        {renderContent()}
      </main>
    </div>
  );
};

export default IshlarDoskasi;
