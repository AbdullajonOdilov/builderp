import { Package, Wrench, Users } from 'lucide-react';
import { ResourceType } from '@/types/request';
import { cn } from '@/lib/utils';

interface ResourceIconProps {
  type: ResourceType;
  className?: string;
}

export function ResourceIcon({ type, className }: ResourceIconProps) {
  const icons = {
    materials: Package,
    equipment: Wrench,
    services: Users,
  };
  
  const Icon = icons[type];
  
  return <Icon className={cn('h-5 w-5', className)} />;
}
