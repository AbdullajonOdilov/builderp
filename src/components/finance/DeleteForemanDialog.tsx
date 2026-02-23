import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Foreman } from '@/types/foreman';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  foreman: Foreman | null;
  onConfirm: () => void;
}

export function DeleteForemanDialog({ open, onOpenChange, foreman, onConfirm }: Props) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-sm">Birgadirni o'chirish</AlertDialogTitle>
          <AlertDialogDescription className="text-xs">
            <strong>{foreman?.name}</strong> birgadirini o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">O'chirish</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
