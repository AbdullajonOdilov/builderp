import { UserRole } from '@/types/request';
import { Button } from '@/components/ui/button';
import { HardHat, Truck, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  role: UserRole | null;
  onRoleChange: (role: UserRole | null) => void;
}

export function Header({ role, onRoleChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 glass border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary">
            <HardHat className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg">BuildFlow</h1>
            <p className="text-xs text-muted-foreground">Construction ERP</p>
          </div>
        </div>
        
        {role && (
          <div className="flex items-center gap-4">
            <div className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
              role === 'manager' ? 'bg-primary/10 text-primary' : 'bg-accent/20 text-accent-foreground'
            )}>
              {role === 'manager' ? (
                <HardHat className="h-4 w-4" />
              ) : (
                <Truck className="h-4 w-4" />
              )}
              {role === 'manager' ? 'Manager' : 'Supplier'}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRoleChange(null)}
              className="text-muted-foreground"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Switch Role
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
