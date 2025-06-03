import React, { useState, useRef } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from '../components/ui/sonner';

const OTPVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const isPasswordReset = location.state?.isPasswordReset || false;

  React.useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  React.useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOtpChange = (value: string, index: number) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (otp[index] === '' && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast(
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-semibold text-red-700 text-base">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            Error
          </div>
          <div className="text-sm text-gray-800">Please enter the 6-digit OTP code.</div>
        </div>
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:8081/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email, 
          code: otpCode,
          isPasswordReset: isPasswordReset
        })
      });
      const result = await res.json();
      if (res.ok) {
        toast(
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 font-semibold text-green-700 text-base">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              Success
            </div>
            <div className="text-sm text-gray-800">OTP verified successfully!</div>
          </div>
        );
        setTimeout(() => {
          if (isPasswordReset) {
            navigate('/reset-password', { state: { email, code: otpCode } });
          } else {
            navigate('/login', { state: { email } });
          }
        }, 1000);
      } else {
        toast(
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 font-semibold text-red-700 text-base">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              Error
            </div>
            <div className="text-sm text-gray-800">{result.error || "Invalid OTP code."}</div>
          </div>
        );
      }
    } catch (error) {
      toast(
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-semibold text-red-700 text-base">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            Error
          </div>
          <div className="text-sm text-gray-800">OTP verification failed. Please try again.</div>
        </div>
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setResendCooldown(30);
    
    try {
      const res = await fetch('http://localhost:8081/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const result = await res.json();
      if (res.ok) {
        toast(
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 font-semibold text-green-700 text-base">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              Sent
            </div>
            <div className="text-sm text-gray-800">A new OTP code has been sent to your email.</div>
          </div>
        );
      } else {
        toast(
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 font-semibold text-red-700 text-base">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              Error
            </div>
            <div className="text-sm text-gray-800">{result.error || "Failed to send new OTP code."}</div>
          </div>
        );
      }
    } catch (error) {
      toast(
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-semibold text-red-700 text-base">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            Error
          </div>
          <div className="text-sm text-gray-800">Failed to send new OTP code. Please try again later.</div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl border-0">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">#</span>
          </div>
          <CardTitle className="text-3xl font-bold text-orange-800 mb-2">Enter OTP</CardTitle>
          <p className="text-orange-600 text-sm px-4">
            {isPasswordReset 
              ? "Please enter the OTP code sent to your email to reset your password"
              : "Please enter the 6-digit code sent to your email to verify your account"
            }
          </p>
          <p className="text-orange-600 text-xs mt-1">Email: {email}</p>
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
                  onKeyDown={(e) => handleOtpKeyDown(e, index)}
                  onFocus={handleOtpFocus}
                  ref={el => inputRefs.current[index] = el}
                  className="w-14 h-14 text-center text-2xl font-bold bg-orange-50/50 border-2 border-orange-200 focus:border-orange-400 focus:ring-orange-400 rounded-xl focus:outline-none transition-colors"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  disabled={loading}
                />
              ))}
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </Button>
          </form>

          <div className="text-center pt-4 border-t border-orange-100">
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0 || loading}
              className="text-orange-600 hover:text-orange-800 text-sm font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendCooldown > 0 ? `Resend Code (${resendCooldown})` : 'Resend Code'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OTPVerification;
