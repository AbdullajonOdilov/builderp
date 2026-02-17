import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, ArrowLeft, Phone, User, Folder, FolderOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProjectVendorExpense, VendorExpense, VendorRequest } from '@/types/finance';
import { ProjectFilterRow } from './ProjectFilterRow';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('uz-UZ').format(amount) + ' UZS';
}

interface Props {
  data: ProjectVendorExpense[];
  selectedProject: string;
  onSelectProject: (value: string) => void;
}

// Aggregate vendors across projects
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
        };
        existing.projects.push(project.projectName);
      } else {
        map.set(vendor.vendorId, {
          vendor: { ...vendor, requests: [...vendor.requests] },
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

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Jami to'langan</p><p className="text-2xl font-bold mt-1">{formatCurrency(grandTotalPaid)}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Kutilmoqda</p><p className="text-2xl font-bold mt-1 text-[hsl(var(--status-pending))]">{formatCurrency(grandTotalPending)}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Ta'minotchilar soni</p><p className="text-2xl font-bold mt-1">{vendors.length}</p></CardContent></Card>
        </div>

        {/* Vendor Folders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendors.map(({ vendor, projects }) => (
            <Card
              key={vendor.vendorId}
              className="cursor-pointer hover:bg-muted/30 transition-colors group"
              onClick={() => { setSelectedVendor(vendor.vendorId); setOpenRequests(new Set()); }}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <Folder className="h-8 w-8 text-primary group-hover:hidden" />
                    <FolderOpen className="h-8 w-8 text-primary hidden group-hover:block" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base truncate">{vendor.vendorName}</h3>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{vendor.contactPerson}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span>{vendor.phone}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">To'langan:</span>
                      <span className="font-semibold">{formatCurrency(vendor.totalPaid)}</span>
                    </div>
                    {vendor.totalPending > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Kutilmoqda:</span>
                        <Badge variant="outline" className="text-[hsl(var(--status-pending))] border-[hsl(var(--status-pending)/0.3)]">
                          {formatCurrency(vendor.totalPending)}
                        </Badge>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">{vendor.requests.length} ta so'rov · {vendor.invoiceCount} ta hisob-faktura</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Vendor detail view — request history
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

      {/* Vendor summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Jami to'langan</p><p className="text-2xl font-bold mt-1">{formatCurrency(vendor.totalPaid)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Kutilmoqda</p><p className="text-2xl font-bold mt-1 text-[hsl(var(--status-pending))]">{formatCurrency(vendor.totalPending)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Qoldiq</p><p className="text-2xl font-bold mt-1 text-[hsl(var(--status-delivered))]">{formatCurrency(vendor.totalPaid + vendor.totalPending)}</p></CardContent></Card>
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
                  <CollapsibleTrigger asChild>
                    <button className="w-full text-left">
                      <CardContent className="p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3">
                          {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-x-6 gap-y-2">
                            <div>
                              <p className="text-xs text-muted-foreground">Sana</p>
                              <p className="font-semibold text-sm">{request.date}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Manba</p>
                              <p className="font-semibold text-sm">{request.source}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Oluvchi</p>
                              <p className="font-semibold text-sm">{request.buyer}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Ta'minlovchi</p>
                              <p className="font-semibold text-sm">{request.supplier}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Jami</p>
                              <p className="font-semibold text-sm">{formatCurrency(request.totalAmount)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">To'langan</p>
                              <p className="font-semibold text-sm">{formatCurrency(request.paidAmount)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Qoldiq</p>
                              <p className="font-semibold text-sm">{formatCurrency(request.remainingAmount)}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </button>
                  </CollapsibleTrigger>
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
    </div>
  );
}
