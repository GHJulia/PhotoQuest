
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { User, Mail, Key } from 'lucide-react';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
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
    console.log('Sign up submitted:', formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-100 to-orange-200">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl border-0">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mb-4">
            <User className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-orange-800 mb-2">Sign Up</CardTitle>
          <p className="text-orange-600 text-sm">Create your account to join Photo Quest</p>
        </CardHeader>
        <CardContent className="space-y-4 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-orange-800 font-semibold text-sm">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-orange-500" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10 h-12 bg-orange-50/50 border-orange-200 focus:border-orange-400 focus:ring-orange-400 rounded-xl"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-orange-800 font-semibold text-sm">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-orange-500" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 h-12 bg-orange-50/50 border-orange-200 focus:border-orange-400 focus:ring-orange-400 rounded-xl"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-orange-800 font-semibold text-sm">Password</Label>
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
                  placeholder="Create a password"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-orange-800 font-semibold text-sm">Confirm Password</Label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-5 w-5 text-orange-500" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10 h-12 bg-orange-50/50 border-orange-200 focus:border-orange-400 focus:ring-orange-400 rounded-xl"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Create Account
            </Button>
          </form>

          <div className="text-center pt-4 border-t border-orange-100">
            <p className="text-orange-600 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-orange-800 font-semibold hover:text-orange-900 hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;
