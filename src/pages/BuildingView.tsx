import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, FolderPlus, CalendarIcon, ClipboardList, Package, Users, DollarSign, TrendingUp, Wallet, Hammer, Wrench, Truck, HardHat, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FolderCard } from '@/components/buildings/FolderCard';
import { Progress } from '@/components/ui/progress';
import { DocumentCard } from '@/components/buildings/DocumentCard';
import { DocumentUpload } from '@/components/buildings/DocumentUpload';
import { BuildingBreadcrumbs } from '@/components/buildings/BuildingBreadcrumbs';
import { useBuildings } from '@/hooks/useBuildings';
import { useTasks } from '@/hooks/useTasks';
import { BuildingDocument } from '@/types/building';
import { MOCK_PROJECT_VENDOR_EXPENSES } from '@/types/finance';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const BuildingView = () => {
  const { buildingId } = useParams();
  const navigate = useNavigate();
  const { getBuilding, addSection, deleteSection, addDocumentToBuilding, updateBuilding } = useBuildings();
  const { tasks } = useTasks();
  
  const [showNewSection, setShowNewSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionStartDate, setNewSectionStartDate] = useState<Date | undefined>();
  const [newSectionEndDate, setNewSectionEndDate] = useState<Date | undefined>();
  const [newSectionPrice, setNewSectionPrice] = useState('');
  const [deleteSectionId, setDeleteSectionId] = useState<string | null>(null);

  const building = getBuilding(buildingId || '');

  const buildingTasks = useMemo(() => tasks.filter(t => t.buildingId === (building?.id || '')), [tasks, building?.id]);
  const taskStats = useMemo(() => {
    const totalTasks = buildingTasks.length;
    const totalSubResources = buildingTasks.reduce((sum, t) => sum + t.subResources.length, 0);
    const totalTaskBudget = buildingTasks.reduce((sum, t) => t.subResources.reduce((s, sr) => s + sr.totalPrice, sum), 0);
    // Category breakdown
    const categoryMap: Record<string, number> = {};
    buildingTasks.forEach(t => {
      t.subResources.forEach(sr => {
        categoryMap[sr.categoryName] = (categoryMap[sr.categoryName] || 0) + sr.totalPrice;
      });
    });
    return { totalTasks, totalSubResources, totalTaskBudget, categoryMap };
  }, [buildingTasks]);

  const resourceStats = useMemo(() => {
    const resourceMap: Record<string, { count: number; totalPrice: number }> = {};
    buildingTasks.forEach(t => {
      t.subResources.forEach(sr => {
        if (!resourceMap[sr.categoryName]) resourceMap[sr.categoryName] = { count: 0, totalPrice: 0 };
        resourceMap[sr.categoryName].count += 1;
        resourceMap[sr.categoryName].totalPrice += sr.totalPrice;
      });
    });
    const totalResources = buildingTasks.reduce((s, t) => s + t.subResources.length, 0);
    const totalResourceCost = buildingTasks.reduce((s, t) => t.subResources.reduce((a, sr) => a + sr.totalPrice, s), 0);
    return { totalResources, totalResourceCost, breakdown: resourceMap };
  }, [buildingTasks]);

  const vendorStats = useMemo(() => {
    const allVendors = MOCK_PROJECT_VENDOR_EXPENSES.flatMap(p => p.vendors);
    const uniqueVendors = new Set(allVendors.map(v => v.vendorId));
    const totalPaid = allVendors.reduce((s, v) => s + v.totalPaid, 0);
    const totalPending = allVendors.reduce((s, v) => s + v.totalPending, 0);
    const totalRequests = allVendors.reduce((s, v) => s + v.requests.length, 0);
    return { count: uniqueVendors.size, totalPaid, totalPending, totalRequests };
  }, []);

  if (!building) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Obyekt topilmadi</h2>
          <Button onClick={() => navigate('/buildings')}>Obyektlarga qaytish</Button>
        </div>
      </div>
    );
  }

  const handleCreateSection = () => {
    if (!newSectionName.trim()) {
      toast.error('Bo\'lim nomini kiriting');
      return;
    }
    addSection(building.id, newSectionName.trim(), {
      startDate: newSectionStartDate,
      expectedEndDate: newSectionEndDate,
      sectionPrice: newSectionPrice ? parseFloat(newSectionPrice) : undefined,
    });
    setNewSectionName('');
    setNewSectionStartDate(undefined);
    setNewSectionEndDate(undefined);
    setNewSectionPrice('');
    setShowNewSection(false);
    toast.success('Bo\'lim yaratildi');
  };

  const handleDeleteSection = () => {
    if (deleteSectionId) {
      deleteSection(building.id, deleteSectionId);
      setDeleteSectionId(null);
      toast.success('Bo\'lim o\'chirildi');
    }
  };

  const handleDocumentUpload = (doc: BuildingDocument) => {
    addDocumentToBuilding(building.id, doc);
    toast.success('Hujjat yuklandi');
  };

  const handleDocumentDelete = (docId: string) => {
    updateBuilding(building.id, {
      documents: building.documents.filter(d => d.id !== docId)
    });
  };

  const leftMoney = building.totalPrice - building.usedMoney;
  const completePercentage = building.totalPrice > 0 
    ? (building.usedMoney / building.totalPrice) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-6">
        {/* Breadcrumbs */}
        <BuildingBreadcrumbs items={[{ label: building.objectName }]} />

        {/* Header Info */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">{building.objectName}</h1>
              {building.contractNumber && (
                <p className="text-muted-foreground">Shartnoma: {building.contractNumber}</p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div>
                <p className="text-muted-foreground">Boshlanish</p>
                <p className="font-semibold">
                  {building.startDate ? format(new Date(building.startDate), "PP") : "—"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Tugash</p>
                <p className="font-semibold">
                  {building.expectedEndDate ? format(new Date(building.expectedEndDate), "PP") : "—"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Umumiy</p>
                <p className="font-semibold">${building.totalPrice.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Sarflangan</p>
                <p className="font-semibold">${building.usedMoney.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Kutilmoqda</p>
                <p className="font-semibold text-amber-600">${(building.pendingMoney || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Qoldiq</p>
                <p className={`font-semibold ${leftMoney >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                  ${leftMoney.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2 min-w-[140px]">
                <Progress 
                  value={Math.min(completePercentage, 100)} 
                  className="h-2 flex-1"
                  indicatorClassName={
                    completePercentage >= 90 ? 'bg-green-500' : 
                    completePercentage >= 20 ? 'bg-amber-500' : 
                    'bg-red-500'
                  }
                />
                <span className={`text-xs font-semibold whitespace-nowrap ${
                  completePercentage >= 90 ? 'text-green-600' : 
                  completePercentage >= 20 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {completePercentage.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Dashboard: 3 Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Ishlar */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-md bg-primary/10">
                <ClipboardList className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-sm font-semibold">Ishlar</h3>
              <span className="ml-auto text-xs text-muted-foreground">{taskStats.totalTasks} ta</span>
            </div>
            <p className="text-2xl font-bold mb-3">${taskStats.totalTaskBudget.toLocaleString()}</p>
            <div className="space-y-2">
              {Object.entries(taskStats.categoryMap).slice(0, 4).map(([cat, amount]) => (
                <div key={cat} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{cat}</span>
                  <span className="font-medium">${(amount as number).toLocaleString()}</span>
                </div>
              ))}
              {Object.keys(taskStats.categoryMap).length === 0 && (
                <p className="text-xs text-muted-foreground">Hali ishlar yo'q</p>
              )}
            </div>
          </Card>

          {/* Resurslar */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-md bg-amber-500/10">
                <Package className="h-4 w-4 text-amber-600" />
              </div>
              <h3 className="text-sm font-semibold">Resurslar</h3>
              <span className="ml-auto text-xs text-muted-foreground">{resourceStats.totalResources} ta</span>
            </div>
            <p className="text-2xl font-bold mb-3">${resourceStats.totalResourceCost.toLocaleString()}</p>
            <div className="space-y-2">
              {Object.entries(resourceStats.breakdown).map(([cat, data]) => {
                const categoryIcons: Record<string, React.ReactNode> = {
                  'Salary': <HardHat className="h-3 w-3" />,
                  'Material': <Package className="h-3 w-3" />,
                  'Instrument': <Wrench className="h-3 w-3" />,
                  'Techniques': <Truck className="h-3 w-3" />,
                  'Other': <MoreHorizontal className="h-3 w-3" />,
                };
                return (
                  <div key={cat} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      {categoryIcons[cat] || <Package className="h-3 w-3" />}
                      {cat}
                      <span className="text-[10px]">({data.count})</span>
                    </span>
                    <span className="font-medium">${data.totalPrice.toLocaleString()}</span>
                  </div>
                );
              })}
              {resourceStats.totalResources === 0 && (
                <p className="text-xs text-muted-foreground">Hali resurslar yo'q</p>
              )}
            </div>
          </Card>

          {/* Kontragentlar */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-md bg-green-500/10">
                <Users className="h-4 w-4 text-green-600" />
              </div>
              <h3 className="text-sm font-semibold">Kontragentlar</h3>
              <span className="ml-auto text-xs text-muted-foreground">{vendorStats.count} ta</span>
            </div>
            <p className="text-2xl font-bold mb-3">${(vendorStats.totalPaid + vendorStats.totalPending).toLocaleString()}</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">To'langan</span>
                <span className="font-medium text-green-600">${vendorStats.totalPaid.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Kutilmoqda</span>
                <span className="font-medium text-amber-600">${vendorStats.totalPending.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">So'rovlar</span>
                <span className="font-medium">{vendorStats.totalRequests} ta</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Sections */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Bo'limlar</h2>
            <Button onClick={() => setShowNewSection(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Yangi bo'lim
            </Button>
          </div>

          {building.sections.length === 0 ? (
            <Card 
              className="p-8 text-center border-2 border-dashed cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => setShowNewSection(true)}
            >
              <FolderPlus className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="font-medium">Bo'limlar hali yo'q</p>
              <p className="text-sm text-muted-foreground">Birinchi bo'limni yaratish uchun bosing</p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {building.sections.map((section) => (
                <FolderCard
                  key={section.id}
                  name={section.name}
                  subtitle={`${section.documents.length} hujjat`}
                  onClick={() => navigate(`/buildings/${building.id}/sections/${section.id}`)}
                  onDelete={() => setDeleteSectionId(section.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Documents */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Hujjatlar</h2>
          <DocumentUpload onUpload={handleDocumentUpload} className="mb-4" />
          {building.documents.length > 0 && (
            <div className="grid gap-2 md:grid-cols-2">
              {building.documents.map(doc => (
                <DocumentCard 
                  key={doc.id} 
                  document={doc} 
                  onDelete={() => handleDocumentDelete(doc.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Section Dialog */}
      <Dialog open={showNewSection} onOpenChange={setShowNewSection}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Yangi bo'lim</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sectionName">Bo'lim nomi *</Label>
              <Input
                id="sectionName"
                placeholder="e.g., Floor 1, Block A"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
              <Label>Boshlanish sanasi</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newSectionStartDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newSectionStartDate ? format(newSectionStartDate, "PP") : "Sana tanlang"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newSectionStartDate}
                      onSelect={setNewSectionStartDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Tugash sanasi</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newSectionEndDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newSectionEndDate ? format(newSectionEndDate, "PP") : "Sana tanlang"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newSectionEndDate}
                      onSelect={setNewSectionEndDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sectionPrice">Bo'lim narxi</Label>
              <Input
                id="sectionPrice"
                type="number"
                placeholder="e.g., 50000"
                value={newSectionPrice}
                onChange={(e) => setNewSectionPrice(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewSection(false)}>Bekor qilish</Button>
            <Button onClick={handleCreateSection}>Yaratish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Section Dialog */}
      <AlertDialog open={!!deleteSectionId} onOpenChange={() => setDeleteSectionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bo'limni o'chirish?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu bo'lim va uning barcha hujjatlari butunlay o'chiriladi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSection} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              O'chirish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BuildingView;
