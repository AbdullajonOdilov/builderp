import { Building2, ClipboardList, DollarSign, HardHat, ListTodo } from 'lucide-react';
import { NavLink } from './NavLink';

export function AppNavigation() {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary">
              <HardHat className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">BuildFlow</span>
          </div>
          
          <nav className="flex items-center gap-1">
            <NavLink 
              to="/buildings" 
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              activeClassName="bg-muted text-foreground"
            >
              <Building2 className="h-4 w-4" />
              Buildings
            </NavLink>
            <NavLink 
              to="/tasks" 
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              activeClassName="bg-muted text-foreground"
            >
              <ListTodo className="h-4 w-4" />
              Tasks
            </NavLink>
            <NavLink 
              to="/finance" 
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              activeClassName="bg-muted text-foreground"
            >
              <DollarSign className="h-4 w-4" />
              Finance
            </NavLink>
            <NavLink 
              to="/requests" 
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              activeClassName="bg-muted text-foreground"
            >
              <ClipboardList className="h-4 w-4" />
              Requests
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
}
