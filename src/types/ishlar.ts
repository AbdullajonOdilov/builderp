export type IshlarStatus = 'created' | 'in_progress' | 'completed' | 'archived';

export interface IshlarItem {
  id: string;
  name: string;
  projectName: string;
  quantity: number;
  totalQuantity: number;
  unit: string;
  progress: number; // 0-100
  budgetPercent: number;
  budgetAmount: number;
  startDate: string;
  endDate: string;
  status: IshlarStatus;
  category: string;
  foreman: string;
  foremanColor: string; // badge color
  priorityColor: string; // red/green/yellow indicator
}

export const ISHLAR_CATEGORIES = [
  'Qurilish', 'Pardozlash', 'Sanitariya', 'Elektr', 'Tom', 'Poydevor',
] as const;

export const ISHLAR_FOREMEN = [
  { id: 'f1', name: 'Rustam K.', color: 'hsl(220, 70%, 50%)' },
  { id: 'f2', name: 'Aziz T.', color: 'hsl(150, 70%, 40%)' },
  { id: 'f3', name: 'Sardor M.', color: 'hsl(30, 80%, 50%)' },
  { id: 'f4', name: 'Bobur N.', color: 'hsl(280, 60%, 50%)' },
];

export const ISHLAR_PROJECTS = [
  'Sunrise Tower - Block A',
  'Green Valley Residences',
  'Metro Business Park',
  'Harbor Bridge Renovation',
];

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const WORK_NAMES = [
  'Откосы', 'МДФ межкомнатных дверей', 'Входных квартирных металлический дверей',
  'Пробивка отверстий для вентиляционных труб', 'Отверстия шахта (Сантех, Вентиляционные отверстия)',
  'Штукатурка газобетона', 'Штроба для сантехников С/У', 'Бетоноконтакт стена и потолок',
  'Фартук из плитка', 'Штукатурка под правила', 'Шпакловка - 2 слой родбонд',
  'Плинтус из плитка МОП +Тех.пом', 'Газаблок зина', 'Водаемулсия краска',
  'Ламинат', 'Кафел 60x60', 'Гипсакартон перегаротка 4 слой',
  'Газаблок перегаротка', 'Фахферка уголок', 'Шпакловка стена и потолок',
];

const UNITS = ['шт', 'м2', 'п/м', 'м3'];
const PRIORITY_COLORS = ['hsl(var(--status-rejected))', 'hsl(var(--status-delivered))', 'hsl(var(--status-pending))'];

function generateItems(status: IshlarStatus, count: number): IshlarItem[] {
  return Array.from({ length: count }, (_, i) => {
    const totalQty = rand(50, 15000);
    const doneQty = status === 'completed' || status === 'archived' ? totalQty : status === 'in_progress' ? rand(0, totalQty) : 0;
    const progress = Math.round((doneQty / totalQty) * 100);
    const budget = rand(1, 250);
    const fm = ISHLAR_FOREMEN[rand(0, ISHLAR_FOREMEN.length - 1)];
    return {
      id: `${status}-${i}`,
      name: WORK_NAMES[rand(0, WORK_NAMES.length - 1)],
      projectName: ISHLAR_PROJECTS[rand(0, ISHLAR_PROJECTS.length - 1)],
      quantity: doneQty,
      totalQuantity: totalQty,
      unit: UNITS[rand(0, UNITS.length - 1)],
      progress,
      budgetPercent: status === 'created' ? 0 : rand(0, 450),
      budgetAmount: budget,
      startDate: `${rand(1, 28).toString().padStart(2, '0')}.01.26`,
      endDate: `${rand(1, 28).toString().padStart(2, '0')}.03.26`,
      status,
      category: (ISHLAR_CATEGORIES as readonly string[])[rand(0, ISHLAR_CATEGORIES.length - 1)],
      foreman: fm.name,
      foremanColor: fm.color,
      priorityColor: PRIORITY_COLORS[rand(0, 2)],
    };
  });
}

export const MOCK_ISHLAR: IshlarItem[] = [
  ...generateItems('created', 55),
  ...generateItems('in_progress', 5),
  ...generateItems('completed', 15),
  ...generateItems('archived', 11),
];
