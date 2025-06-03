import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { User, Upload, Trash2, Trophy, Star, Medal, ImageIcon, Heart, CheckCircle } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/axios';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";

const Profile = () => {
  const { user, updateUserData, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<string | null>(user?.avatar_url || null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    surname: user?.surname || '',
    username: user?.username || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        surname: user.surname || '',
        username: user.username || '',
        email: user.email || ''
      }));
      setProfileImage(user.avatar_url || null);
    }
  }, [user]);

  const stats = [
    { icon: Trophy, label: 'Total Score', value: user?.total_score || 0 },
    { icon: Medal, label: 'Completed Challenges', value: '15' },
    { icon: ImageIcon, label: 'Photos Uploaded', value: '24' },
    { icon: Heart, label: 'Likes Received', value: '142' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File too large", {
          description: "Please select an image under 5MB"
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error("Invalid file type", {
          description: "Please select an image file"
        });
        return;
      }

      try {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('avatar', file);

        const response = await api.post('/profile/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data.user) {
          setProfileImage(response.data.user.avatar_url);
          updateUserData(response.data.user);
          toast.success("Profile picture updated", {
            description: "Your new profile picture has been saved"
        });
        }
      } catch (error) {
        toast.error("Upload failed", {
          description: "Please try again later"
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate password fields if attempting to change password
      if (formData.newPassword || formData.currentPassword) {
        if (!formData.currentPassword) {
          toast.error("Current password required", {
            description: "Please enter your current password to change password"
          });
          return;
        }
        if (!formData.newPassword) {
          toast.error("New password required", {
            description: "Please enter a new password"
          });
          return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
          toast.error("Passwords don't match", {
            description: "Please make sure your new passwords match"
          });
          return;
        }
      }

      // Prepare update data
      const updateData = {
        name: formData.name.trim(),
        surname: formData.surname.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        ...(formData.newPassword ? {
          current_password: formData.currentPassword,
          new_password: formData.newPassword
        } : {})
      };

      // Validate required fields
      if (!updateData.name || !updateData.surname || !updateData.username || !updateData.email) {
        toast.error("Missing required fields", {
          description: "Please fill in all required fields"
        });
        return;
      }

      const response = await api.put('/profile', updateData);
      
      if (response.data.user) {
        updateUserData(response.data.user);
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        toast.success("Profile Updated", {
          description: "Your changes have been saved successfully"
        });
        setIsEditing(false);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Please try again later";
      toast.error("Update failed", {
        description: errorMessage
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete('/profile');
      toast.success("Account Deleted", {
        description: "Your account has been permanently deleted"
      });
      logout(); // This will redirect to login page
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Failed to delete account";
      toast.error("Delete failed", {
        description: errorMessage
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-orange-50 to-orange-100">
      <Navigation />
      
      <main className="flex-grow container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-orange-800 mb-4">My Profile</h1>
          <p className="text-orange-600">Manage your account and view your achievements</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Profile Info Card */}
          <Card className="lg:col-span-1 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-8">
              <div className="relative mb-8">
                <div 
                  className="w-32 h-32 mx-auto relative group cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-orange-400 to-red-500 p-1 shadow-lg group-hover:from-orange-500 group-hover:to-red-600 transition-all duration-300">
                    <div className="w-full h-full rounded-full overflow-hidden bg-white relative">
                      {profileImage ? (
                        <img 
                          src={profileImage} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-orange-100">
                          <User className="h-16 w-16 text-orange-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-all duration-300">
                        <Upload className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300" />
                      </div>
                    </div>
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <p className="text-center text-sm text-orange-600 mt-2">
                  Click to change profile picture
                </p>
              </div>
              
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-orange-800 mb-2">
                  {user?.name} {user?.surname}
                </h2>
                <p className="text-orange-600">@{user?.username}</p>
                {user?.verified && (
                  <div className="flex items-center justify-center mt-2 text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm">Verified Account</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
                    <stat.icon className="h-6 w-6 text-orange-500 mb-2" />
                    <p className="text-sm text-orange-700 font-medium">{stat.label}</p>
                    <p className="text-xl font-bold text-orange-900">{stat.value}</p>
                  </div>
                ))}
              </div>
              
              <div className="space-y-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        account and remove all your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDeleteAccount}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>

          {/* Profile Form */}
          <Card className="lg:col-span-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-orange-800">Account Settings</h2>
                <Button
                  variant="ghost"
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-100"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-orange-800 font-medium">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="bg-white/90 border-orange-200 focus:border-orange-500 disabled:opacity-70"
                    />
                  </div>
                  <div>
                    <Label htmlFor="surname" className="text-orange-800 font-medium">Surname</Label>
                    <Input
                      id="surname"
                      name="surname"
                      value={formData.surname}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="bg-white/90 border-orange-200 focus:border-orange-500 disabled:opacity-70"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="username" className="text-orange-800 font-medium">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="bg-white/90 border-orange-200 focus:border-orange-500 disabled:opacity-70"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-orange-800 font-medium">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="bg-white/90 border-orange-200 focus:border-orange-500 disabled:opacity-70"
                  />
                </div>

                {isEditing && (
                  <>
                    <Separator className="my-6" />
                    <h3 className="text-lg font-semibold text-orange-800 mb-4">Change Password</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="currentPassword" className="text-orange-800 font-medium">Current Password</Label>
                        <Input
                          id="currentPassword"
                          name="currentPassword"
                          type="password"
                          value={formData.currentPassword}
                          onChange={handleChange}
                          className="bg-white/90 border-orange-200 focus:border-orange-500"
                        />
                      </div>
                      
                  <div>
                        <Label htmlFor="newPassword" className="text-orange-800 font-medium">New Password</Label>
                    <Input
                          id="newPassword"
                          name="newPassword"
                      type="password"
                          value={formData.newPassword}
                      onChange={handleChange}
                          className="bg-white/90 border-orange-200 focus:border-orange-500"
                    />
                  </div>
                      
                  <div>
                        <Label htmlFor="confirmPassword" className="text-orange-800 font-medium">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                          className="bg-white/90 border-orange-200 focus:border-orange-500"
                    />
                  </div>
                </div>
                  </>
                )}

                {isEditing && (
                  <div className="flex justify-end space-x-4 mt-8">
                    <Button
                      type="submit"
                      className="bg-orange-500 hover:bg-orange-600 text-white min-w-[120px]"
                    >
                  Save Changes
                </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
