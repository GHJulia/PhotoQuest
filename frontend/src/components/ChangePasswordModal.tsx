import React, { useState } from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from './ui/sonner';
import api from '../lib/axios';
import { useAuth } from '../contexts/AuthContext';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!passwordData.currentPassword) {
        toast.error("Current password required", {
          description: "Please enter your current password"
        });
        return;
      }
      if (!passwordData.newPassword) {
        toast.error("New password required", {
          description: "Please enter a new password"
        });
        return;
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error("Passwords don't match", {
          description: "Please make sure your new passwords match"
        });
        return;
      }

      setLoading(true);
      const response = await api.put('/profile', {
        name: user?.name || '',
        surname: user?.surname || '',
        username: user?.username || '',
        email: user?.email || '',
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword
      });
      
      if (response.data.user) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        toast.success("Password Updated", {
          description: "Your password has been changed successfully"
        });
        onClose();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Please try again later";
      toast.error("Password update failed", {
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-white rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#B4351C]">Change Password</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-5">
            <div>
              <label className="block text-[#B4351C] mb-2">Current Password</label>
              <Input
                name="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={handleChange}
                className="w-full border-2 border-orange-200 rounded-full px-6 py-3 focus:border-orange-500 focus:ring-0"
                disabled={loading}
                autoComplete="current-password"
                required
              />
            </div>
            
            <div>
              <label className="block text-[#B4351C] mb-2">New Password</label>
              <Input
                name="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={handleChange}
                className="w-full border-2 border-orange-200 rounded-full px-6 py-3 focus:border-orange-500 focus:ring-0"
                disabled={loading}
                autoComplete="new-password"
                required
              />
            </div>
            
            <div>
              <label className="block text-[#B4351C] mb-2">Confirm New Password</label>
              <Input
                name="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={handleChange}
                className="w-full border-2 border-orange-200 rounded-full px-6 py-3 focus:border-orange-500 focus:ring-0"
                disabled={loading}
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <Button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 text-[#B4351C] bg-white hover:bg-gray-50 border-2 border-orange-200 rounded-full"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-6 py-2 bg-[#F15A24] hover:bg-[#d94d1a] text-white rounded-full"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 