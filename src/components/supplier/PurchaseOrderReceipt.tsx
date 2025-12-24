import { useRef } from 'react';
import { ResourceRequest, Vendor, VENDORS } from '@/types/request';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Printer, X } from 'lucide-react';

interface PurchaseOrderReceiptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseId: string;
  vendorId: string;
  requests: ResourceRequest[];
  lineItems: Record<string, { unitPrice: number; givenAmount: number }>;
  deliveryDate: string;
  notes?: string;
  createdAt: string;
}

// Company info - in real app, this would come from settings/config
const COMPANY_INFO = {
  name: 'Your Construction Company Ltd.',
  address: '123 Business Street, City, State 12345',
  phone: '+1 555-1234',
  email: 'procurement@yourcompany.com',
  taxId: 'TAX-123456789',
};

export function PurchaseOrderReceipt({
  open,
  onOpenChange,
  purchaseId,
  vendorId,
  requests,
  lineItems,
  deliveryDate,
  notes,
  createdAt,
}: PurchaseOrderReceiptProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const vendor = VENDORS.find((v) => v.id === vendorId) as Vendor | undefined;

  const grandTotal = requests.reduce((sum, req) => {
    const item = lineItems[req.id];
    return sum + (item ? item.unitPrice * item.givenAmount : 0);
  }, 0);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Purchase Order - ${purchaseId}</title>
          <style>
            @page {
              size: A4;
              margin: 15mm;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Arial', sans-serif;
              font-size: 11px;
              line-height: 1.4;
              color: #1a1a1a;
              background: white;
            }
            .receipt-container {
              width: 210mm;
              min-height: 297mm;
              padding: 15mm;
              margin: 0 auto;
              background: white;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 2px solid #2563eb;
            }
            .company-logo h1 {
              font-size: 20px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 5px;
            }
            .company-logo p {
              font-size: 10px;
              color: #666;
            }
            .po-title {
              text-align: right;
            }
            .po-title h2 {
              font-size: 24px;
              font-weight: bold;
              color: #1a1a1a;
              margin-bottom: 5px;
            }
            .po-title .po-number {
              font-size: 14px;
              color: #2563eb;
              font-weight: 600;
            }
            .po-title .po-date {
              font-size: 10px;
              color: #666;
              margin-top: 5px;
            }
            .parties-section {
              display: flex;
              justify-content: space-between;
              margin-bottom: 25px;
              gap: 30px;
            }
            .party-box {
              flex: 1;
              padding: 15px;
              border: 1px solid #e5e7eb;
              border-radius: 6px;
              background: #f9fafb;
            }
            .party-box h3 {
              font-size: 11px;
              font-weight: 600;
              color: #2563eb;
              margin-bottom: 10px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .party-box p {
              font-size: 11px;
              margin-bottom: 3px;
            }
            .party-box .company-name {
              font-weight: 600;
              font-size: 13px;
              margin-bottom: 8px;
            }
            .delivery-info {
              display: flex;
              gap: 30px;
              margin-bottom: 20px;
              padding: 12px 15px;
              background: #eff6ff;
              border-radius: 6px;
            }
            .delivery-info div {
              flex: 1;
            }
            .delivery-info label {
              font-size: 9px;
              color: #666;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .delivery-info span {
              display: block;
              font-size: 12px;
              font-weight: 600;
              color: #1a1a1a;
              margin-top: 3px;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .items-table th {
              background: #2563eb;
              color: white;
              padding: 10px 8px;
              text-align: left;
              font-size: 10px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .items-table th:first-child {
              border-radius: 4px 0 0 0;
            }
            .items-table th:last-child {
              border-radius: 0 4px 0 0;
              text-align: right;
            }
            .items-table td {
              padding: 10px 8px;
              border-bottom: 1px solid #e5e7eb;
              font-size: 11px;
            }
            .items-table td:last-child {
              text-align: right;
            }
            .items-table tr:nth-child(even) {
              background: #f9fafb;
            }
            .item-name {
              font-weight: 500;
            }
            .item-project {
              font-size: 9px;
              color: #666;
              margin-top: 2px;
            }
            .totals-section {
              display: flex;
              justify-content: flex-end;
              margin-bottom: 30px;
            }
            .totals-box {
              width: 250px;
              border: 1px solid #e5e7eb;
              border-radius: 6px;
              overflow: hidden;
            }
            .totals-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 12px;
              font-size: 11px;
            }
            .totals-row.grand-total {
              background: #2563eb;
              color: white;
              font-weight: bold;
              font-size: 14px;
            }
            .notes-section {
              margin-bottom: 30px;
              padding: 15px;
              background: #f9fafb;
              border-radius: 6px;
              border-left: 3px solid #2563eb;
            }
            .notes-section h4 {
              font-size: 10px;
              font-weight: 600;
              color: #666;
              margin-bottom: 8px;
              text-transform: uppercase;
            }
            .notes-section p {
              font-size: 11px;
              color: #1a1a1a;
            }
            .signatures-section {
              display: flex;
              justify-content: space-between;
              gap: 40px;
              margin-top: 40px;
              padding-top: 20px;
            }
            .signature-box {
              flex: 1;
              text-align: center;
            }
            .signature-box h4 {
              font-size: 10px;
              font-weight: 600;
              color: #666;
              margin-bottom: 50px;
              text-transform: uppercase;
            }
            .signature-line {
              border-top: 1px solid #1a1a1a;
              padding-top: 8px;
              margin-bottom: 5px;
            }
            .signature-label {
              font-size: 10px;
              color: #666;
            }
            .signature-name {
              font-size: 11px;
              font-weight: 500;
              margin-top: 3px;
            }
            .stamp-box {
              flex: 1;
              text-align: center;
            }
            .stamp-box h4 {
              font-size: 10px;
              font-weight: 600;
              color: #666;
              margin-bottom: 15px;
              text-transform: uppercase;
            }
            .stamp-area {
              width: 120px;
              height: 120px;
              margin: 0 auto;
              border: 2px dashed #d1d5db;
              border-radius: 6px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .stamp-area span {
              font-size: 9px;
              color: #9ca3af;
            }
            .footer {
              margin-top: 30px;
              padding-top: 15px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              font-size: 9px;
              color: #9ca3af;
            }
            .terms {
              margin-top: 20px;
              padding: 10px 15px;
              background: #fef3c7;
              border-radius: 6px;
              font-size: 9px;
              color: #92400e;
            }
            .terms h5 {
              font-weight: 600;
              margin-bottom: 5px;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Purchase Order Receipt</DialogTitle>
          <div className="flex items-center gap-2">
            <Button onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
        </DialogHeader>

        {/* Printable Content */}
        <div ref={printRef} className="bg-white p-6 text-foreground">
          <div className="receipt-container">
            {/* Header */}
            <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-primary">
              <div>
                <h1 className="text-xl font-bold text-primary">{COMPANY_INFO.name}</h1>
                <p className="text-xs text-muted-foreground">{COMPANY_INFO.address}</p>
                <p className="text-xs text-muted-foreground">Tel: {COMPANY_INFO.phone} | Email: {COMPANY_INFO.email}</p>
                <p className="text-xs text-muted-foreground">Tax ID: {COMPANY_INFO.taxId}</p>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold">PURCHASE ORDER</h2>
                <p className="text-sm font-semibold text-primary">PO-{purchaseId.slice(0, 8).toUpperCase()}</p>
                <p className="text-xs text-muted-foreground mt-1">Date: {formatDate(createdAt)}</p>
              </div>
            </div>

            {/* Parties Section */}
            <div className="flex gap-6 mb-6">
              <div className="flex-1 p-4 border rounded-md bg-muted/30">
                <h3 className="text-xs font-semibold text-primary uppercase mb-3 tracking-wide">Buyer (Our Company)</h3>
                <p className="font-semibold text-sm mb-2">{COMPANY_INFO.name}</p>
                <p className="text-xs">{COMPANY_INFO.address}</p>
                <p className="text-xs">Tel: {COMPANY_INFO.phone}</p>
                <p className="text-xs">Email: {COMPANY_INFO.email}</p>
              </div>
              <div className="flex-1 p-4 border rounded-md bg-muted/30">
                <h3 className="text-xs font-semibold text-primary uppercase mb-3 tracking-wide">Vendor (Supplier)</h3>
                {vendor ? (
                  <>
                    <p className="font-semibold text-sm mb-2">{vendor.name}</p>
                    <p className="text-xs">Contact: {vendor.contact}</p>
                    <p className="text-xs">Tel: {vendor.phone}</p>
                    <p className="text-xs">Email: {vendor.email}</p>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">Vendor not found</p>
                )}
              </div>
            </div>

            {/* Delivery Info */}
            <div className="flex gap-6 mb-6 p-3 bg-primary/5 rounded-md">
              <div className="flex-1">
                <label className="text-[9px] text-muted-foreground uppercase tracking-wide">Order Date</label>
                <span className="block text-sm font-semibold">{formatDate(createdAt)}</span>
              </div>
              <div className="flex-1">
                <label className="text-[9px] text-muted-foreground uppercase tracking-wide">Expected Delivery</label>
                <span className="block text-sm font-semibold">{formatDate(deliveryDate)}</span>
              </div>
              <div className="flex-1">
                <label className="text-[9px] text-muted-foreground uppercase tracking-wide">Payment Terms</label>
                <span className="block text-sm font-semibold">Net 30</span>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full border-collapse mb-6">
              <thead>
                <tr className="bg-primary text-primary-foreground">
                  <th className="p-2 text-left text-[10px] font-semibold uppercase rounded-tl-md">#</th>
                  <th className="p-2 text-left text-[10px] font-semibold uppercase">Description</th>
                  <th className="p-2 text-center text-[10px] font-semibold uppercase">Quantity</th>
                  <th className="p-2 text-center text-[10px] font-semibold uppercase">Unit</th>
                  <th className="p-2 text-right text-[10px] font-semibold uppercase">Unit Price</th>
                  <th className="p-2 text-right text-[10px] font-semibold uppercase rounded-tr-md">Total</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req, index) => {
                  const item = lineItems[req.id] || { unitPrice: 0, givenAmount: req.quantity };
                  const total = item.unitPrice * item.givenAmount;
                  return (
                    <tr key={req.id} className={index % 2 === 0 ? 'bg-muted/20' : ''}>
                      <td className="p-2 border-b text-xs">{index + 1}</td>
                      <td className="p-2 border-b">
                        <span className="text-xs font-medium">{req.resourceName}</span>
                        {req.projectName && (
                          <span className="block text-[9px] text-muted-foreground">Project: {req.projectName}</span>
                        )}
                      </td>
                      <td className="p-2 border-b text-center text-xs">{item.givenAmount}</td>
                      <td className="p-2 border-b text-center text-xs">{req.unit}</td>
                      <td className="p-2 border-b text-right text-xs">${item.unitPrice.toFixed(2)}</td>
                      <td className="p-2 border-b text-right text-xs font-medium">${total.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mb-6">
              <div className="w-64 border rounded-md overflow-hidden">
                <div className="flex justify-between p-2 text-xs">
                  <span>Subtotal</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between p-2 text-xs border-t">
                  <span>Tax (0%)</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between p-3 bg-primary text-primary-foreground font-bold">
                  <span>Grand Total</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {notes && (
              <div className="mb-6 p-4 bg-muted/30 rounded-md border-l-4 border-primary">
                <h4 className="text-[10px] font-semibold text-muted-foreground uppercase mb-2">Notes</h4>
                <p className="text-xs">{notes}</p>
              </div>
            )}

            {/* Terms */}
            <div className="mb-6 p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-md">
              <h5 className="text-[9px] font-semibold text-yellow-800 dark:text-yellow-200 mb-1">Terms & Conditions</h5>
              <p className="text-[9px] text-yellow-700 dark:text-yellow-300">
                1. Goods must be delivered as per the agreed schedule. 2. All items must meet quality specifications. 
                3. Payment will be processed within 30 days of receipt. 4. This PO is subject to our standard terms.
              </p>
            </div>

            {/* Signatures Section */}
            <div className="flex justify-between gap-8 mt-10 pt-6">
              {/* Supplier Signature */}
              <div className="flex-1 text-center">
                <h4 className="text-[10px] font-semibold text-muted-foreground uppercase mb-12">Supplier Representative</h4>
                <div className="border-t border-foreground pt-2 mb-1">
                  <span className="text-[10px] text-muted-foreground">Signature</span>
                </div>
                <p className="text-xs font-medium mt-2">Name: _______________________</p>
                <p className="text-xs mt-2">Date: _______________________</p>
              </div>

              {/* Warehouseman Signature */}
              <div className="flex-1 text-center">
                <h4 className="text-[10px] font-semibold text-muted-foreground uppercase mb-12">Warehouseman</h4>
                <div className="border-t border-foreground pt-2 mb-1">
                  <span className="text-[10px] text-muted-foreground">Signature</span>
                </div>
                <p className="text-xs font-medium mt-2">Name: _______________________</p>
                <p className="text-xs mt-2">Date: _______________________</p>
              </div>

              {/* Vendor Stamp */}
              <div className="flex-1 text-center">
                <h4 className="text-[10px] font-semibold text-muted-foreground uppercase mb-4">Vendor Company Stamp</h4>
                <div className="w-28 h-28 mx-auto border-2 border-dashed border-muted-foreground/40 rounded-md flex items-center justify-center">
                  <span className="text-[9px] text-muted-foreground">Company Stamp</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t text-center">
              <p className="text-[9px] text-muted-foreground">
                This is an official purchase order document. Please sign and return a copy for our records.
              </p>
              <p className="text-[9px] text-muted-foreground mt-1">
                Generated on {new Date().toLocaleDateString()} | {COMPANY_INFO.name}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
