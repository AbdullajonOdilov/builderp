import { Status, STATUS_CONFIG } from '@/types/request';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: Status;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        config.color,
        sizeClasses[size]
      )}
    >
      {config.label}
    </span>
  );
}
