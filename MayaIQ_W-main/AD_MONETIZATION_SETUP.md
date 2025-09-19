# Ad Monetization Setup Guide

This guide explains how to set up and configure ad monetization for Pingbash embedded chat groups.

## Overview

The W version now includes built-in ad monetization through Google AdSense integration. Small, non-intrusive ad banners are placed at the top of each chatbox to generate revenue.

## Features

- ✅ **Google AdSense Integration**: Full support for AdSense ads
- ✅ **Closable Ad Banners**: Users can close ads (with tracking)
- ✅ **Fallback Ads**: Beautiful fallback ads when AdSense is unavailable
- ✅ **Ad Blocker Detection**: Detects and handles ad blockers gracefully
- ✅ **Analytics Tracking**: Track impressions, clicks, and closures
- ✅ **Responsive Design**: Ads adapt to different screen sizes
- ✅ **User Preferences**: Remember when users close ads
- ✅ **Multiple Ad Placements**: Support for different ad positions

## Quick Setup

### 1. Get Google AdSense Account
1. Apply for Google AdSense at https://www.google.com/adsense/
2. Get your Publisher ID (format: `ca-pub-XXXXXXXXXXXXXXXXX`)
3. Create ad units and get ad slot IDs

### 2. Configure Environment Variables
Create a `.env.local` file in your project root:

```env
# Google AdSense Configuration
NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=ca-pub-YOUR_PUBLISHER_ID
NEXT_PUBLIC_ADSENSE_SLOT=1234567890

# Ad Configuration
NEXT_PUBLIC_ADS_ENABLED=true
NEXT_PUBLIC_AD_REFRESH_INTERVAL=30

# Analytics (optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 3. Update AdBanner Component
Edit `src/components/AdBanner.tsx` and replace `YOUR_PUBLISHER_ID` with your actual Publisher ID:

```typescript
script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_ACTUAL_PUBLISHER_ID';
```

And in the `<ins>` element:
```typescript
data-ad-client="ca-pub-YOUR_ACTUAL_PUBLISHER_ID"
```

### 4. Configure Ad Placements
Edit `src/components/AdConfig.tsx` to customize ad configurations:

```typescript
export const DEFAULT_AD_CONFIGS: Record<string, AdConfiguration> = {
  chatboxTop: {
    enabled: true,
    adSlot: "YOUR_AD_SLOT_ID",
    adFormat: "banner", // or "auto", "rectangle", "leaderboard"
    publisherId: "ca-pub-YOUR_PUBLISHER_ID",
    placement: "chatbox-top",
    refreshInterval: 30
  }
};
```

## Ad Placement Options

### Current Placements
- **Chatbox Top**: Banner ad at the top of the chat messages area (✅ Active)
- **Chatbox Bottom**: Ad below the chat input (⚪ Available)
- **Sidebar**: Ad in the sidebar area (⚪ Available)

### Adding New Placements
1. Define the placement in `AdConfig.tsx`
2. Add the `<AdBanner>` component where you want the ad
3. Configure tracking for the new placement

Example:
```tsx
<AdBanner
  adSlot={getAdConfig('newPlacement').adSlot}
  adFormat={getAdConfig('newPlacement').adFormat}
  onClose={() => trackAdClosure('new-placement', getAdConfig('newPlacement').adSlot)}
/>
```

## Ad Formats

### Supported Formats
- **auto**: Responsive ads that adapt to container
- **banner**: Standard banner ads (728x90 or similar)
- **rectangle**: Medium rectangle ads (300x250)
- **leaderboard**: Large banner ads (728x90)

### Custom Styling
Ads automatically inherit the chat's color scheme and styling. You can customize:

```tsx
<AdBanner
  adStyle={{ 
    display: 'block', 
    width: '100%', 
    height: '90px',
    borderRadius: '8px'
  }}
  className="my-custom-ad-class"
/>
```

## Revenue Optimization

### Best Practices
1. **Placement**: Top of chatbox gets highest visibility
2. **Format**: Use "auto" format for best performance
3. **User Experience**: Keep ads non-intrusive and closable
4. **Analytics**: Monitor performance through Google Analytics

### Performance Monitoring
The system tracks:
- **Ad Impressions**: When ads are displayed
- **Ad Clicks**: When users click ads
- **Ad Closures**: When users close ads
- **Ad Blocker Detection**: Users with ad blockers

Access tracking data through Google Analytics or custom logging.

## Fallback Advertising

When AdSense is unavailable, the system shows fallback ads promoting:
- Pingbash Premium subscriptions
- Ad-free experiences
- Platform features

Customize fallback content in the `FallbackAd` component:

```tsx
const FallbackAd = () => (
  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-gray-200 rounded-lg p-3">
    {/* Your custom fallback content */}
  </div>
);
```

## Testing

### Development Mode
- Ads are always enabled in development
- Shows fallback ads by default
- Test with your actual AdSense account before production

### Production Testing
1. Deploy with test ad units first
2. Verify ads load correctly
3. Test ad blocking scenarios
4. Monitor performance metrics

## Troubleshooting

### Common Issues

**Ads not showing:**
- Check Publisher ID is correct
- Verify ad slot IDs
- Ensure domain is approved by AdSense
- Check browser console for errors

**AdSense policy violations:**
- Ensure ads are clearly labeled
- Don't encourage clicks
- Follow AdSense content policies
- Maintain good user experience

**Low revenue:**
- Optimize ad placement
- Use responsive ad formats
- Monitor click-through rates
- Consider multiple ad placements

### Debug Mode
Enable debug logging by checking browser console for messages starting with `🎯`.

## Revenue Estimates

Based on typical embedded chat usage:
- **Impressions**: 100-1000 per day per active group
- **CTR**: 0.5-2% for well-placed ads
- **Revenue**: $0.50-$5.00 per 1000 impressions (varies by niche)

## Legal Considerations

1. **Privacy Policy**: Update to mention ad cookies
2. **Terms of Service**: Include ad revenue sharing terms
3. **GDPR Compliance**: Handle consent for ad tracking
4. **AdSense Compliance**: Follow all Google AdSense policies

## Support

For issues with ad monetization:
1. Check Google AdSense documentation
2. Verify implementation against this guide
3. Test in incognito mode to avoid ad blockers
4. Monitor browser console for errors

---

**Note**: This monetization system is designed to be non-intrusive and user-friendly while maximizing revenue potential. Always prioritize user experience over ad revenue. 