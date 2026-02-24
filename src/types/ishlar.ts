export type IshlarStatus = 'created' | 'in_progress' | 'completed' | 'archived';

export interface IshlarResource {
  id: string;
  name: string;
  code: string;
  unit: string;
  inStock: number;
  planned: number;
  used: number;
  remaining: number;
}

export interface IshlarPayment {
  date: string;
  amount: number;
  comment: string;
}

export interface IshlarItem {
  id: string;
  name: string;
  projectName: string;
  sectionName: string;
  quantity: number;
  totalQuantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  progress: number;
  budgetPercent: number;
  budgetAmount: number;
  completedQuantity: number;
  plannedQuantity: number;
  startDate: string;
  endDate: string;
  status: IshlarStatus;
  category: string;
  foreman: string;
  foremanColor: string;
  priorityColor: string;
  comment: string;
  resources: IshlarResource[];
  payments: IshlarPayment[];
  advanceReceived: number;
  remainingPayment: number;
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

const SECTIONS = ['1-qavat', '2-qavat', '3-qavat', 'Umumiy', 'MOP'];
const RESOURCE_NAMES = ['Плунтс', 'Аксесур Плунтс', 'Ламинат 7мм', 'ППН 3мм', 'Сементь', 'Profil 60x27'];
const RESOURCE_CODES = ['М-плунтС', 'М-плунтС-а', 'М-ламинат-7', 'М-пенаплекС', 'М-сем', 'М-проф'];

function generateResources(): IshlarResource[] {
  const count = rand(1, 4);
  return Array.from({ length: count }, (_, i) => {
    const inStock = rand(100, 30000);
    const planned = rand(5000, 80000);
    const used = rand(0, inStock);
    return {
      id: `r-${i}-${rand(1000, 9999)}`,
      name: RESOURCE_NAMES[i % RESOURCE_NAMES.length],
      code: RESOURCE_CODES[i % RESOURCE_CODES.length],
      unit: UNITS[rand(0, UNITS.length - 1)],
      inStock,
      planned,
      used,
      remaining: inStock - used,
    };
  });
}

function generatePayments(total: number): IshlarPayment[] {
  if (total <= 0) return [];
  const count = rand(1, 3);
  return Array.from({ length: count }, (_, i) => ({
    date: `2026-0${rand(1, 2)}-${rand(1, 28).toString().padStart(2, '0')}`,
    amount: Math.floor(total / count),
    comment: i === 0 ? 'Avans' : '',
  }));
}

function generateItems(status: IshlarStatus, count: number): IshlarItem[] {
  return Array.from({ length: count }, (_, i) => {
    const totalQty = rand(50, 15000);
    const doneQty = status === 'completed' || status === 'archived' ? totalQty : status === 'in_progress' ? rand(0, totalQty) : 0;
    const progress = Math.round((doneQty / totalQty) * 100);
    const budget = rand(1, 250);
    const fm = ISHLAR_FOREMEN[rand(0, ISHLAR_FOREMEN.length - 1)];
    const unitPrice = rand(5000, 50000);
    const totalPrice = unitPrice * totalQty;
    const advance = rand(0, Math.floor(totalPrice * 0.6));
    return {
      id: `${status}-${i}`,
      name: WORK_NAMES[rand(0, WORK_NAMES.length - 1)],
      projectName: ISHLAR_PROJECTS[rand(0, ISHLAR_PROJECTS.length - 1)],
      sectionName: SECTIONS[rand(0, SECTIONS.length - 1)],
      quantity: doneQty,
      totalQuantity: totalQty,
      unit: UNITS[rand(0, UNITS.length - 1)],
      unitPrice,
      totalPrice,
      progress,
      budgetPercent: status === 'created' ? 0 : rand(0, 450),
      budgetAmount: budget,
      completedQuantity: doneQty,
      plannedQuantity: totalQty - doneQty,
      startDate: `${rand(1, 28).toString().padStart(2, '0')}.01.26`,
      endDate: `${rand(1, 28).toString().padStart(2, '0')}.03.26`,
      status,
      category: (ISHLAR_CATEGORIES as readonly string[])[rand(0, ISHLAR_CATEGORIES.length - 1)],
      foreman: fm.name,
      foremanColor: fm.color,
      priorityColor: PRIORITY_COLORS[rand(0, 2)],
      comment: rand(0, 1) ? `${rand(1, 5)}-qavat ishlar` : '',
      resources: generateResources(),
      payments: generatePayments(advance),
      advanceReceived: advance,
      remainingPayment: totalPrice - advance,
    };
  });
}

export const MOCK_ISHLAR: IshlarItem[] = [
  ...generateItems('created', 55),
  ...generateItems('in_progress', 5),
  ...generateItems('completed', 15),
  ...generateItems('archived', 11),
];
