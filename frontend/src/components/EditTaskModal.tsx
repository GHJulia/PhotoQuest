import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Challenge } from '@/types';
import axios from '@/lib/axios';

interface EditTaskModalProps {
  task: {
    id: string;
    task_description: string;
    difficulty: string;
    status: string;
    points: number;
  };
  onClose: () => void;
  onSave: (id: string, updatedTask: Partial<Challenge>) => Promise<void>;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ task, onClose, onSave }) => {
  const [desc, setDesc] = useState(task.task_description);
  const [difficulty, setDifficulty] = useState(task.difficulty);
  const [status, setStatus] = useState(task.status);
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
            <Input value={difficulty} onChange={(e) => setDifficulty(e.target.value)} />
          </div>
          <div>
            <Label>Status</Label>
            <Input value={status} onChange={(e) => setStatus(e.target.value)} />
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
