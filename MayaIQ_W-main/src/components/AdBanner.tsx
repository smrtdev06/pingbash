import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

interface AdBannerProps {
  adSlot?: string;
  adFormat?: 'auto' | 'rectangle' | 'banner' | 'leaderboard';
  adStyle?: React.CSSProperties;
  className?: string;
  closable?: boolean;
  onClose?: () => void;
  fallbackContent?: React.ReactNode;
}

const AdBanner: React.FC<AdBannerProps> = ({
  adSlot = "1234567890", // Default demo ad slot
  adFormat = "auto",
  adStyle = { display: 'block', width: '100%', height: '90px' },
  className = "",
  closable = true,
  onClose,
  fallbackContent
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [adLoaded, setAdLoaded] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    // Load Google AdSense script if not already loaded
    const loadAdSenseScript = () => {
      if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_PUBLISHER_ID';
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
        
        script.onload = () => {
          console.log('🎯 AdSense script loaded successfully');
          initializeAd();
        };
        
        script.onerror = () => {
          console.warn('🎯 AdSense script failed to load, showing fallback');
          setShowFallback(true);
        };
      } else {
        initializeAd();
      }
    };

    const initializeAd = () => {
      try {
        if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
          setAdLoaded(true);
          console.log('🎯 AdSense ad initialized');
        } else {
          // Fallback after timeout
          setTimeout(() => {
            if (!adLoaded) {
              console.warn('🎯 AdSense not available, showing fallback');
              setShowFallback(true);
            }
          }, 3000);
        }
      } catch (error) {
        console.error('🎯 Error initializing AdSense:', error);
        setShowFallback(true);
      }
    };

    if (isVisible) {
      loadAdSenseScript();
    }
  }, [isVisible, adLoaded]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
    
    // Store closure in localStorage to remember user preference
    localStorage.setItem(`ad_banner_closed_${adSlot}`, 'true');
  };

  // Check if user previously closed this ad
  useEffect(() => {
    const wasClosed = localStorage.getItem(`ad_banner_closed_${adSlot}`);
    if (wasClosed === 'true') {
      setIsVisible(false);
    }
  }, [adSlot]);

  if (!isVisible) {
    return null;
  }

  // Fallback ad content for demo or when AdSense fails
  const FallbackAd = () => (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-gray-200 rounded-lg p-3">
      <div className="flex items-center justify-center space-x-2">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">P</span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-800">Pingbash Premium</p>
          <p className="text-xs text-gray-600">Upgrade for ad-free experience</p>
        </div>
        <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-3 py-1 rounded-full hover:opacity-90 transition-opacity">
          Upgrade
        </button>
      </div>
    </div>
  );

  return (
    <div className={`relative bg-white border-b border-gray-200 ${className}`}>
      {/* Close button */}
      {closable && (
        <button
          onClick={handleClose}
          className="absolute top-1 right-1 z-10 w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
          title="Close ad"
        >
          <FontAwesomeIcon icon={faXmark} className="w-3 h-3 text-gray-600" />
        </button>
      )}

      {/* Ad content */}
      <div className="p-2">
        {showFallback || fallbackContent ? (
          fallbackContent || <FallbackAd />
        ) : (
          <ins
            className="adsbygoogle"
            style={adStyle}
            data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
            data-ad-slot={adSlot}
            data-ad-format={adFormat}
            data-full-width-responsive="true"
          />
        )}
      </div>

      {/* Small "Ad" label for transparency */}
      <div className="absolute bottom-0 left-0 bg-gray-500 text-white text-xs px-1 rounded-tr-sm">
        Ad
      </div>
    </div>
  );
};

export default AdBanner; 