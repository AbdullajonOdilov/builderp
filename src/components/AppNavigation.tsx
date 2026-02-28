import { Building2, ClipboardList, DollarSign, HardHat, ListTodo, Kanban, Moon, Sun, Flag, LogOut } from 'lucide-react';
import { NavLink } from './NavLink';
import { useTheme } from 'next-themes';
import { Button } from './ui/button';
import { useFeatureFlags } from '@/contexts/FeatureFlagContext';

export function AppNavigation() {
  const { theme, setTheme } = useTheme();
  const { isEnabled } = useFeatureFlags();

  const navItems = [
    { to: '/buildings', label: 'Buildings', icon: Building2, flag: 'page_buildings' },
    { to: '/tasks', label: 'Tasks', icon: ListTodo, flag: 'page_tasks' },
    { to: '/finance', label: 'Finance', icon: DollarSign, flag: 'page_finance' },
    { to: '/ishlar-doskasi', label: 'Ishlar doskasi', icon: Kanban, flag: 'page_ishlar_doskasi' },
    { to: '/requests', label: 'Requests', icon: ClipboardList, flag: 'page_requests' },
  ];

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
            {navItems.filter(item => isEnabled(item.flag)).map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                activeClassName="bg-muted text-foreground"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
            <NavLink
              to="/feature-flags"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              activeClassName="bg-muted text-foreground"
            >
              <Flag className="h-4 w-4" />
              Flags
            </NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-1">
          {isEnabled('feature_dark_mode') && (
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          )}
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4" />
            Чиқиш
          </Button>
        </div>
      </div>
    </header>
  );
}
