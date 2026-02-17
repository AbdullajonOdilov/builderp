import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, ArrowLeft, Eye, FileText, Folder, Plus, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ProjectVendorExpense, VendorExpense, VendorPayment } from '@/types/finance';
import { ProjectFilterRow } from './ProjectFilterRow';
import { VendorFormDialog, VendorFormData } from './VendorFormDialog';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('uz-UZ').format(amount) + ' UZS';
}

interface Props {
  data: ProjectVendorExpense[];
  selectedProject: string;
  onSelectProject: (value: string) => void;
  onAddVendor: (data: VendorFormData) => void;
  onEditVendor: (vendorId: string, data: VendorFormData) => void;
  onDeleteVendor: (vendorId: string) => void;
}

function aggregateVendors(data: ProjectVendorExpense[]) {
  const map = new Map<string, { vendor: VendorExpense; projects: string[] }>();
  for (const project of data) {
    for (const vendor of project.vendors) {
      const existing = map.get(vendor.vendorId);
      if (existing) {
        existing.vendor = {
          ...existing.vendor,
          totalPaid: existing.vendor.totalPaid + vendor.totalPaid,
          totalPending: existing.vendor.totalPending + vendor.totalPending,
          invoiceCount: existing.vendor.invoiceCount + vendor.invoiceCount,
          requests: [...existing.vendor.requests, ...vendor.requests],
          payments: [...existing.vendor.payments, ...vendor.payments],
        };
        existing.projects.push(project.projectName);
      } else {
        map.set(vendor.vendorId, {
          vendor: { ...vendor, requests: [...vendor.requests], payments: [...vendor.payments] },
          projects: [project.projectName],
        });
      }
    }
  }
  return Array.from(map.values());
}

export function VendorExpensesReport({ data, selectedProject, onSelectProject, onAddVendor, onEditVendor, onDeleteVendor }: Props) {
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [openRequests, setOpenRequests] = useState<Set<string>>(new Set());
  const [paymentDialogData, setPaymentDialogData] = useState<VendorPayment[] | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editVendor, setEditVendor] = useState<{ vendorId: string; data: VendorFormData } | null>(null);
  const [deleteVendorId, setDeleteVendorId] = useState<string | null>(null);

  const vendors = useMemo(() => aggregateVendors(data), [data]);

  const activeVendor = vendors.find(v => v.vendor.vendorId === selectedVendor);

  const toggleRequest = (id: string) => {
    setOpenRequests(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const grandTotalPaid = vendors.reduce((s, v) => s + v.vendor.totalPaid, 0);
  const grandTotalPending = vendors.reduce((s, v) => s + v.vendor.totalPending, 0);

  // Vendor list view
  if (!selectedVendor || !activeVendor) {
    return (
      <div className="space-y-6">
        <ProjectFilterRow selectedProject={selectedProject} onSelectProject={onSelectProject} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Jami to'langan</p><p className="text-2xl font-bold mt-1">{formatCurrency(grandTotalPaid)}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Kutilmoqda</p><p className="text-2xl font-bold mt-1 text-[hsl(var(--status-pending))]">{formatCurrency(grandTotalPending)}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Ta'minotchilar soni</p><p className="text-2xl font-bold mt-1">{vendors.length}</p></CardContent></Card>
        </div>

        <div className="flex justify-end">
          <Button size="sm" onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Kontragent qo'shish
          </Button>
        </div>

        <div className="border rounded-lg">
          {/* Header */}
          <div className="flex items-center px-4 py-2 border-b bg-muted/30">
            <div className="w-8 shrink-0" />
            <div className="flex-1 grid grid-cols-7 gap-x-4">
              <p className="text-xs text-muted-foreground col-span-2">Nomi</p>
              <p className="text-xs text-muted-foreground">So'rovlar</p>
              <p className="text-xs text-muted-foreground">Kontakt</p>
              <p className="text-xs text-muted-foreground">Telefon</p>
              <p className="text-xs text-muted-foreground text-right">Jami (T)</p>
              <p className="text-xs text-muted-foreground text-right">Berilgan</p>
            </div>
            <p className="text-xs text-muted-foreground text-right w-[100px] shrink-0">Qarz</p>
            <div className="w-[72px] shrink-0" />
          </div>
          <div className="divide-y">
          {vendors.map(({ vendor, projects }) => (
            <div
              key={vendor.vendorId}
              className="flex items-center px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors group"
              onClick={() => { setSelectedVendor(vendor.vendorId); setOpenRequests(new Set()); }}
            >
              <Folder className="h-5 w-5 text-blue-500 shrink-0 mr-3 fill-blue-500/20" />
              <div className="flex-1 grid grid-cols-7 gap-x-4 items-center">
                <h3 className="font-bold text-sm truncate col-span-2">{vendor.vendorName}</h3>
                <span className="text-sm">{vendor.requests.length} ta</span>
                <span className="text-sm truncate">{vendor.contactPerson}</span>
                <span className="text-sm text-muted-foreground">{vendor.phone}</span>
                <span className="text-sm font-medium text-right">{formatCurrency(vendor.totalPaid + vendor.totalPending)}</span>
                <span className="text-sm text-right">{formatCurrency(vendor.totalPaid)}</span>
              </div>
              <span className="text-sm font-medium text-right w-[100px] shrink-0 text-[hsl(var(--status-pending))]">
                {vendor.totalPending > 0 ? formatCurrency(vendor.totalPending) : '—'}
              </span>
              <div className="flex shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => {
                  e.stopPropagation();
                  setEditVendor({ vendorId: vendor.vendorId, data: { vendorName: vendor.vendorName, contactPerson: vendor.contactPerson, phone: vendor.phone } });
                }}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => {
                  e.stopPropagation();
                  setDeleteVendorId(vendor.vendorId);
                }}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
          </div>
        </div>

        {/* Add Vendor Dialog */}
        <VendorFormDialog
          open={addDialogOpen}
          onClose={() => setAddDialogOpen(false)}
          onSubmit={onAddVendor}
          title="Yangi kontragent"
        />

        {/* Edit Vendor Dialog */}
        <VendorFormDialog
          open={!!editVendor}
          onClose={() => setEditVendor(null)}
          onSubmit={(data) => { if (editVendor) onEditVendor(editVendor.vendorId, data); }}
          initialData={editVendor?.data}
          title="Kontragentni tahrirlash"
        />

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteVendorId} onOpenChange={() => setDeleteVendorId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Kontragentni o'chirish</AlertDialogTitle>
              <AlertDialogDescription>
                Haqiqatan ham bu kontragentni o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
              <AlertDialogAction onClick={() => { if (deleteVendorId) { onDeleteVendor(deleteVendorId); setDeleteVendorId(null); } }}>
                O'chirish
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // Vendor detail view
  const { vendor } = activeVendor;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setSelectedVendor(null)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-xl font-bold">{vendor.vendorName}</h2>
          <p className="text-sm text-muted-foreground">{vendor.contactPerson} · {vendor.phone}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Jami to'langan</p><p className="text-2xl font-bold mt-1">{formatCurrency(vendor.totalPaid)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Kutilmoqda</p><p className="text-2xl font-bold mt-1 text-[hsl(var(--status-pending))]">{formatCurrency(vendor.totalPending)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Umumiy</p><p className="text-2xl font-bold mt-1 text-primary">{formatCurrency(vendor.totalPaid + vendor.totalPending)}</p></CardContent></Card>
      </div>

      {/* Requests list */}
      <div className="border rounded-lg">
        {vendor.requests.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">So'rovlar mavjud emas</div>
        ) : (
          <>
            {/* Single header row */}
            <div className="flex items-center px-4 py-2 border-b bg-muted/30">
              <div className="w-7 shrink-0" />
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-x-6 gap-y-1">
                <p className="text-xs text-muted-foreground">Sana</p>
                <p className="text-xs text-muted-foreground">Manba</p>
                <p className="text-xs text-muted-foreground">Oluvchi</p>
                <p className="text-xs text-muted-foreground">Ta'minlovchi</p>
                <p className="text-xs text-muted-foreground">Jami</p>
                <p className="text-xs text-muted-foreground">To'langan</p>
                <p className="text-xs text-muted-foreground">Qoldiq</p>
              </div>
              <div className="w-9 shrink-0" />
            </div>
            <div className="divide-y">
            {vendor.requests.map(request => {
              const isOpen = openRequests.has(request.requestId);
              return (
                <Collapsible key={request.requestId} open={isOpen} onOpenChange={() => toggleRequest(request.requestId)}>
                  <div className="flex items-center">
                    <CollapsibleTrigger asChild>
                      <button className="flex-1 text-left px-4 py-3 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3">
                          {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-x-6 gap-y-2">
                            <p className="font-bold text-sm">{request.date}</p>
                            <p className="font-bold text-sm">{request.source}</p>
                            <p className="font-bold text-sm">{request.buyer}</p>
                            <p className="font-bold text-sm">{request.supplier}</p>
                            <p className="font-bold text-sm">{formatCurrency(request.totalAmount)}</p>
                            <p className="font-bold text-sm">{formatCurrency(request.paidAmount)}</p>
                            <p className="font-bold text-sm">{formatCurrency(request.remainingAmount)}</p>
                          </div>
                        </div>
                      </button>
                    </CollapsibleTrigger>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="mr-2 shrink-0"
                    onClick={(e) => { e.stopPropagation(); setPaymentDialogData(vendor.payments); }}
                  >
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
                <CollapsibleContent>
                  <div className="p-0 pb-2 border-t">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="pl-10 w-12">№</TableHead>
                          <TableHead>Kod</TableHead>
                          <TableHead>Nomi</TableHead>
                          <TableHead>Birlik</TableHead>
                          <TableHead className="text-right">So'rov miqdori</TableHead>
                          <TableHead className="text-right">Berilgan</TableHead>
                          <TableHead className="text-right">Birlik narx</TableHead>
                          <TableHead className="text-right">Umumiy narx</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {request.items.map((item, idx) => (
                          <TableRow key={idx} className="hover:bg-muted/30">
                            <TableCell className="pl-10">{idx + 1}</TableCell>
                            <TableCell className="font-mono text-xs">{item.code}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.unit}</TableCell>
                            <TableCell className="text-right">{item.requestedQty.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{item.givenQty.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{item.unitPrice.toLocaleString()}</TableCell>
                            <TableCell className="text-right font-semibold">{item.totalPrice.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
            </div>
          </>
        )}
      </div>

      {/* Payment History Dialog */}
      <Dialog open={!!paymentDialogData} onOpenChange={() => setPaymentDialogData(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>To'lovlar tarixi</DialogTitle>
          </DialogHeader>
          {paymentDialogData && paymentDialogData.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">To'lovlar mavjud emas</p>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {paymentDialogData?.sort((a, b) => b.date.localeCompare(a.date)).map((p, idx) => (
                <div key={p.paymentId} className="flex items-start gap-3 p-3 rounded-md border">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{p.date}</span>
                      <span className="font-semibold text-sm">{formatCurrency(p.amount)}</span>
                    </div>
                    <p className="text-sm">{p.paidBy}</p>
                    <p className="text-xs text-muted-foreground">{p.comment}</p>
                    {p.fileName && (
                      <Badge variant="outline" className="gap-1 text-xs mt-1">
                        <FileText className="h-3 w-3" />
                        {p.fileName}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
