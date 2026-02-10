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
  projects: ForemanProject[];
}

export const MOCK_FOREMEN: Foreman[] = [
  {
    id: 'fm1',
    name: 'Rustam Karimov',
    phone: '+998 90 123-45-67',
    profession: 'Mason',
    projects: [
      { projectId: 'p1', projectName: 'Sunrise Tower - Block A', taskCount: 24, totalWork: 185_000, totalAdvance: 62_000 },
      { projectId: 'p2', projectName: 'Green Valley Residences', taskCount: 18, totalWork: 142_000, totalAdvance: 48_000 },
    ],
  },
  {
    id: 'fm2',
    name: 'Alisher Toshmatov',
    phone: '+998 91 234-56-78',
    profession: 'Electrician',
    projects: [
      { projectId: 'p1', projectName: 'Sunrise Tower - Block A', taskCount: 32, totalWork: 220_000, totalAdvance: 95_000 },
      { projectId: 'p3', projectName: 'Metro Business Park', taskCount: 28, totalWork: 195_000, totalAdvance: 70_000 },
    ],
  },
  {
    id: 'fm3',
    name: 'Bobur Nazarov',
    phone: '+998 93 345-67-89',
    profession: 'Plumber',
    projects: [
      { projectId: 'p2', projectName: 'Green Valley Residences', taskCount: 15, totalWork: 98_000, totalAdvance: 35_000 },
      { projectId: 'p4', projectName: 'Harbor Bridge Renovation', taskCount: 22, totalWork: 165_000, totalAdvance: 50_000 },
    ],
  },
  {
    id: 'fm4',
    name: 'Jamshid Umarov',
    phone: '+998 94 456-78-90',
    profession: 'Mason',
    projects: [
      { projectId: 'p1', projectName: 'Sunrise Tower - Block A', taskCount: 20, totalWork: 155_000, totalAdvance: 60_000 },
      { projectId: 'p3', projectName: 'Metro Business Park', taskCount: 35, totalWork: 280_000, totalAdvance: 110_000 },
      { projectId: 'p4', projectName: 'Harbor Bridge Renovation', taskCount: 12, totalWork: 88_000, totalAdvance: 30_000 },
    ],
  },
  {
    id: 'fm5',
    name: 'Sardor Yuldashev',
    phone: '+998 90 567-89-01',
    profession: 'Welder',
    projects: [
      { projectId: 'p3', projectName: 'Metro Business Park', taskCount: 40, totalWork: 310_000, totalAdvance: 120_000 },
      { projectId: 'p4', projectName: 'Harbor Bridge Renovation', taskCount: 30, totalWork: 245_000, totalAdvance: 85_000 },
    ],
  },
  {
    id: 'fm6',
    name: 'Otabek Rahimov',
    phone: '+998 91 678-90-12',
    profession: 'Carpenter',
    projects: [
      { projectId: 'p1', projectName: 'Sunrise Tower - Block A', taskCount: 16, totalWork: 125_000, totalAdvance: 45_000 },
      { projectId: 'p2', projectName: 'Green Valley Residences', taskCount: 22, totalWork: 170_000, totalAdvance: 65_000 },
    ],
  },
];
