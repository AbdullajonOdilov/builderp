import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, FolderPlus, CalendarIcon, ClipboardList, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FolderCard } from '@/components/buildings/FolderCard';
import { Progress } from '@/components/ui/progress';
import { DocumentCard } from '@/components/buildings/DocumentCard';
import { DocumentUpload } from '@/components/buildings/DocumentUpload';
import { BuildingBreadcrumbs } from '@/components/buildings/BuildingBreadcrumbs';
import { useBuildings } from '@/hooks/useBuildings';
import BuildingFinanceReport from '@/components/buildings/BuildingFinanceReport';
import { useTasks } from '@/hooks/useTasks';
import { BuildingDocument } from '@/types/building';
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
    return { totalTasks, totalSubResources, totalTaskBudget };
  }, [buildingTasks]);


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

        {/* Tabs */}
        <Tabs defaultValue="bolimlar" className="w-full">
          <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b border-border rounded-none gap-0">
            <TabsTrigger value="hisobotlar" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5 text-sm">
              Hisobotlar
            </TabsTrigger>
            <TabsTrigger value="bolimlar" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5 text-sm">
              Bo'limlar
              <span className="ml-1.5 text-xs bg-muted text-muted-foreground rounded-full px-1.5 py-0.5">{building.sections.length}</span>
            </TabsTrigger>
            <TabsTrigger value="smeta" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5 text-sm">
              Smeta
            </TabsTrigger>
            <TabsTrigger value="ishlar" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5 text-sm">
              Ishlar doskasi
            </TabsTrigger>
            <TabsTrigger value="resurslar" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5 text-sm">
              Resurslar
            </TabsTrigger>
            <TabsTrigger value="hujjatlar" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5 text-sm">
              Hujjatlar
              <span className="ml-1.5 text-xs bg-muted text-muted-foreground rounded-full px-1.5 py-0.5">{building.documents.length}</span>
            </TabsTrigger>
          </TabsList>

          {/* Hisobotlar */}
          <TabsContent value="hisobotlar" className="mt-6">
            <BuildingFinanceReport
              totalPrice={building.totalPrice}
              usedMoney={building.usedMoney}
              pendingMoney={building.pendingMoney || 0}
            />
          </TabsContent>

          {/* Bo'limlar */}
          <TabsContent value="bolimlar" className="mt-6">
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
          </TabsContent>

          {/* Smeta */}
          <TabsContent value="smeta" className="mt-6">
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Smeta bo'limi tez orada qo'shiladi</p>
            </Card>
          </TabsContent>

          {/* Ishlar doskasi */}
          <TabsContent value="ishlar" className="mt-6">
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Ishlar doskasi tez orada qo'shiladi</p>
            </Card>
          </TabsContent>

          {/* Resurslar */}
          <TabsContent value="resurslar" className="mt-6">
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Resurslar bo'limi tez orada qo'shiladi</p>
            </Card>
          </TabsContent>

          {/* Hujjatlar */}
          <TabsContent value="hujjatlar" className="mt-6 space-y-8">
            {/* Shartnoma */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Shartnoma</h2>
              <div className="flex flex-wrap items-start gap-3">
                <DocumentUpload onUpload={handleDocumentUpload} accept=".pdf,.doc,.docx" label="File" />
                {building.documents.filter(d => d.name?.toLowerCase().includes('shartnoma') || d.type?.includes('pdf')).map(doc => (
                  <DocumentCard key={doc.id} document={doc} onDelete={() => handleDocumentDelete(doc.id)} />
                ))}
              </div>
            </div>

            <hr className="border-border" />

            {/* Fayllar */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Fayllar</h2>
              <div className="flex flex-wrap items-start gap-3">
                <DocumentUpload onUpload={handleDocumentUpload} label="File" />
                {building.documents.filter(d => !d.type?.startsWith('image/') && !d.type?.includes('pdf')).map(doc => (
                  <DocumentCard key={doc.id} document={doc} onDelete={() => handleDocumentDelete(doc.id)} />
                ))}
              </div>
            </div>

            <hr className="border-border" />

            {/* Rasmlar */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Rasmlar</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                <DocumentUpload onUpload={handleDocumentUpload} accept="image/*" label="File" />
                {building.documents.filter(d => d.type?.startsWith('image/')).map(doc => (
                  <div key={doc.id} className="group relative aspect-square rounded-xl overflow-hidden border border-border bg-muted/20">
                    {doc.url ? (
                      <img src={doc.url} alt={doc.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted/40">
                        <span className="text-xs text-muted-foreground truncate px-2">{doc.name}</span>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-xs text-white truncate">{doc.name}</p>
                    </div>
                    <button
                      onClick={() => handleDocumentDelete(doc.id)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
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
