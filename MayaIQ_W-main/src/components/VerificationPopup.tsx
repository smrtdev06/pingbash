import React, { useState, useRef, useEffect } from 'react';
import toast from "react-hot-toast";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (email: string, otp: string) => void;
  email: string;
  onResendCode: (email: string) => void;
};

export const VerificationPopup: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  onVerify, 
  email,
  onResendCode 
}) => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  // Reset when popup opens
  useEffect(() => {
    if (isOpen) {
      setOtp(['', '', '', '']);
      setTimeLeft(300);
      setCanResend(false);
      // Focus first input
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 4) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = (otpCode?: string) => {
    const code = otpCode || otp.join('');
    if (code.length !== 4) {
      toast.error("Please enter the complete 4-digit verification code.");
      return;
    }
    onVerify(email, code);
  };

  const handleResend = () => {
    if (!canResend) return;
    onResendCode(email);
    setTimeLeft(300);
    setCanResend(false);
    toast.success("Verification code resent!");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="relative bg-white p-8 rounded-lg shadow-xl w-96 max-w-md">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-5 text-gray-500 hover:text-gray-800 text-2xl"
        >
          ×
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Email</h2>
          <p className="text-gray-600 text-sm">
            We've sent a 4-digit verification code to<br />
            <span className="font-semibold text-blue-600">{email}</span>
          </p>
        </div>

        {/* OTP Input */}
        <div className="flex justify-center space-x-3 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="0"
            />
          ))}
        </div>

        {/* Timer */}
        <div className="text-center mb-6">
          {timeLeft > 0 ? (
            <p className="text-sm text-gray-600">
              Code expires in <span className="font-mono font-bold text-red-500">{formatTime(timeLeft)}</span>
            </p>
          ) : (
            <p className="text-sm text-red-500 font-semibold">Verification code has expired</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => handleVerify()}
            disabled={otp.join('').length !== 4}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Verify Account
          </button>

          <button
            onClick={handleResend}
            disabled={!canResend}
            className="w-full text-blue-600 py-2 rounded-lg font-semibold hover:bg-blue-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {canResend ? 'Resend Code' : `Resend in ${formatTime(timeLeft)}`}
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            Didn't receive the code? Check your spam folder or click "Resend Code" when available.
          </p>
        </div>
      </div>
    </div>
  );
}; 