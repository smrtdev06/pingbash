import React from 'react';

// Ad configuration for different placements
export interface AdConfiguration {
  enabled: boolean;
  adSlot: string;
  adFormat: 'auto' | 'rectangle' | 'banner' | 'leaderboard';
  publisherId: string;
  placement: 'chatbox-top' | 'chatbox-bottom' | 'sidebar' | 'modal';
  refreshInterval?: number; // in seconds
}

// Default ad configurations
export const DEFAULT_AD_CONFIGS: Record<string, AdConfiguration> = {
  chatboxTop: {
    enabled: true,
    adSlot: "1234567890",
    adFormat: "banner",
    publisherId: "ca-pub-YOUR_PUBLISHER_ID",
    placement: "chatbox-top",
    refreshInterval: 30
  },
  chatboxBottom: {
    enabled: false,
    adSlot: "0987654321",
    adFormat: "rectangle",
    publisherId: "ca-pub-YOUR_PUBLISHER_ID",
    placement: "chatbox-bottom",
    refreshInterval: 60
  },
  sidebar: {
    enabled: false,
    adSlot: "1122334455",
    adFormat: "auto",
    publisherId: "ca-pub-YOUR_PUBLISHER_ID",
    placement: "sidebar",
    refreshInterval: 45
  }
};

// Environment-based ad settings
export const getAdConfig = (placement: string): AdConfiguration => {
  const config = DEFAULT_AD_CONFIGS[placement];
  
  // In development, show fallback ads
  if (process.env.NODE_ENV === 'development') {
    return {
      ...config,
      enabled: true, // Always show ads in development for testing
    };
  }
  
  // In production, use environment variables if available
  return {
    ...config,
    publisherId: process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || config.publisherId,
    adSlot: process.env.NEXT_PUBLIC_ADSENSE_SLOT || config.adSlot,
  };
};

// Ad revenue tracking
export const trackAdImpression = (placement: string, adSlot: string) => {
  // Track ad impressions for analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'ad_impression', {
      event_category: 'monetization',
      event_label: placement,
      custom_parameter_1: adSlot
    });
  }
  
  console.log(`🎯 Ad impression tracked: ${placement} - ${adSlot}`);
};

export const trackAdClick = (placement: string, adSlot: string) => {
  // Track ad clicks for analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'ad_click', {
      event_category: 'monetization',
      event_label: placement,
      custom_parameter_1: adSlot
    });
  }
  
  console.log(`🎯 Ad click tracked: ${placement} - ${adSlot}`);
};

export const trackAdClosure = (placement: string, adSlot: string) => {
  // Track when users close ads
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'ad_closed', {
      event_category: 'monetization',
      event_label: placement,
      custom_parameter_1: adSlot
    });
  }
  
  console.log(`🎯 Ad closure tracked: ${placement} - ${adSlot}`);
};

// Ad blocker detection
export const detectAdBlocker = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const testAd = document.createElement('div');
    testAd.innerHTML = '&nbsp;';
    testAd.className = 'adsbox';
    testAd.style.position = 'absolute';
    testAd.style.left = '-10000px';
    testAd.style.width = '1px';
    testAd.style.height = '1px';
    
    document.body.appendChild(testAd);
    
    setTimeout(() => {
      const isBlocked = testAd.offsetHeight === 0;
      document.body.removeChild(testAd);
      resolve(isBlocked);
    }, 100);
  });
};

// Component for ad configuration management (for admin use)
interface AdConfigManagerProps {
  onConfigChange?: (config: Record<string, AdConfiguration>) => void;
}

export const AdConfigManager: React.FC<AdConfigManagerProps> = ({ onConfigChange }) => {
  const [configs, setConfigs] = React.useState(DEFAULT_AD_CONFIGS);
  
  const updateConfig = (placement: string, updates: Partial<AdConfiguration>) => {
    const newConfigs = {
      ...configs,
      [placement]: { ...configs[placement], ...updates }
    };
    setConfigs(newConfigs);
    onConfigChange?.(newConfigs);
  };
  
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Ad Configuration</h3>
      
      {Object.entries(configs).map(([placement, config]) => (
        <div key={placement} className="mb-4 p-3 bg-white rounded border">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium capitalize">{placement.replace(/([A-Z])/g, ' $1')}</h4>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => updateConfig(placement, { enabled: e.target.checked })}
                className="mr-2"
              />
              Enabled
            </label>
          </div>
          
          {config.enabled && (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <label className="block text-gray-600">Ad Slot:</label>
                <input
                  type="text"
                  value={config.adSlot}
                  onChange={(e) => updateConfig(placement, { adSlot: e.target.value })}
                  className="w-full px-2 py-1 border rounded"
                />
              </div>
              <div>
                <label className="block text-gray-600">Format:</label>
                <select
                  value={config.adFormat}
                  onChange={(e) => updateConfig(placement, { adFormat: e.target.value as any })}
                  className="w-full px-2 py-1 border rounded"
                >
                  <option value="auto">Auto</option>
                  <option value="banner">Banner</option>
                  <option value="rectangle">Rectangle</option>
                  <option value="leaderboard">Leaderboard</option>
                </select>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}; 