import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { User, Upload, Trash2, Trophy, ImageIcon, Heart, CheckCircle, Settings } from 'lucide-react';
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
    { icon: ImageIcon, label: 'Photos Uploaded', value: user?.stats?.totalPhotosUploaded || 0 },
    { icon: Heart, label: 'Likes Received', value: user?.stats?.totalLikesReceived || 0 }
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-orange-100/50 to-white">
      <Navigation />
      
      <main className="flex-grow container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-800 mb-4">
            My Profile
          </h1>
          <p className="text-lg text-orange-600 font-medium">Manage your account and view your achievements</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Profile Info Card */}
          <Card className="lg:col-span-1 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl border-orange-100">
            <CardContent className="p-8">
              <div className="relative mb-10">
                <div 
                  className="w-40 h-40 mx-auto relative group cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-orange-400 to-red-500 p-1.5 shadow-xl group-hover:from-orange-500 group-hover:to-red-600 transition-all duration-300">
                    <div className="w-full h-full rounded-full overflow-hidden bg-white relative">
                      {profileImage ? (
                        <img 
                          src={profileImage} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
                          <User className="h-20 w-20 text-orange-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-all duration-300">
                        <Upload className="h-10 w-10 text-white opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300" />
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
                <p className="text-center text-sm text-orange-600 mt-4 font-medium">
                  Click to change profile picture
                </p>
              </div>
              
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-orange-800 mb-2">
                  {user?.name} {user?.surname}
                </h2>
                <p className="text-orange-600 text-lg font-medium mb-3">@{user?.username}</p>
                {user?.verified && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1.5" />
                    <span className="text-sm font-medium">Verified Account</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 mb-10">
                {stats.map((stat, index) => (
                  <div 
                    key={index} 
                    className="bg-gradient-to-br from-white to-orange-50 rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 border border-orange-100"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-orange-100 rounded-lg p-2">
                        <stat.icon className="h-6 w-6 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-sm text-orange-600 font-medium mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold text-orange-800">{stat.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      className="w-full bg-red-500 hover:bg-red-600 transition-colors duration-300"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white rounded-2xl p-6 shadow-2xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-2xl font-bold text-red-600">Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-600">
                        This action cannot be undone. This will permanently delete your
                        account and remove all your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-6">
                      <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDeleteAccount}
                        className="bg-red-500 hover:bg-red-600 text-white rounded-lg"
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
          <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl border-orange-100">
            <CardContent className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <Settings className="h-7 w-7 text-orange-500" />
                  <h2 className="text-2xl font-bold text-orange-800">Account Settings</h2>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-orange-100 text-orange-600 hover:text-orange-700 hover:bg-orange-200 rounded-lg px-4 py-2"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-orange-800 font-medium block mb-2">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="bg-white/90 border-orange-200 focus:border-orange-500 focus:ring-orange-500 disabled:opacity-70 rounded-lg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="surname" className="text-orange-800 font-medium block mb-2">Surname</Label>
                    <Input
                      id="surname"
                      name="surname"
                      value={formData.surname}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="bg-white/90 border-orange-200 focus:border-orange-500 focus:ring-orange-500 disabled:opacity-70 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="username" className="text-orange-800 font-medium block mb-2">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="bg-white/90 border-orange-200 focus:border-orange-500 focus:ring-orange-500 disabled:opacity-70 rounded-lg"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-orange-800 font-medium block mb-2">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="bg-white/90 border-orange-200 focus:border-orange-500 focus:ring-orange-500 disabled:opacity-70 rounded-lg"
                  />
                </div>

                {isEditing && (
                  <>
                    <Separator className="my-8 bg-orange-200" />
                    <div className="bg-orange-50/50 rounded-xl p-6 border border-orange-200">
                      <h3 className="text-xl font-bold text-orange-800 mb-6">Change Password</h3>
                      
                      <div className="space-y-5">
                        <div>
                          <Label htmlFor="currentPassword" className="text-orange-800 font-medium block mb-2">Current Password</Label>
                          <Input
                            id="currentPassword"
                            name="currentPassword"
                            type="password"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            className="bg-white border-orange-200 focus:border-orange-500 focus:ring-orange-500 rounded-lg"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="newPassword" className="text-orange-800 font-medium block mb-2">New Password</Label>
                          <Input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            value={formData.newPassword}
                            onChange={handleChange}
                            className="bg-white border-orange-200 focus:border-orange-500 focus:ring-orange-500 rounded-lg"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="confirmPassword" className="text-orange-800 font-medium block mb-2">Confirm New Password</Label>
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="bg-white border-orange-200 focus:border-orange-500 focus:ring-orange-500 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {isEditing && (
                  <div className="flex justify-end mt-8">
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white min-w-[140px] rounded-lg py-2.5"
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
