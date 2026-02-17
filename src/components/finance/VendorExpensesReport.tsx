import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, ArrowLeft, Phone, User, Folder, FolderOpen, FileText, Banknote, CalendarDays, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProjectVendorExpense, VendorExpense, VendorPayment } from '@/types/finance';
import { ProjectFilterRow } from './ProjectFilterRow';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('uz-UZ').format(amount) + ' UZS';
}

interface Props {
  data: ProjectVendorExpense[];
  selectedProject: string;
  onSelectProject: (value: string) => void;
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

export function VendorExpensesReport({ data, selectedProject, onSelectProject }: Props) {
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [openRequests, setOpenRequests] = useState<Set<string>>(new Set());
  const [paymentDialogData, setPaymentDialogData] = useState<VendorPayment[] | null>(null);

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

        {/* Column labels */}
        <div className="flex items-center gap-3 px-4 py-2 text-xs text-muted-foreground">
          <div className="w-5 shrink-0" />
          <div className="flex-1">Nomi</div>
          <div className="flex items-center gap-4 shrink-0">
            <span className="w-[100px] text-right">To'langan</span>
            <span className="w-[100px] text-right">Kutilmoqda</span>
            <span className="w-[100px] text-right font-medium">Umumiy</span>
          </div>
        </div>
        <div className="space-y-1">
          {vendors.map(({ vendor, projects }) => (
            <Card
              key={vendor.vendorId}
              className="cursor-pointer hover:bg-muted/30 transition-colors group"
              onClick={() => { setSelectedVendor(vendor.vendorId); setOpenRequests(new Set()); }}
            >
              <CardContent className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Folder className="h-5 w-5 text-primary shrink-0 group-hover:hidden" />
                  <FolderOpen className="h-5 w-5 text-primary shrink-0 hidden group-hover:block" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm truncate">{vendor.vendorName}</h3>
                      <span className="text-xs text-muted-foreground shrink-0">({vendor.requests.length})</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs shrink-0">
                    <span className="w-[100px] text-right font-medium">{formatCurrency(vendor.totalPaid)}</span>
                    <span className="w-[100px] text-right text-[hsl(var(--status-pending))]">
                      {vendor.totalPending > 0 ? formatCurrency(vendor.totalPending) : '—'}
                    </span>
                    <span className="w-[100px] text-right font-bold text-primary">{formatCurrency(vendor.totalPaid + vendor.totalPending)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
      <div className="space-y-3">
        {vendor.requests.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">So'rovlar mavjud emas</CardContent></Card>
        ) : (
          vendor.requests.map(request => {
            const isOpen = openRequests.has(request.requestId);
            return (
              <Collapsible key={request.requestId} open={isOpen} onOpenChange={() => toggleRequest(request.requestId)}>
                <Card className="overflow-hidden">
                  <div className="flex items-center">
                    <CollapsibleTrigger asChild>
                      <button className="flex-1 text-left">
                        <CardContent className="p-4 hover:bg-muted/30 transition-colors">
                          <div className="flex items-center gap-3">
                            {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                            <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-x-6 gap-y-2">
                              <div><p className="text-xs text-muted-foreground">Sana</p><p className="font-semibold text-sm">{request.date}</p></div>
                              <div><p className="text-xs text-muted-foreground">Manba</p><p className="font-semibold text-sm">{request.source}</p></div>
                              <div><p className="text-xs text-muted-foreground">Oluvchi</p><p className="font-semibold text-sm">{request.buyer}</p></div>
                              <div><p className="text-xs text-muted-foreground">Ta'minlovchi</p><p className="font-semibold text-sm">{request.supplier}</p></div>
                              <div><p className="text-xs text-muted-foreground">Jami</p><p className="font-semibold text-sm">{formatCurrency(request.totalAmount)}</p></div>
                              <div><p className="text-xs text-muted-foreground">To'langan</p><p className="font-semibold text-sm">{formatCurrency(request.paidAmount)}</p></div>
                              <div><p className="text-xs text-muted-foreground">Qoldiq</p><p className="font-semibold text-sm">{formatCurrency(request.remainingAmount)}</p></div>
                            </div>
                          </div>
                        </CardContent>
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
                    <CardContent className="p-0 pb-2 border-t">
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
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })
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
