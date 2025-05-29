
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Forgot password submitted:', email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-100 to-orange-200">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl border-0">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-orange-800 mb-2">Reset Password</CardTitle>
          <p className="text-orange-600 text-sm px-4">Enter your email address and we'll send you a link to reset your password</p>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-orange-50/50 border-orange-200 focus:border-orange-400 focus:ring-orange-400 rounded-xl"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Send Reset Link
            </Button>
          </form>

          <div className="text-center pt-4 border-t border-orange-100">
            <Link 
              to="/login" 
              className="inline-flex items-center text-orange-600 hover:text-orange-800 text-sm font-medium hover:underline"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
