import { useState } from 'react';
import { ChevronDown, ChevronRight, Phone, User, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ProjectVendorExpense } from '@/types/finance';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

interface Props { data: ProjectVendorExpense[]; }

export function VendorExpensesReport({ data }: Props) {
  const [openProjects, setOpenProjects] = useState<Set<string>>(new Set([data[0]?.projectId]));

  const toggle = (id: string) => {
    setOpenProjects(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const grandTotalBudget = data.reduce((s, p) => s + p.totalBudget, 0);
  const grandTotalSpent = data.reduce((s, p) => s + p.totalSpent, 0);
  const grandTotalPending = data.reduce((s, p) => s + p.vendors.reduce((vs, v) => vs + v.totalPending, 0), 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Budget</p><p className="text-2xl font-bold mt-1">{formatCurrency(grandTotalBudget)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Spent</p><p className="text-2xl font-bold mt-1 text-primary">{formatCurrency(grandTotalSpent)}</p><p className="text-xs text-muted-foreground mt-1">{grandTotalBudget > 0 ? ((grandTotalSpent / grandTotalBudget) * 100).toFixed(1) : 0}% of budget</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Pending Payments</p><p className="text-2xl font-bold mt-1 text-[hsl(var(--status-pending))]">{formatCurrency(grandTotalPending)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Remaining Budget</p><p className="text-2xl font-bold mt-1 text-[hsl(var(--status-delivered))]">{formatCurrency(grandTotalBudget - grandTotalSpent)}</p></CardContent></Card>
      </div>

      {/* Per-Project Breakdown */}
      <div className="space-y-3">
        {data.map(project => {
          const isOpen = openProjects.has(project.projectId);
          const spentPercent = (project.totalSpent / project.totalBudget) * 100;
          const projectPending = project.vendors.reduce((s, v) => s + v.totalPending, 0);

          return (
            <Collapsible key={project.projectId} open={isOpen} onOpenChange={() => toggle(project.projectId)}>
              <Card className="overflow-hidden">
                <CollapsibleTrigger asChild>
                  <button className="w-full text-left">
                    <CardHeader className="p-4 pb-3 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: project.projectColor }} />
                        {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-4">
                            <CardTitle className="text-base truncate">{project.projectName}</CardTitle>
                            <div className="flex items-center gap-4 shrink-0 text-sm">
                              <span className="text-muted-foreground">{project.vendors.length} vendors</span>
                              <span className="font-semibold">{formatCurrency(project.totalSpent)}</span>
                              <span className="text-muted-foreground">/ {formatCurrency(project.totalBudget)}</span>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center gap-3">
                            <Progress value={spentPercent} className="h-2 flex-1" />
                            <span className="text-xs text-muted-foreground w-12 text-right">{spentPercent.toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="p-0 pb-2">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="pl-12">Vendor</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead className="text-right">Paid</TableHead>
                          <TableHead className="text-right">Pending</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead className="text-center">Invoices</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {project.vendors.map(vendor => (
                          <TableRow key={vendor.vendorId} className="hover:bg-muted/30">
                            <TableCell className="pl-12 font-medium">{vendor.vendorName}</TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-0.5">
                                <span className="text-xs flex items-center gap-1"><User className="h-3 w-3" />{vendor.contactPerson}</span>
                                <span className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" />{vendor.phone}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(vendor.totalPaid)}</TableCell>
                            <TableCell className="text-right">
                              {vendor.totalPending > 0 ? (
                                <Badge variant="outline" className="text-[hsl(var(--status-pending))] border-[hsl(var(--status-pending)/0.3)]">{formatCurrency(vendor.totalPending)}</Badge>
                              ) : <span className="text-muted-foreground text-xs">—</span>}
                            </TableCell>
                            <TableCell className="text-right font-semibold">{formatCurrency(vendor.totalPaid + vendor.totalPending)}</TableCell>
                            <TableCell className="text-center"><span className="text-xs flex items-center justify-center gap-1 text-muted-foreground"><FileText className="h-3 w-3" />{vendor.invoiceCount}</span></TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-muted/30 font-semibold hover:bg-muted/40">
                          <TableCell colSpan={2} className="pl-12 text-sm">Project Total</TableCell>
                          <TableCell className="text-right">{formatCurrency(project.totalSpent)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(projectPending)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(project.totalSpent + projectPending)}</TableCell>
                          <TableCell className="text-center text-xs">{project.vendors.reduce((s, v) => s + v.invoiceCount, 0)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}
