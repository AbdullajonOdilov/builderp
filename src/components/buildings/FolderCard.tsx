import { Folder, MoreVertical, Trash2, Edit } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
  completionPercentage?: number;
  color?: string;
  onClick: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

export const FolderCard = ({ name, subtitle, completionPercentage, color, onClick, onDelete, onEdit }: FolderCardProps) => {
  return (
    <Card 
      className="group relative p-6 cursor-pointer hover:bg-accent/50 transition-all duration-200 border-2 hover:border-primary/30 hover:shadow-lg"
      onClick={onClick}
      style={color ? { borderLeftWidth: '4px', borderLeftColor: color } : undefined}
    >
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl" style={{ backgroundColor: color ? `${color}20` : undefined }}>
          <Folder className="h-8 w-8" style={{ color: color || '#D97706', fill: color ? `${color}40` : '#FDE68A' }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">{name}</h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
      </div>
      
      {completionPercentage !== undefined && (
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Completion</span>
            <span className={`font-medium ${
              completionPercentage >= 90 ? 'text-green-600' : 
              completionPercentage >= 20 ? 'text-amber-600' : 
              'text-red-600'
            }`}>
              {completionPercentage.toFixed(0)}%
            </span>
          </div>
          <Progress 
            value={Math.min(completionPercentage, 100)} 
            className="h-2"
            indicatorClassName={
              completionPercentage >= 90 ? 'bg-green-500' : 
              completionPercentage >= 20 ? 'bg-amber-500' : 
              'bg-red-500'
            }
          />
        </div>
      )}
      
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
