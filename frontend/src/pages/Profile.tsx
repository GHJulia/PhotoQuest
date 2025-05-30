import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { User, Upload, Trash2, Camera } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { toast } from '@/components/ui/use-toast';

const Profile = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: 'Amelia',
    surname: 'Bennett',
    username: 'BlueberryPie',
    email: 'iloveblueberries@gmail.com',
    password: '••••••••••',
    confirmPassword: '••••••••••'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image under 5MB",
          variant: "destructive"
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
        toast({
          title: "Success!",
          description: "Profile picture updated successfully",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Profile updated:', formData);
    toast({
      title: "Profile Updated",
      description: "Your changes have been saved successfully",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FEF6E9]">
      <Navigation />
      
      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-orange-800 mb-4">Profile</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Profile Info Card */}
          <Card className="photo-card">
            <CardContent className="p-8 text-center">
              <div className="relative mb-6">
                <div className="w-32 h-32 mx-auto relative group">
                  <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-pink-400 to-red-500 p-1">
                    <div className="w-full h-full rounded-full overflow-hidden bg-white">
                      {profileImage ? (
                        <img 
                          src={profileImage} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full shadow-lg transition-transform transform hover:scale-110"
                  >
                    <Camera className="h-5 w-5" />
                  </button>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              
              <h2 className="text-2xl font-bold text-orange-800 mb-2">Amelia Bennett</h2>
              
              <div className="bg-orange-200 rounded-lg p-4 mb-6">
                <p className="text-orange-800 font-semibold">Total Score</p>
                <p className="text-2xl font-bold text-orange-900">1,000 Points</p>
              </div>
              
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full mb-4 bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Upload className="mr-2 h-4 w-4" />
                Change Picture
              </Button>
              
              <Button variant="destructive" className="w-full">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </CardContent>
          </Card>

          {/* Profile Form */}
          <Card className="photo-card">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-orange-800 mb-6 text-center">Profile</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-orange-800 font-medium">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="bg-white/90 border-orange-300 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="surname" className="text-orange-800 font-medium">Surname</Label>
                    <Input
                      id="surname"
                      name="surname"
                      value={formData.surname}
                      onChange={handleChange}
                      className="bg-white/90 border-orange-300 focus:border-orange-500"
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
                    className="bg-white/90 border-orange-300 focus:border-orange-500"
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
                    className="bg-white/90 border-orange-300 focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password" className="text-orange-800 font-medium">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="bg-white/90 border-orange-300 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword" className="text-orange-800 font-medium">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="bg-white/90 border-orange-300 focus:border-orange-500"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                  Save Changes
                </Button>
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
