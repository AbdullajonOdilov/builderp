import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MOCK_INVENTORY } from '@/types/finance';

export function InventoryReport() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Inventory Status</h2>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resource</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead className="text-right">Received</TableHead>
                <TableHead className="text-right">Used</TableHead>
                <TableHead className="text-right">In Warehouse</TableHead>
                <TableHead className="text-right">Need to Finish</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_INVENTORY.map(item => {
                const shortage = item.neededToFinish - item.inWarehouse;
                return (
                  <TableRow key={item.resourceCode}>
                    <TableCell className="font-medium">{item.resourceName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">{item.resourceCode}</TableCell>
                    <TableCell className="text-sm">{item.vendorName}</TableCell>
                    <TableCell className="text-right">{item.totalReceived.toLocaleString()} {item.unit}</TableCell>
                    <TableCell className="text-right">{item.usedOnSite.toLocaleString()} {item.unit}</TableCell>
                    <TableCell className="text-right font-medium">{item.inWarehouse.toLocaleString()} {item.unit}</TableCell>
                    <TableCell className="text-right">{item.neededToFinish.toLocaleString()} {item.unit}</TableCell>
                    <TableCell>
                      {shortage > 0 ? (
                        <Badge variant="destructive" className="text-[10px]">Need {shortage.toLocaleString()} {item.unit}</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-[hsl(var(--status-delivered))] border-[hsl(var(--status-delivered)/0.3)]">Sufficient</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
