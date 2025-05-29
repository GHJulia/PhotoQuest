
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Key, CheckCircle } from 'lucide-react';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Reset password submitted:', formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-100 to-orange-200">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl border-0">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mb-4">
            <Key className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-orange-800 mb-2">Create New Password</CardTitle>
          <p className="text-orange-600 text-sm px-4">Please enter your new password below</p>
        </CardHeader>
        <CardContent className="space-y-4 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-orange-800 font-semibold text-sm">New Password</Label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-5 w-5 text-orange-500" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 h-12 bg-orange-50/50 border-orange-200 focus:border-orange-400 focus:ring-orange-400 rounded-xl"
                  placeholder="Enter new password"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-orange-800 font-semibold text-sm">Confirm New Password</Label>
              <div className="relative">
                <CheckCircle className="absolute left-3 top-3 h-5 w-5 text-orange-500" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10 h-12 bg-orange-50/50 border-orange-200 focus:border-orange-400 focus:ring-orange-400 rounded-xl"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Update Password
            </Button>
          </form>

          <div className="text-center pt-4 border-t border-orange-100">
            <Link to="/login" className="text-orange-600 hover:text-orange-800 text-sm font-medium hover:underline">
              Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
