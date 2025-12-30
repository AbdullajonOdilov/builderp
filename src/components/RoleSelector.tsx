import { UserRole } from '@/types/request';
import { Card } from '@/components/ui/card';
import { HardHat, Truck, ArrowRight, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoleSelectorProps {
  onSelectRole: (role: UserRole) => void;
}

export function RoleSelector({ onSelectRole }: RoleSelectorProps) {
  const roles = [
    {
      value: 'manager' as UserRole,
      title: 'Manager',
      description: 'Create and track resource requests',
      icon: HardHat,
      color: 'bg-primary',
    },
    {
      value: 'little_supplier' as UserRole,
      title: 'Little Supplier',
      description: 'Assign vendors to requests',
      icon: Package,
      color: 'bg-emerald-500',
    },
    {
      value: 'supplier' as UserRole,
      title: 'Supplier',
      description: 'Review and fulfill requests',
      icon: Truck,
      color: 'bg-accent',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted/30">
      <div className="text-center mb-8 animate-fade-in">
        <div className="inline-flex p-4 rounded-2xl bg-primary mb-4">
          <HardHat className="h-12 w-12 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold mb-2">BuildFlow</h1>
        <p className="text-muted-foreground">Construction Resource Management</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
        {roles.map((role, index) => (
          <Card
            key={role.value}
            onClick={() => onSelectRole(role.value)}
            className={cn(
              'p-6 cursor-pointer transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 group animate-fade-in',
              'border-2 hover:border-primary/50'
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={cn('p-3 rounded-xl w-fit mb-4', role.color)}>
              <role.icon className="h-8 w-8 text-primary-foreground" />
            </div>
            
            <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
              {role.title}
              <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </h2>
            <p className="text-sm text-muted-foreground">{role.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
