import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { User, Upload, Trash2 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const Profile = () => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Profile updated:', formData);
  };

  return (
    <div className="min-h-screen bg-[#FEF6E9]">
      <Navigation />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-orange-800 mb-4">Profile</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Profile Info Card */}
          <Card className="photo-card">
            <CardContent className="p-8 text-center">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-red-500 rounded-full mx-auto flex items-center justify-center mb-4">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                    <User className="h-12 w-12 text-gray-600" />
                  </div>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-orange-800 mb-2">Amelia Bennett</h2>
              
              <div className="bg-orange-200 rounded-lg p-4 mb-6">
                <p className="text-orange-800 font-semibold">Total Score</p>
                <p className="text-2xl font-bold text-orange-900">1,000 Points</p>
              </div>
              
              <Button className="w-full mb-4 bg-orange-500 hover:bg-orange-600 text-white">
                <Upload className="mr-2 h-4 w-4" />
                Upload Picture
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

                <Button type="submit" className="w-full game-button mt-6">
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
