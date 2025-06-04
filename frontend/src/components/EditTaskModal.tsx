import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Challenge } from '@/types';
import axios from '@/lib/axios';
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { Check, X } from 'lucide-react';

type TaskDifficulty = 'easy' | 'medium' | 'hard';
type TaskStatus = 'active' | 'inactive';

interface EditTaskModalProps {
  task: {
    id: string;
    task_description: string;
    difficulty: TaskDifficulty;
    status: TaskStatus;
    points: number;
  };
  onClose: () => void;
  onSave: (id: string, updatedTask: Partial<Challenge>) => Promise<void>;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ task, onClose, onSave }) => {
  const [desc, setDesc] = useState(task.task_description);
  const [difficulty, setDifficulty] = useState<TaskDifficulty>(task.difficulty);
  const [status, setStatus] = useState<TaskStatus>(task.status as TaskStatus);
  const [points, setPoints] = useState(task.points);

  const handleSubmit = async () => {
    try {
      await onSave(task.id, {
        task_description: desc,
        difficulty,
        status,
        points
      });
      onClose();
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Description</Label>
            <Input value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>
          <div>
            <Label>Difficulty</Label>
            <ToggleGroup
              type="single"
              value={difficulty}
              onValueChange={(value) => {
                if (value) setDifficulty(value as TaskDifficulty);
              }}
              className="justify-stretch border rounded-lg p-1 mt-1.5 w-full grid grid-cols-3 gap-1"
            >
              <ToggleGroupItem
                value="easy"
                className="flex items-center justify-center gap-1.5 data-[state=on]:bg-green-100 data-[state=on]:text-green-700 w-full"
              >
                Easy
              </ToggleGroupItem>
              <ToggleGroupItem
                value="medium"
                className="flex items-center justify-center gap-1.5 data-[state=on]:bg-yellow-100 data-[state=on]:text-yellow-700 w-full"
              >
                Medium
              </ToggleGroupItem>
              <ToggleGroupItem
                value="hard"
                className="flex items-center justify-center gap-1.5 data-[state=on]:bg-red-100 data-[state=on]:text-red-700 w-full"
              >
                Hard
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div>
            <Label>Status</Label>
            <ToggleGroup
              type="single"
              value={status}
              onValueChange={(value) => {
                if (value) setStatus(value as TaskStatus);
              }}
              className="justify-stretch border rounded-lg p-1 mt-1.5 w-full grid grid-cols-2 gap-1"
            >
              <ToggleGroupItem
                value="active"
                className="flex items-center justify-center gap-1.5 data-[state=on]:bg-green-100 data-[state=on]:text-green-700 w-full"
              >
                <Check className="h-4 w-4" />
                Active
              </ToggleGroupItem>
              <ToggleGroupItem
                value="inactive"
                className="flex items-center justify-center gap-1.5 data-[state=on]:bg-red-100 data-[state=on]:text-red-700 w-full"
              >
                <X className="h-4 w-4" />
                Inactive
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div>
            <Label>Points</Label>
            <Input type="number" value={points} onChange={(e) => setPoints(Number(e.target.value))} />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSubmit} className="bg-orange-500 text-white">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditTaskModal;
