import { Folder, MoreVertical, Trash2, Edit } from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface FolderCardProps {
  name: string;
  subtitle?: string;
  onClick: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

export const FolderCard = ({ name, subtitle, onClick, onDelete, onEdit }: FolderCardProps) => {
  return (
    <Card 
      className="group relative p-6 cursor-pointer hover:bg-accent/50 transition-all duration-200 border-2 hover:border-primary/30 hover:shadow-lg"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
          <Folder className="h-8 w-8 text-amber-600 dark:text-amber-400 fill-amber-200 dark:fill-amber-800" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">{name}</h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
      </div>
      
      {(onDelete || onEdit) && (
        <div 
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </Card>
  );
};
