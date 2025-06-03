import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import axios from '@/lib/axios';

interface EditUserModalProps {
  open: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    email: string;
    points: number;
  };
  onUpdate: () => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ open, onClose, user, onUpdate }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [points, setPoints] = useState(user.points);

  const handleSubmit = async () => {
    try {
      await axios.put(`/admin/users/${user.id}`, {
        name,
        email,
        total_score: points
      });
      onUpdate();
      onClose();
    } catch (err) {
      console.error('Error updating user:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
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

export default EditUserModal;