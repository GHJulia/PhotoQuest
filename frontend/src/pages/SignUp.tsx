
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
    surname: '',
    username: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("❌ Passwords do not match.");
      return;
    }

    const body = new FormData();
    body.append("name", formData.name);
    body.append("surname", formData.surname);
    body.append("username", formData.username);
    body.append("email", formData.email);
    body.append("password", formData.password);

    try {
      const res = await fetch("http://localhost:8081/auth/signup", {
        method: "POST",
        body: body
      });

      const result = await res.json();

      if (res.ok) {
        alert("✅ " + result.message);
        // Optional: redirect to verify-otp
        // window.location.href = "/verify-otp";
      } else {
        alert("❌ " + result.error);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Signup failed. Server error.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-100 to-orange-200">
      <Card className="w-full max-w-xl bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl border-0">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mb-4">
            <User className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-orange-800 mb-2">Sign Up</CardTitle>
          <p className="text-orange-600 text-sm">Create your account to join Photo Quest</p>
        </CardHeader>
        <CardContent className="space-y-4 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/** Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-orange-800 font-semibold text-sm">Name</Label>
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

            {/* Surname with icon */}
            <div className="space-y-2">
              <Label htmlFor="surname" className="text-orange-800 font-semibold text-sm">Surname</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-orange-500" />
                <Input
                  id="surname"
                  name="surname"
                  type="text"
                  required
                  value={formData.surname}
                  onChange={handleChange}
                  className="pl-10 h-12 bg-orange-50/50 border-orange-200 focus:border-orange-400 focus:ring-orange-400 rounded-xl"
                  placeholder="Enter your surname"
                />
              </div>
            </div>

            {/* Username with icon */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-orange-800 font-semibold text-sm">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-orange-500" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="pl-10 h-12 bg-orange-50/50 border-orange-200 focus:border-orange-400 focus:ring-orange-400 rounded-xl"
                  placeholder="Choose a username"
                />
              </div>
            </div>

            {/** Email */}
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

            {/** Password */}
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

            {/** Confirm Password */}
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
