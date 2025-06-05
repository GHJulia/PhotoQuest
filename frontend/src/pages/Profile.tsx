import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
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
import { ChangePasswordModal } from '../components/ChangePasswordModal';

const Profile = () => {
  const { user, updateUserData, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize state with memoized initial values
  const initialFormData = useMemo(() => ({
    name: user?.name || '',
    surname: user?.surname || '',
    username: user?.username || '',
    email: user?.email || '',
  }), []); // Empty dependency array as this should only run once

  const [profileImage, setProfileImage] = useState<string | null>(user?.avatar_url || null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  // Update form data only when user ID changes
  useEffect(() => {
    if (user?.id) {
      setFormData({
        name: user.name || '',
        surname: user.surname || '',
        username: user.username || '',
        email: user.email || ''
      });
      setProfileImage(user.avatar_url || null);
    }
  }, [user?.id]); // Only run when user ID changes

  // Memoize stats to prevent unnecessary recalculations
  const stats = useMemo(() => [
    { icon: Trophy, label: 'Total Score', value: user?.total_score || 0 },
    { icon: ImageIcon, label: 'Photos Uploaded', value: user?.stats?.totalPhotosUploaded || 0 },
    { icon: Heart, label: 'Likes Received', value: user?.stats?.totalLikesReceived || 0 }
  ], [user?.total_score, user?.stats?.totalPhotosUploaded, user?.stats?.totalLikesReceived]);

  // Memoize handlers to prevent unnecessary re-renders
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []); // No dependencies needed as it only uses setState

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

  const handleProfileSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const trimmedData = {
        name: formData.name.trim(),
        surname: formData.surname.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        current_password: "",
        new_password: ""
      };

      // Check if any required field is empty after trimming
      if (!trimmedData.name || !trimmedData.surname || !trimmedData.username || !trimmedData.email) {
        toast.error("Missing required fields", {
          description: "Please fill in all required fields"
        });
        return;
      }

      // Check if any data has actually changed
      if (
        trimmedData.name === user?.name &&
        trimmedData.surname === user?.surname &&
        trimmedData.username === user?.username &&
        trimmedData.email === user?.email
      ) {
        toast.info("No changes to save", {
          description: "You haven't made any changes to your profile"
        });
        setIsEditing(false);
        return;
      }

      const response = await api.put('/profile', trimmedData);
      
      if (response.data.user) {
        updateUserData(response.data.user);
        toast.success("Profile Updated", {
          description: "Your changes have been saved successfully"
        });
        setIsEditing(false);
      }
    } catch (error: any) {
      console.error('Profile update error:', error.response || error);
      const errorMessage = error.response?.data?.error || "Please try again later";
      toast.error("Update failed", {
        description: errorMessage
      });
    }
  }, [formData, user, updateUserData]); // Only depend on values needed for the function

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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Info Card - Left Column */}
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

              <div className="flex flex-col gap-4">
                <Button
                  variant="ghost"
                  onClick={() => setIsChangingPassword(true)}
                  className="w-full flex items-center justify-center gap-2 bg-[#FF9B6A] hover:bg-[#FF8A50] text-white rounded-xl py-3"
                >
                  <Settings className="h-5 w-5" />
                  Change Password
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full flex items-center justify-center gap-2 bg-[#FF7070] hover:bg-[#FF5656] text-white rounded-xl py-3"
                    >
                      <Trash2 className="h-5 w-5" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure you want to delete your account?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-[#FF7070] hover:bg-[#FF5656] text-white"
                      >
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Account Settings and Statistics */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Account Settings Card */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl border-orange-100 h-fit">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <Settings className="h-7 w-7 text-orange-500" />
                    <h2 className="text-2xl font-bold text-orange-800">Account Settings</h2>
                  </div>
                  <div className="flex gap-4">
                    {isEditing ? (
                      <>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setIsEditing(false);
                            // Reset form data to current user data
                            setFormData(initialFormData);
                          }}
                          className="bg-gray-100 text-gray-600 hover:text-gray-700 hover:bg-gray-200 rounded-lg px-4 py-2"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          form="profile-form"
                          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg px-4 py-2"
                        >
                          Save Changes
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="ghost"
                        onClick={() => setIsEditing(true)}
                        className="bg-orange-100 text-orange-600 hover:text-orange-700 hover:bg-orange-200 rounded-lg px-4 py-2"
                      >
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </div>
                
                <form id="profile-form" onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-orange-800 font-medium block mb-1.5">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="Enter your name"
                        className={`bg-white/90 border-orange-200 focus:border-orange-500 focus:ring-orange-500 rounded-lg ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
                      />
                    </div>
                    <div>
                      <Label htmlFor="surname" className="text-orange-800 font-medium block mb-1.5">Surname</Label>
                      <Input
                        id="surname"
                        name="surname"
                        value={formData.surname}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="Enter your surname"
                        className={`bg-white/90 border-orange-200 focus:border-orange-500 focus:ring-orange-500 rounded-lg ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="username" className="text-orange-800 font-medium block mb-1.5">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Enter your username"
                      className={`bg-white/90 border-orange-200 focus:border-orange-500 focus:ring-orange-500 rounded-lg ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-orange-800 font-medium block mb-1.5">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Enter your email"
                      className={`bg-white/90 border-orange-200 focus:border-orange-500 focus:ring-orange-500 rounded-lg ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
                    />
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Statistics Card */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl border-orange-100 h-fit">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Trophy className="h-7 w-7 text-orange-500" />
                  <h2 className="text-2xl font-bold text-orange-800">Statistics</h2>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
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
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />

      <ChangePasswordModal
        isOpen={isChangingPassword}
        onClose={() => setIsChangingPassword(false)}
      />
    </div>
  );
};

export default Profile;
