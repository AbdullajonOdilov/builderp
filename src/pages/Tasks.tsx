import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTasks } from '@/hooks/useTasks';
import { useBuildings } from '@/hooks/useBuildings';
import { AddTaskDialog } from '@/components/tasks/AddTaskDialog';

const Tasks = () => {
  const { tasks, addTask, deleteTask } = useTasks();
  const { buildings } = useBuildings();
  const [dialogOpen, setDialogOpen] = useState(false);

  const getBuildingName = (id: string) => {
    const b = buildings.find(b => b.id === id);
    return b ? b.objectName : 'Unknown';
  };

  const getBuildingColor = (id: string) => {
    const b = buildings.find(b => b.id === id);
    return b?.color || '#888';
  };

  return (
    <div className="container py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Task
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Task Name</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Building</TableHead>
              <TableHead className="text-right">Sub Resources</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No tasks yet. Click "Add Task" to create one.
                </TableCell>
              </TableRow>
            ) : (
              tasks.map(task => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.categoryName}</TableCell>
                  <TableCell className="text-muted-foreground">{task.resourceCode || '—'}</TableCell>
                  <TableCell>{task.taskName}</TableCell>
                  <TableCell className="text-right">{task.taskAmount}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getBuildingColor(task.buildingId) }} />
                      {getBuildingName(task.buildingId)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{task.subResources.length}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AddTaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        buildings={buildings}
        onAddTask={addTask}
        allTasks={tasks}
      />
    </div>
  );
};

export default Tasks;
