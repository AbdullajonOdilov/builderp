export interface ForemanPaymentDetail {
  date: string;
  amount: number;
  comment: string;
}

export interface ForemanWorkItem {
  id: string;
  projectName: string;
  workType: string;
  totalAmount: number;
  receivedAmount: number;
  remainingAmount: number;
  comment: string;
  payments: ForemanPaymentDetail[];
}

export interface ForemanToolItem {
  id: string;
  projectName: string;
  workType: string;
  date: string;
  toolName: string;
  quantity: number;
  price: number;
  totalAmount: number;
}

export interface ForemanProject {
  projectId: string;
  projectName: string;
  taskCount: number;
  totalWork: number;
  totalAdvance: number;
}

export interface Foreman {
  id: string;
  name: string;
  phone: string;
  profession: string;
  comment?: string;
  projects: ForemanProject[];
  workItems: ForemanWorkItem[];
  toolItems: ForemanToolItem[];
}

const WORK_ITEMS_FM1: ForemanWorkItem[] = [
  { id: 'w1', projectName: 'Sunrise Tower - Block A', workType: 'G\'isht terish', totalAmount: 120_000, receivedAmount: 40_000, remainingAmount: 80_000, comment: '3-qavat', payments: [{ date: '2025-01-15', amount: 20_000, comment: 'Avans' }, { date: '2025-02-01', amount: 20_000, comment: 'Oraliq' }] },
  { id: 'w2', projectName: 'Green Valley Residences', workType: 'Suvoq ishi', totalAmount: 85_000, receivedAmount: 30_000, remainingAmount: 55_000, comment: '1-2 qavat', payments: [{ date: '2025-01-20', amount: 30_000, comment: 'Avans' }] },
];
const TOOL_ITEMS_FM1: ForemanToolItem[] = [
  { id: 't1', projectName: 'Sunrise Tower - Block A', workType: 'G\'isht terish', date: '2025-01-10', toolName: 'Sement', quantity: 50, price: 80, totalAmount: 4_000 },
  { id: 't2', projectName: 'Green Valley Residences', workType: 'Suvoq ishi', date: '2025-01-12', toolName: 'Qum', quantity: 30, price: 40, totalAmount: 1_200 },
];

export const MOCK_FOREMEN: Foreman[] = [
  {
    id: 'fm1', name: 'Rustam Karimov', phone: '+998 90 123-45-67', profession: 'Mason', comment: 'Tajribali usta',
    projects: [
      { projectId: 'p1', projectName: 'Sunrise Tower - Block A', taskCount: 24, totalWork: 185_000, totalAdvance: 62_000 },
      { projectId: 'p2', projectName: 'Green Valley Residences', taskCount: 18, totalWork: 142_000, totalAdvance: 48_000 },
    ],
    workItems: WORK_ITEMS_FM1, toolItems: TOOL_ITEMS_FM1,
  },
  {
    id: 'fm2', name: 'Alisher Toshmatov', phone: '+998 91 234-56-78', profession: 'Electrician',
    projects: [
      { projectId: 'p1', projectName: 'Sunrise Tower - Block A', taskCount: 32, totalWork: 220_000, totalAdvance: 95_000 },
      { projectId: 'p3', projectName: 'Metro Business Park', taskCount: 28, totalWork: 195_000, totalAdvance: 70_000 },
    ],
    workItems: [
      { id: 'w3', projectName: 'Sunrise Tower - Block A', workType: 'Elektr simlar tortish', totalAmount: 150_000, receivedAmount: 60_000, remainingAmount: 90_000, comment: '1-5 qavat', payments: [{ date: '2025-02-05', amount: 60_000, comment: 'Avans' }] },
    ],
    toolItems: [
      { id: 't3', projectName: 'Sunrise Tower - Block A', workType: 'Elektr simlar tortish', date: '2025-02-01', toolName: 'Kabel 2.5mm', quantity: 200, price: 15, totalAmount: 3_000 },
    ],
  },
  {
    id: 'fm3', name: 'Bobur Nazarov', phone: '+998 93 345-67-89', profession: 'Plumber',
    projects: [
      { projectId: 'p2', projectName: 'Green Valley Residences', taskCount: 15, totalWork: 98_000, totalAdvance: 35_000 },
      { projectId: 'p4', projectName: 'Harbor Bridge Renovation', taskCount: 22, totalWork: 165_000, totalAdvance: 50_000 },
    ],
    workItems: [
      { id: 'w4', projectName: 'Green Valley Residences', workType: 'Truba o\'rnatish', totalAmount: 98_000, receivedAmount: 35_000, remainingAmount: 63_000, comment: 'Hammom', payments: [{ date: '2025-01-25', amount: 35_000, comment: 'Avans' }] },
    ],
    toolItems: [
      { id: 't4', projectName: 'Green Valley Residences', workType: 'Truba o\'rnatish', date: '2025-01-22', toolName: 'PPR truba 20mm', quantity: 100, price: 25, totalAmount: 2_500 },
    ],
  },
  {
    id: 'fm4', name: 'Jamshid Umarov', phone: '+998 94 456-78-90', profession: 'Mason',
    projects: [
      { projectId: 'p1', projectName: 'Sunrise Tower - Block A', taskCount: 20, totalWork: 155_000, totalAdvance: 60_000 },
      { projectId: 'p3', projectName: 'Metro Business Park', taskCount: 35, totalWork: 280_000, totalAdvance: 110_000 },
      { projectId: 'p4', projectName: 'Harbor Bridge Renovation', taskCount: 12, totalWork: 88_000, totalAdvance: 30_000 },
    ],
    workItems: [], toolItems: [],
  },
  {
    id: 'fm5', name: 'Sardor Yuldashev', phone: '+998 90 567-89-01', profession: 'Welder',
    projects: [
      { projectId: 'p3', projectName: 'Metro Business Park', taskCount: 40, totalWork: 310_000, totalAdvance: 120_000 },
      { projectId: 'p4', projectName: 'Harbor Bridge Renovation', taskCount: 30, totalWork: 245_000, totalAdvance: 85_000 },
    ],
    workItems: [], toolItems: [],
  },
  {
    id: 'fm6', name: 'Otabek Rahimov', phone: '+998 91 678-90-12', profession: 'Carpenter',
    projects: [
      { projectId: 'p1', projectName: 'Sunrise Tower - Block A', taskCount: 16, totalWork: 125_000, totalAdvance: 45_000 },
      { projectId: 'p2', projectName: 'Green Valley Residences', taskCount: 22, totalWork: 170_000, totalAdvance: 65_000 },
    ],
    workItems: [], toolItems: [],
  },
];
