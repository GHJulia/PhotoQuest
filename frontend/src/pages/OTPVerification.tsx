
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const OTPVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('OTP submitted:', otp.join(''));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl border-0">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">#</span>
          </div>
          <CardTitle className="text-3xl font-bold text-orange-800 mb-2">Enter OTP</CardTitle>
          <p className="text-orange-600 text-sm px-4">Please enter the 6-digit code sent to your phone</p>
        </CardHeader>
        <CardContent className="space-y-4 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center space-x-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  className="w-14 h-14 text-center text-2xl font-bold bg-orange-50/50 border-2 border-orange-200 focus:border-orange-400 focus:ring-orange-400 rounded-xl focus:outline-none transition-colors"
                />
              ))}
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Verify Code
            </Button>
          </form>

          <div className="text-center pt-4 border-t border-orange-100">
            <Link to="/forgot-password" className="text-orange-600 hover:text-orange-800 text-sm font-medium hover:underline">
              Resend Code
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OTPVerification;
