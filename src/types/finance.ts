export interface VendorExpense {
  vendorId: string;
  vendorName: string;
  contactPerson: string;
  phone: string;
  totalPaid: number;
  totalPending: number;
  invoiceCount: number;
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
      { vendorId: 'v1', vendorName: 'ABC Building Supplies', contactPerson: 'James Wilson', phone: '+1 555-0101', totalPaid: 580_000, totalPending: 45_000, invoiceCount: 23 },
      { vendorId: 'v3', vendorName: 'FastTrack Materials Co.', contactPerson: 'Mike Johnson', phone: '+1 555-0103', totalPaid: 320_000, totalPending: 0, invoiceCount: 14 },
      { vendorId: 'v5', vendorName: 'BuildRight Contractors', contactPerson: 'David Lee', phone: '+1 555-0105', totalPaid: 410_000, totalPending: 85_000, invoiceCount: 18 },
      { vendorId: 'v2', vendorName: 'Metro Equipment Rentals', contactPerson: 'Sarah Chen', phone: '+1 555-0102', totalPaid: 110_000, totalPending: 25_000, invoiceCount: 8 },
    ],
  },
  {
    projectId: 'p2',
    projectName: 'Green Valley Residences',
    projectColor: '#22C55E',
    totalBudget: 1_800_000,
    totalSpent: 890_000,
    vendors: [
      { vendorId: 'v1', vendorName: 'ABC Building Supplies', contactPerson: 'James Wilson', phone: '+1 555-0101', totalPaid: 420_000, totalPending: 30_000, invoiceCount: 16 },
      { vendorId: 'v4', vendorName: 'Premier Construction Services', contactPerson: 'Emily Brown', phone: '+1 555-0104', totalPaid: 290_000, totalPending: 60_000, invoiceCount: 11 },
      { vendorId: 'v3', vendorName: 'FastTrack Materials Co.', contactPerson: 'Mike Johnson', phone: '+1 555-0103', totalPaid: 180_000, totalPending: 15_000, invoiceCount: 9 },
    ],
  },
  {
    projectId: 'p3',
    projectName: 'Metro Business Park',
    projectColor: '#F97316',
    totalBudget: 4_200_000,
    totalSpent: 2_150_000,
    vendors: [
      { vendorId: 'v5', vendorName: 'BuildRight Contractors', contactPerson: 'David Lee', phone: '+1 555-0105', totalPaid: 780_000, totalPending: 120_000, invoiceCount: 28 },
      { vendorId: 'v1', vendorName: 'ABC Building Supplies', contactPerson: 'James Wilson', phone: '+1 555-0101', totalPaid: 650_000, totalPending: 55_000, invoiceCount: 22 },
      { vendorId: 'v2', vendorName: 'Metro Equipment Rentals', contactPerson: 'Sarah Chen', phone: '+1 555-0102', totalPaid: 380_000, totalPending: 40_000, invoiceCount: 15 },
      { vendorId: 'v4', vendorName: 'Premier Construction Services', contactPerson: 'Emily Brown', phone: '+1 555-0104', totalPaid: 220_000, totalPending: 0, invoiceCount: 7 },
      { vendorId: 'v6', vendorName: 'SteelForge Industries', contactPerson: 'Ahmad Reza', phone: '+1 555-0106', totalPaid: 120_000, totalPending: 95_000, invoiceCount: 5 },
    ],
  },
  {
    projectId: 'p4',
    projectName: 'Harbor Bridge Renovation',
    projectColor: '#A855F7',
    totalBudget: 3_100_000,
    totalSpent: 640_000,
    vendors: [
      { vendorId: 'v6', vendorName: 'SteelForge Industries', contactPerson: 'Ahmad Reza', phone: '+1 555-0106', totalPaid: 310_000, totalPending: 180_000, invoiceCount: 10 },
      { vendorId: 'v2', vendorName: 'Metro Equipment Rentals', contactPerson: 'Sarah Chen', phone: '+1 555-0102', totalPaid: 190_000, totalPending: 35_000, invoiceCount: 6 },
      { vendorId: 'v3', vendorName: 'FastTrack Materials Co.', contactPerson: 'Mike Johnson', phone: '+1 555-0103', totalPaid: 140_000, totalPending: 20_000, invoiceCount: 5 },
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
