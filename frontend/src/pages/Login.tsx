import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Key, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '../components/ui/sonner';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  role: string;
  exp: number;
  [key: string]: any;
}

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.email) {
      setFormData(prev => ({ ...prev, email: location.state.email }));
    }
    if (location.state?.message) {
      toast(
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-semibold text-green-700 text-base">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Success
          </div>
          <div className="text-sm text-gray-800">{location.state.message}</div>
        </div>
      );
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      const res = await fetch('http://localhost:8081/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identifier: formData.email,
          password: formData.password
        })
      });

      const result = await res.json();
      console.log('Login response:', result);

      if (res.ok && result.token) {
        // Store token
        localStorage.setItem('token', result.token);

        // Decode token to get role
        const decoded: DecodedToken = jwtDecode(result.token);
        console.log('Decoded token:', decoded);
        console.log('User role:', decoded.role);

        localStorage.setItem('role', decoded.role || '');

        // Login using context (if needed)
        await login(formData.email, formData.password);

        toast(
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 font-semibold text-green-700 text-base">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Success
            </div>
            <div className="text-sm text-gray-800">Login successful!</div>
          </div>
        );

        // Redirect based on role
        if (decoded.role === 'admin') {
          console.log('Redirecting to admin page...');
          navigate('/admin');
        } else {
          console.log('Redirecting to profile page...');
          navigate('/profile');
        }
      } else {
        toast(
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 font-semibold text-red-700 text-base">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Error
            </div>
            <div className="text-sm text-gray-800">{result.error || "Invalid email or password"}</div>
          </div>
        );
      }
    } catch (error) {
      toast(
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-semibold text-red-700 text-base">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Error
          </div>
          <div className="text-sm text-gray-800">Failed to login. Please try again later.</div>
        </div>
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-100 to-orange-200">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl border-0">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mb-4">
            <LogIn className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-orange-800 mb-2">Sign In</CardTitle>
          <p className="text-orange-600 text-sm px-4">Welcome back! Please enter your details</p>
        </CardHeader>
        <CardContent className="space-y-4 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  disabled={loading}
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
                  placeholder="Enter your password"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="text-center">
              <Link to="/forgot-password" className="text-orange-600 hover:text-orange-800 text-sm font-medium hover:underline">
                Forgot your password?
              </Link>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="text-center pt-4 border-t border-orange-100">
            <p className="text-orange-600 text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-orange-800 font-semibold hover:text-orange-900 hover:underline">
                Create Account
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
