export interface RequestItem {
  code: string;
  name: string;
  unit: string;
  requestedQty: number;
  givenQty: number;
  unitPrice: number;
  totalPrice: number;
}

export interface VendorRequest {
  requestId: string;
  date: string;
  source: string;       // Manba
  buyer: string;         // Oluvchi
  supplier: string;      // Ta'minlovchi
  totalAmount: number;   // Jami
  paidAmount: number;    // To'langan
  remainingAmount: number; // Qoldiq
  items: RequestItem[];
}

export interface VendorExpense {
  vendorId: string;
  vendorName: string;
  contactPerson: string;
  phone: string;
  totalPaid: number;
  totalPending: number;
  invoiceCount: number;
  requests: VendorRequest[];
}

export interface ProjectVendorExpense {
  projectId: string;
  projectName: string;
  projectColor: string;
  totalBudget: number;
  totalSpent: number;
  vendors: VendorExpense[];
}

export interface InventoryItem {
  resourceName: string;
  resourceCode: string;
  unit: string;
  totalReceived: number;
  usedOnSite: number;
  inWarehouse: number;
  neededToFinish: number;
  vendorName: string;
}

export interface ProjectFinancialSummary {
  projectId: string;
  projectName: string;
  projectColor: string;
  totalBudget: number;
  totalSpent: number;
  totalPending: number;
  vendorCount: number;
  inventoryValue: number;
}

// Mock data
export const MOCK_PROJECT_VENDOR_EXPENSES: ProjectVendorExpense[] = [
  {
    projectId: 'p1',
    projectName: 'Sunrise Tower - Block A',
    projectColor: '#3B82F6',
    totalBudget: 2_500_000,
    totalSpent: 1_420_000,
    vendors: [
      {
        vendorId: 'v1', vendorName: 'ABC Building Supplies', contactPerson: 'James Wilson', phone: '+1 555-0101',
        totalPaid: 580_000, totalPending: 45_000, invoiceCount: 23,
        requests: [
          {
            requestId: 'r1', date: '2026-02-06', source: 'Sunrise Tower', buyer: 'James Wilson', supplier: 'James Wilson',
            totalAmount: 11_385_000, paidAmount: 11_385_000, remainingAmount: 0,
            items: [
              { code: 'M-Minva-001', name: 'Minvata', unit: 'Pochka', requestedQty: 1046, givenQty: 1046, unitPrice: 1, totalPrice: 1046 },
              { code: 'M-Serp-10', name: 'Setka serepyanka', unit: 'dona', requestedQty: 300, givenQty: 300, unitPrice: 1, totalPrice: 300 },
            ],
          },
          {
            requestId: 'r2', date: '2025-12-29', source: 'Sunrise Tower', buyer: 'James Wilson', supplier: 'James Wilson',
            totalAmount: 72_000_000, paidAmount: 0, remainingAmount: 72_000_000,
            items: [
              { code: 'CON-30', name: 'Beton C30', unit: 'm³', requestedQty: 120, givenQty: 120, unitPrice: 600_000, totalPrice: 72_000_000 },
            ],
          },
        ],
      },
      {
        vendorId: 'v3', vendorName: 'FastTrack Materials Co.', contactPerson: 'Mike Johnson', phone: '+1 555-0103',
        totalPaid: 320_000, totalPending: 0, invoiceCount: 14,
        requests: [
          {
            requestId: 'r3', date: '2026-01-15', source: 'Sunrise Tower', buyer: 'Mike Johnson', supplier: 'Mike Johnson',
            totalAmount: 16_000, paidAmount: 16_000, remainingAmount: 0,
            items: [
              { code: 'CEM-01', name: 'Sement Portland', unit: 'ton', requestedQty: 8, givenQty: 8, unitPrice: 2_000, totalPrice: 16_000 },
            ],
          },
        ],
      },
      {
        vendorId: 'v5', vendorName: 'BuildRight Contractors', contactPerson: 'David Lee', phone: '+1 555-0105',
        totalPaid: 410_000, totalPending: 85_000, invoiceCount: 18,
        requests: [
          {
            requestId: 'r4', date: '2026-02-04', source: 'Sunrise Tower', buyer: 'David Lee', supplier: 'David Lee',
            totalAmount: 60_107_136, paidAmount: 60_107_136, remainingAmount: 0,
            items: [
              { code: 'BRK-01', name: "G'isht standart", unit: 'dona', requestedQty: 5000, givenQty: 5000, unitPrice: 12_000, totalPrice: 60_000_000 },
              { code: 'SND-01', name: "Qum (mayda)", unit: 'm³', requestedQty: 10, givenQty: 10, unitPrice: 10_714, totalPrice: 107_136 },
            ],
          },
        ],
      },
      {
        vendorId: 'v2', vendorName: 'Metro Equipment Rentals', contactPerson: 'Sarah Chen', phone: '+1 555-0102',
        totalPaid: 110_000, totalPending: 25_000, invoiceCount: 8,
        requests: [
          {
            requestId: 'r5', date: '2025-12-20', source: 'Sunrise Tower', buyer: 'Sarah Chen', supplier: 'Sarah Chen',
            totalAmount: 21_829_840, paidAmount: 21_829_840, remainingAmount: 0,
            items: [
              { code: 'EQ-01', name: 'Kran ijarasi', unit: 'kun', requestedQty: 30, givenQty: 30, unitPrice: 727_661, totalPrice: 21_829_840 },
            ],
          },
        ],
      },
    ],
  },
  {
    projectId: 'p2',
    projectName: 'Green Valley Residences',
    projectColor: '#22C55E',
    totalBudget: 1_800_000,
    totalSpent: 890_000,
    vendors: [
      {
        vendorId: 'v1', vendorName: 'ABC Building Supplies', contactPerson: 'James Wilson', phone: '+1 555-0101',
        totalPaid: 420_000, totalPending: 30_000, invoiceCount: 16,
        requests: [
          {
            requestId: 'r6', date: '2026-01-20', source: 'Green Valley', buyer: 'James Wilson', supplier: 'James Wilson',
            totalAmount: 420_000, paidAmount: 420_000, remainingAmount: 0,
            items: [
              { code: 'PLY-18', name: 'Fanera 18mm', unit: 'dona', requestedQty: 200, givenQty: 200, unitPrice: 2_100, totalPrice: 420_000 },
            ],
          },
        ],
      },
      {
        vendorId: 'v4', vendorName: 'Premier Construction Services', contactPerson: 'Emily Brown', phone: '+1 555-0104',
        totalPaid: 290_000, totalPending: 60_000, invoiceCount: 11,
        requests: [
          {
            requestId: 'r7', date: '2026-02-01', source: 'Green Valley', buyer: 'Emily Brown', supplier: 'Emily Brown',
            totalAmount: 290_000, paidAmount: 290_000, remainingAmount: 0,
            items: [
              { code: 'SRV-01', name: 'Suvoq ishlari', unit: 'm²', requestedQty: 500, givenQty: 500, unitPrice: 580, totalPrice: 290_000 },
            ],
          },
        ],
      },
      {
        vendorId: 'v3', vendorName: 'FastTrack Materials Co.', contactPerson: 'Mike Johnson', phone: '+1 555-0103',
        totalPaid: 180_000, totalPending: 15_000, invoiceCount: 9,
        requests: [
          {
            requestId: 'r8', date: '2026-01-10', source: 'Green Valley', buyer: 'Mike Johnson', supplier: 'Mike Johnson',
            totalAmount: 180_000, paidAmount: 180_000, remainingAmount: 0,
            items: [
              { code: 'CEM-01', name: 'Sement Portland', unit: 'ton', requestedQty: 60, givenQty: 60, unitPrice: 3_000, totalPrice: 180_000 },
            ],
          },
        ],
      },
    ],
  },
  {
    projectId: 'p3',
    projectName: 'Metro Business Park',
    projectColor: '#F97316',
    totalBudget: 4_200_000,
    totalSpent: 2_150_000,
    vendors: [
      {
        vendorId: 'v5', vendorName: 'BuildRight Contractors', contactPerson: 'David Lee', phone: '+1 555-0105',
        totalPaid: 780_000, totalPending: 120_000, invoiceCount: 28,
        requests: [
          {
            requestId: 'r9', date: '2026-02-10', source: 'Metro Business Park', buyer: 'David Lee', supplier: 'David Lee',
            totalAmount: 780_000, paidAmount: 780_000, remainingAmount: 0,
            items: [
              { code: 'BRK-01', name: "G'isht standart", unit: 'dona', requestedQty: 10000, givenQty: 10000, unitPrice: 78, totalPrice: 780_000 },
            ],
          },
        ],
      },
      {
        vendorId: 'v1', vendorName: 'ABC Building Supplies', contactPerson: 'James Wilson', phone: '+1 555-0101',
        totalPaid: 650_000, totalPending: 55_000, invoiceCount: 22,
        requests: [],
      },
      {
        vendorId: 'v2', vendorName: 'Metro Equipment Rentals', contactPerson: 'Sarah Chen', phone: '+1 555-0102',
        totalPaid: 380_000, totalPending: 40_000, invoiceCount: 15,
        requests: [],
      },
      {
        vendorId: 'v4', vendorName: 'Premier Construction Services', contactPerson: 'Emily Brown', phone: '+1 555-0104',
        totalPaid: 220_000, totalPending: 0, invoiceCount: 7,
        requests: [],
      },
      {
        vendorId: 'v6', vendorName: 'SteelForge Industries', contactPerson: 'Ahmad Reza', phone: '+1 555-0106',
        totalPaid: 120_000, totalPending: 95_000, invoiceCount: 5,
        requests: [],
      },
    ],
  },
  {
    projectId: 'p4',
    projectName: 'Harbor Bridge Renovation',
    projectColor: '#A855F7',
    totalBudget: 3_100_000,
    totalSpent: 640_000,
    vendors: [
      {
        vendorId: 'v6', vendorName: 'SteelForge Industries', contactPerson: 'Ahmad Reza', phone: '+1 555-0106',
        totalPaid: 310_000, totalPending: 180_000, invoiceCount: 10,
        requests: [],
      },
      {
        vendorId: 'v2', vendorName: 'Metro Equipment Rentals', contactPerson: 'Sarah Chen', phone: '+1 555-0102',
        totalPaid: 190_000, totalPending: 35_000, invoiceCount: 6,
        requests: [],
      },
      {
        vendorId: 'v3', vendorName: 'FastTrack Materials Co.', contactPerson: 'Mike Johnson', phone: '+1 555-0103',
        totalPaid: 140_000, totalPending: 20_000, invoiceCount: 5,
        requests: [],
      },
    ],
  },
];

export const MOCK_INVENTORY: InventoryItem[] = [
  { resourceName: 'Concrete C30', resourceCode: 'CON-30', unit: 'm³', totalReceived: 850, usedOnSite: 720, inWarehouse: 130, neededToFinish: 340, vendorName: 'ABC Building Supplies' },
  { resourceName: 'Rebar 12mm', resourceCode: 'REB-12', unit: 'ton', totalReceived: 45, usedOnSite: 38, inWarehouse: 7, neededToFinish: 22, vendorName: 'SteelForge Industries' },
  { resourceName: 'Cement Portland', resourceCode: 'CEM-01', unit: 'ton', totalReceived: 120, usedOnSite: 95, inWarehouse: 25, neededToFinish: 60, vendorName: 'FastTrack Materials Co.' },
  { resourceName: 'Sand (Fine)', resourceCode: 'SND-01', unit: 'm³', totalReceived: 300, usedOnSite: 260, inWarehouse: 40, neededToFinish: 110, vendorName: 'ABC Building Supplies' },
  { resourceName: 'Bricks Standard', resourceCode: 'BRK-01', unit: 'pcs', totalReceived: 45000, usedOnSite: 38000, inWarehouse: 7000, neededToFinish: 15000, vendorName: 'BuildRight Contractors' },
  { resourceName: 'Plywood 18mm', resourceCode: 'PLY-18', unit: 'pcs', totalReceived: 800, usedOnSite: 650, inWarehouse: 150, neededToFinish: 200, vendorName: 'FastTrack Materials Co.' },
];
