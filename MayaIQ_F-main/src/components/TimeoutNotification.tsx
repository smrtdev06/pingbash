import React, { useEffect, useState } from 'react';

interface TimeoutNotificationProps {
  isVisible: boolean;
  timeoutMinutes: number;
  expiresAt: string;
  onClose: () => void;
}

const TimeoutNotification: React.FC<TimeoutNotificationProps> = ({ 
  isVisible, 
  timeoutMinutes, 
  expiresAt, 
  onClose 
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!isVisible || !expiresAt) return;

    const updateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const difference = expiry - now;

      if (difference <= 0) {
        setTimeLeft('Timeout expired');
        setTimeout(onClose, 2000); // Auto-close after 2 seconds
        return;
      }

      const minutes = Math.floor(difference / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [isVisible, expiresAt, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg max-w-md w-full mx-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-white bg-opacity-20 rounded-full p-2 mr-3">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-sm">Temporarily Restricted</h4>
            <p className="text-xs opacity-90">You cannot send messages for {timeoutMinutes} minutes</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="text-white hover:text-gray-200 ml-4"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      {timeLeft && (
        <div className="mt-2 text-center">
          <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
            Time remaining: {timeLeft}
          </span>
        </div>
      )}
    </div>
  );
};

export default TimeoutNotification; 